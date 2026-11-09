#!/usr/bin/env node
/**
 * 合并 export-library-snapshot.figma.js 的分段输出，写入 Token 库快照。
 *
 * 输入：tokens/figma/.chunks/ 下的 meta.json、variables-*.json、styles.json、checksums.json（可选）
 * 输出：tokens/figma/hyperos-design-token.snapshot.json（LibrarySnapshot，见 src/lib/token-check/types.ts）
 *
 * 用法：node scripts/token-check/merge-snapshot.mjs [--chunks <dir>] [--out <file>]
 *
 * 别名解析规则：沿别名链逐级解析；跨集合时按同名模式（Light / Dark）取值，
 * 目标集合没有同名模式时用其默认模式。解析失败或出现循环时报错并以非零状态退出。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? path.resolve(args[i + 1]) : fallback;
};
const chunkDir = argOf('--chunks', path.join(root, 'tokens/figma/.chunks'));
const outFile = argOf('--out', path.join(root, 'tokens/figma/hyperos-design-token.snapshot.json'));

const FILE_KEY = '5gZYD8i6JqBvsaS7yvnO9c';
const FILE_NAME = 'HyperOS Design Token';
const TIER = { 'Reference Token': 'reference', 'Semantic Token': 'semantic', 'Component Token': 'component' };
const TYPE = { C: 'COLOR', F: 'FLOAT', S: 'STRING', B: 'BOOLEAN' };

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(chunkDir, name), 'utf8'));
const fnv = (str) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
};
const errors = [];

const meta = readJson('meta.json');
const checksums = fs.existsSync(path.join(chunkDir, 'checksums.json')) ? readJson('checksums.json') : null;
if (!checksums) console.warn('提示：未找到 checksums.json，跳过转录校验');

// 1. 读取并校验变量分段
const chunkFiles = fs
  .readdirSync(chunkDir)
  .filter((f) => /^variables-\d+\.json$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
const rows = [];
for (const f of chunkFiles) {
  const chunk = readJson(f);
  if (chunk.offset !== rows.length) errors.push(`${f}: offset ${chunk.offset} 与已合并行数 ${rows.length} 不连续`);
  if (checksums) {
    const expect = checksums.variables[String(chunk.offset)];
    const got = fnv(JSON.stringify(chunk.rows));
    if (expect !== got) errors.push(`${f}: 校验和不一致（Figma ${expect}，本地 ${got}），请重新导出该段`);
  }
  rows.push(...chunk.rows);
}
const expectedTotal = meta.collections.reduce((n, c) => n + c.variableCount, 0);
if (rows.length !== expectedTotal) errors.push(`变量行数 ${rows.length} ≠ meta 总数 ${expectedTotal}`);

const stylesChunk = readJson('styles.json');
if (checksums && fnv(JSON.stringify(stylesChunk.rows)) !== checksums.styles) errors.push('styles.json 校验和不一致');

// 2. 建索引
const cols = meta.collections; // 已按名称排序，行内的集合序号指向这里
const byId = new Map();
for (const r of rows) {
  const [key, id, name, ci, t, scopes, description, hidden, vals] = r;
  byId.set(id, { key, id, name, ci, type: TYPE[t], scopes, description, hidden, vals });
}

// 3. 别名解析
const resolve = (v, modeName, trail = []) => {
  if (trail.includes(v.id)) throw new Error(`循环别名：${[...trail, v.id].map((i) => byId.get(i)?.name ?? i).join(' → ')}`);
  const col = cols[v.ci];
  let mi = col.modes.findIndex((m) => m.name === modeName);
  if (mi < 0) mi = col.modes.findIndex((m) => m.id === col.defaultModeId);
  const raw = v.vals[mi];
  if (Array.isArray(raw)) {
    const target = byId.get(raw[0]);
    if (!target) throw new Error(`${v.name} 的别名目标 VariableID:${raw[0]} 不在快照中`);
    return resolve(target, modeName, [...trail, v.id]);
  }
  if (raw === null || raw === undefined) throw new Error(`${v.name} 在模式 ${modeName} 没有值`);
  return raw;
};

const failures = [];
const variables = [];
for (const v of byId.values()) {
  const col = cols[v.ci];
  const aliasOf = {};
  const resolved = {};
  col.modes.forEach((m, mi) => {
    const raw = v.vals[mi];
    aliasOf[m.name] = Array.isArray(raw) ? (byId.get(raw[0])?.name ?? `VariableID:${raw[0]}`) : null;
    try {
      resolved[m.name] = resolve(v, m.name);
    } catch (e) {
      failures.push(e.message);
    }
  });
  variables.push({
    key: v.key,
    id: `VariableID:${v.id}`,
    name: v.name,
    collection: col.name,
    tier: TIER[col.name],
    type: v.type,
    scopes: v.scopes ? v.scopes.split(',') : [],
    description: v.description,
    hiddenFromPublishing: v.hidden === 1,
    aliasOf,
    resolved,
  });
}
errors.push(...failures);

// 4. 样式
const styles = stylesChunk.rows.map(([key, id, name, styleType, description, font]) => {
  const s = { key, id, name, styleType, description };
  if (font) s.font = { family: font[0], style: font[1], size: font[2], lineHeight: font[3] };
  return s;
});

// 5. 排序与输出
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
variables.sort((a, b) => cmp(a.collection, b.collection) || cmp(a.name, b.name));
styles.sort((a, b) => cmp(a.styleType, b.styleType) || cmp(a.name, b.name));

if (errors.length) {
  console.error(`合并失败（${errors.length} 个问题）：\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

const snapshot = {
  source: { fileKey: FILE_KEY, fileName: FILE_NAME, exportedAt: new Date().toISOString() },
  collections: cols.map((c) => ({ name: c.name, tier: TIER[c.name], modes: c.modes.map((m) => m.name) })),
  variables,
  styles,
};
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2) + '\n');
console.log(`已写入 ${path.relative(root, outFile)}：变量 ${variables.length}，样式 ${styles.length}`);
