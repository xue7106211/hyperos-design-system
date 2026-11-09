#!/usr/bin/env node
/**
 * 把 export-legacy-kit-variables.figma.js 返回的 rows 写成仓库快照。
 * 用法：node scripts/token-check/write-legacy-snapshot.mjs <rows.json>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const input = process.argv[2];
if (!input) {
  console.error('用法：node scripts/token-check/write-legacy-snapshot.mjs <rows.json>');
  process.exit(1);
}
const rows = JSON.parse(readFileSync(input, 'utf8'));
const seen = new Set();
const variables = rows
  .map(([key, id, name, collection, type]) => ({ key, id: `VariableID:${id}`, name, collection, type }))
  .filter((v) => (seen.has(v.key) ? false : seen.add(v.key)))
  .sort((a, b) => a.collection.localeCompare(b.collection) || a.name.localeCompare(b.name));

const snapshot = {
  source: {
    fileKey: '7PVSm4yEbknNLFaqauI4EM',
    fileName: 'Xiaomi Hyper OS5 UI Kit',
    exportedAt: new Date().toISOString(),
    note: '旧版 Kit 变量：集合已删除但仍被图层绑定，扫描全部页面得到',
  },
  variables,
};
const out = 'tokens/figma/miuix-kit-legacy-variables.json';
writeFileSync(out, `${JSON.stringify(snapshot, null, 2)}\n`);
const counts = {};
for (const v of variables) counts[v.collection] = (counts[v.collection] ?? 0) + 1;
console.log(`写入 ${out}：${variables.length} 个变量`, counts);
