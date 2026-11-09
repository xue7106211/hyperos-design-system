/**
 * 导出 MIUIX UI Kit 中仍被使用的「旧版 Kit 变量」清单（只读）。
 *
 * 背景：UI Kit（7PVSm4yEbknNLFaqauI4EM）里的旧变量集合（1. feature token、3.Radius token 等）
 * 已被删除，getLocalVariablesAsync 返回空，但图层上的绑定仍然有效。所以只能扫描全部页面，
 * 收集绑定的本地变量 id，再用 getVariableByIdAsync 解析出 key / 名称 / 集合。
 *
 * 刷新步骤：
 * 1. 在 Agent 中用 Figma MCP `use_figma` 运行本文件内容（fileKey=7PVSm4yEbknNLFaqauI4EM），约 70 秒。
 * 2. 把返回的 rows 保存为 JSON 数组文件，例如 /tmp/legacy_rows.json。
 * 3. 运行 `node scripts/token-check/write-legacy-snapshot.mjs /tmp/legacy_rows.json`，
 *    写入 tokens/figma/miuix-kit-legacy-variables.json。
 * 4. 检查集合计数后提交。
 */
const ids = new Set();
const add = (b) => {
  if (!b) return;
  if (Array.isArray(b)) b.forEach(add);
  else if (typeof b.id === 'string') ids.add(b.id);
  else if (typeof b === 'object') Object.values(b).forEach(add);
};
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  page.findAll((n) => {
    try {
      add(n.boundVariables);
    } catch (e) {}
    return false;
  });
}
const styles = [
  ...(await figma.getLocalPaintStylesAsync()),
  ...(await figma.getLocalTextStylesAsync()),
  ...(await figma.getLocalEffectStylesAsync()),
];
for (const s of styles) {
  try {
    add(s.boundVariables);
  } catch (e) {}
}
const colName = {};
const rows = [];
for (const id of [...ids].filter((i) => !i.includes('/'))) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (!v) continue;
  if (!(v.variableCollectionId in colName)) {
    colName[v.variableCollectionId] = (await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId))?.name ?? '';
  }
  rows.push([v.key, id.replace('VariableID:', ''), v.name, colName[v.variableCollectionId], v.resolvedType]);
}
return { count: rows.length, rows };
