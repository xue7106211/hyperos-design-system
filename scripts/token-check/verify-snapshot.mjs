#!/usr/bin/env node
/**
 * 校验 Token 库快照 tokens/figma/hyperos-design-token.snapshot.json。
 *
 * 检查：变量 / 样式 key 唯一、id 唯一、变量与样式数量、每个变量 resolved 含 Light 与 Dark、
 * 颜色格式（#RRGGBB / #RRGGBBAA，大写）、FLOAT 为数字、aliasOf 指向快照内存在的变量、
 * TEXT 样式带 font、排序符合约定。打印各集合计数与描述覆盖。
 *
 * 用法：node scripts/token-check/verify-snapshot.mjs [快照路径] [--expect-variables 946] [--expect-styles 140]
 * 有错误时以非零状态退出。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? Number(args[i + 1]) : fallback;
};
const file = path.resolve(args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--')) ??
  path.join(root, 'tokens/figma/hyperos-design-token.snapshot.json'));
const EXPECT_VARIABLES = flag('--expect-variables', 946);
const EXPECT_STYLES = flag('--expect-styles', 140);

const snap = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
const err = (m) => errors.length < 50 && errors.push(m);

const COLOR_RE = /^#[0-9A-F]{6}([0-9A-F]{2})?$/;
const TIERS = new Set(['reference', 'semantic', 'component']);
const STYLE_TYPES = new Set(['TEXT', 'FILL', 'EFFECT', 'GRID']);

if (!snap.source?.fileKey || !snap.source?.fileName || Number.isNaN(Date.parse(snap.source?.exportedAt))) {
  err('source 缺少 fileKey / fileName / 合法的 exportedAt');
}

const colByName = new Map(snap.collections.map((c) => [c.name, c]));
for (const c of snap.collections) {
  if (!TIERS.has(c.tier)) err(`集合 ${c.name} 的 tier 非法：${c.tier}`);
  for (const m of ['Light', 'Dark']) if (!c.modes.includes(m)) err(`集合 ${c.name} 缺少模式 ${m}`);
}

// 变量
const keys = new Set();
const ids = new Set();
const names = new Set(snap.variables.map((v) => v.name));
const perCol = {};
let withDesc = 0;
let aliasCount = 0;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
snap.variables.forEach((v, i) => {
  const where = `${v.collection}/${v.name}`;
  if (keys.has(v.key)) err(`变量 key 重复：${v.key}（${where}）`);
  keys.add(v.key);
  if (ids.has(v.id)) err(`变量 id 重复：${v.id}`);
  ids.add(v.id);
  if (!/^[0-9a-f]{40}$/.test(v.key)) err(`变量 key 格式异常：${where} ${v.key}`);
  if (!/^VariableID:\d+:\d+$/.test(v.id)) err(`变量 id 格式异常：${where} ${v.id}`);
  const col = colByName.get(v.collection);
  if (!col) err(`变量所属集合不存在：${where}`);
  else if (col.tier !== v.tier) err(`变量 tier 与集合不一致：${where}`);
  if (!Array.isArray(v.scopes)) err(`scopes 不是数组：${where}`);
  if (typeof v.description !== 'string') err(`description 不是字符串：${where}`);
  if (typeof v.hiddenFromPublishing !== 'boolean') err(`hiddenFromPublishing 不是布尔值：${where}`);
  for (const m of ['Light', 'Dark']) {
    if (!(m in v.resolved)) err(`resolved 缺少 ${m}：${where}`);
    if (!(m in v.aliasOf)) err(`aliasOf 缺少 ${m}：${where}`);
    const val = v.resolved[m];
    if (v.type === 'COLOR' && !(typeof val === 'string' && COLOR_RE.test(val))) err(`颜色格式非法：${where} ${m}=${val}`);
    if (v.type === 'FLOAT' && typeof val !== 'number') err(`FLOAT 值不是数字：${where} ${m}=${val}`);
    if (v.type === 'STRING' && typeof val !== 'string') err(`STRING 值不是字符串：${where} ${m}=${val}`);
    if (v.type === 'BOOLEAN' && typeof val !== 'boolean') err(`BOOLEAN 值不是布尔值：${where} ${m}=${val}`);
    const a = v.aliasOf[m];
    if (a !== null && !names.has(a)) err(`aliasOf 指向不存在的变量：${where} ${m} → ${a}`);
  }
  if (Object.values(v.aliasOf).some((a) => a !== null)) aliasCount++;
  if (v.description.trim()) withDesc++;
  const pc = (perCol[v.collection] ??= { total: 0, withDescription: 0, alias: 0, hidden: 0, types: {} });
  pc.total++;
  if (v.description.trim()) pc.withDescription++;
  if (Object.values(v.aliasOf).some((a) => a !== null)) pc.alias++;
  if (v.hiddenFromPublishing) pc.hidden++;
  pc.types[v.type] = (pc.types[v.type] ?? 0) + 1;
  const prev = snap.variables[i - 1];
  if (prev && (cmp(prev.collection, v.collection) || cmp(prev.name, v.name)) > 0) err(`变量未按 collection→name 排序：${where}`);
});

// 样式
const styleKeys = new Set();
const perType = {};
let styleWithDesc = 0;
snap.styles.forEach((s, i) => {
  if (styleKeys.has(s.key)) err(`样式 key 重复：${s.key}（${s.name}）`);
  styleKeys.add(s.key);
  if (!STYLE_TYPES.has(s.styleType)) err(`样式类型非法：${s.name} ${s.styleType}`);
  if (s.styleType === 'TEXT') {
    const f = s.font;
    if (!f || typeof f.family !== 'string' || typeof f.style !== 'string' || typeof f.size !== 'number') err(`TEXT 样式缺少 font：${s.name}`);
    else if (!(typeof f.lineHeight === 'number' || f.lineHeight === 'AUTO' || /^\d+(\.\d+)?%$/.test(f.lineHeight))) err(`lineHeight 非法：${s.name} ${f.lineHeight}`);
  } else if (s.font) err(`非 TEXT 样式不应有 font：${s.name}`);
  if (s.description.trim()) styleWithDesc++;
  perType[s.styleType] = (perType[s.styleType] ?? 0) + 1;
  const prev = snap.styles[i - 1];
  if (prev && (cmp(prev.styleType, s.styleType) || cmp(prev.name, s.name)) > 0) err(`样式未按 styleType→name 排序：${s.name}`);
});

if (snap.variables.length !== EXPECT_VARIABLES) err(`变量数 ${snap.variables.length} ≠ 期望 ${EXPECT_VARIABLES}`);
if (snap.styles.length !== EXPECT_STYLES) err(`样式数 ${snap.styles.length} ≠ 期望 ${EXPECT_STYLES}`);

// 输出
const size = fs.statSync(file).size;
console.log(`快照：${path.relative(root, file)}（${(size / 1024).toFixed(1)} KB）`);
console.log(`来源：${snap.source.fileName} / ${snap.source.fileKey} / ${snap.source.exportedAt}`);
console.log(`变量 ${snap.variables.length}（有描述 ${withDesc}，含别名 ${aliasCount}）`);
for (const [name, c] of Object.entries(perCol)) {
  const types = Object.entries(c.types).map(([t, n]) => `${t} ${n}`).join('，');
  console.log(`  ${name}：${c.total}（有描述 ${c.withDescription}，含别名 ${c.alias}，hidden ${c.hidden}；${types}）`);
}
console.log(`样式 ${snap.styles.length}（有描述 ${styleWithDesc}）：${Object.entries(perType).map(([t, n]) => `${t} ${n}`).join('，')}`);

if (errors.length) {
  console.error(`\n校验失败（${errors.length}${errors.length >= 50 ? '+' : ''} 个问题）：\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('\n校验通过');
