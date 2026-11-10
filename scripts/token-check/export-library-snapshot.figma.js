/*
 * HyperOS Design Token 库快照导出（Figma Plugin API，只读）
 * =========================================================
 *
 * 用途
 *   读取 Figma 文件 5gZYD8i6JqBvsaS7yvnO9c（HyperOS Design Token）的本地变量与样式，
 *   分段返回紧凑数据；再由 merge-snapshot.mjs 在本地合并成
 *   tokens/figma/hyperos-design-token.snapshot.json（类型见 src/lib/token-check/types.ts 的 LibrarySnapshot）。
 *
 * 为什么分段 + 本地合并
 *   - Variables REST API 需要 Enterprise 计划，只能通过 Figma MCP 的 use_figma 读取。
 *   - use_figma 沙箱没有 fetch，数据只能经 return 返回给 Agent，由 Agent 原样存盘；
 *     单次返回体积有限，所以每次最多 150 个变量。
 *   - 别名解析（resolved）在本地 merge-snapshot.mjs 里做，Figma 端只返回每个模式的原始值
 *     （字面量，或别名目标 id），返回体积更小。
 *
 * 刷新步骤（在 Agent 中执行）
 *   1. 先加载 figma-use 技能，再调用 Figma MCP 工具 use_figma：
 *        fileKey    = 5gZYD8i6JqBvsaS7yvnO9c
 *        skillNames = "figma-use"
 *        code       = 本文件从 `const MODE` 开始的全部代码（不要包 IIFE；本脚本只读，不写 Figma）
 *   2. 依次修改顶部的 MODE / OFFSET / LIMIT 运行，每次把 return 的 JSON 原样存到 tokens/figma/.chunks/：
 *        MODE='meta'                                   → meta.json（集合、模式、变量数、样式数）
 *        MODE='checksums'                              → checksums.json（每段 FNV-1a 校验和）
 *        MODE='variables', OFFSET=0,   LIMIT=150       → variables-000.json
 *        MODE='variables', OFFSET=150, LIMIT=150       → variables-150.json
 *        ……每次 OFFSET += 150，直到返回的 next 为 null（946 个变量共 7 段：0/150/…/900）
 *        MODE='styles'                                 → styles.json（全部样式，一次返回）
 *      变量按集合名 → 变量名排序后切片，多次运行的分段边界稳定。LIMIT 必须与 checksums 时一致。
 *      若 meta 中的 variableCount 变了，以实际数量为准，分段数随之变化。
 *   3. 合并并写入快照：
 *        node scripts/token-check/merge-snapshot.mjs
 *      它会逐段比对 checksums.json（转录出错会报出具体分段，重导该段即可），
 *      解析别名链（跨集合按同名模式 Light / Dark 取值，目标集合无同名模式时用默认模式），
 *      检测循环与悬空别名，按 collection→name、styleType→name 排序，2 空格缩进写入快照。
 *   4. 提交前校验：
 *        node scripts/token-check/verify-snapshot.mjs [--expect-variables 946] [--expect-styles 140]
 *      校验 key 唯一、数量、每个变量 resolved 含 Light 与 Dark、颜色格式合法，并打印各集合计数。
 *      数量与默认期望不同时，先确认是库的真实变化，再带上新的期望值运行。
 *   5. 删除 tokens/figma/.chunks/，只提交快照文件。
 *
 * 返回格式（紧凑行，供 merge-snapshot.mjs 解码）
 *   variables: rows[i] = [key, id(去掉 "VariableID:" 前缀), name, 集合序号(按名称排序), 类型(C/F/S/B),
 *                         scopes(逗号分隔), description, hiddenFromPublishing(0/1),
 *                         [每个模式的值，按集合 modes 顺序]]
 *              值：颜色 "#RRGGBB" / "#RRGGBBAA"（大写）；数字；字符串；布尔；别名为 ["目标 id"]
 *   styles:    rows[i] = [key, id, name, styleType, description, font|null]
 *              font = [family, style, size, lineHeight]（PIXELS→数字，AUTO→"AUTO"，PERCENT→"150%"）
 */

const MODE = 'variables'; // 'meta' | 'variables' | 'styles' | 'checksums'
const OFFSET = 0;
const LIMIT = 150;

const hex2 = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
const colorHex = (c) => {
  const a = c.a === undefined ? 1 : c.a;
  return ('#' + hex2(c.r) + hex2(c.g) + hex2(c.b) + (a < 1 ? hex2(a) : '')).toUpperCase();
};
const shortId = (id) => id.replace(/^VariableID:/, '');
const byName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
// FNV-1a 32 位，按 UTF-16 码元计算 JSON.stringify(rows)，用于本地核对转录是否完整
const fnv = (str) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
};

const collections = (await figma.variables.getLocalVariableCollectionsAsync()).slice().sort(byName);

const variableRows = async () => {
  const typeCode = { COLOR: 'C', FLOAT: 'F', STRING: 'S', BOOLEAN: 'B' };
  const localIds = new Set(collections.flatMap((c) => c.variableIds));
  const external = new Set();
  const rows = [];
  for (let ci = 0; ci < collections.length; ci++) {
    const c = collections[ci];
    const vars = [];
    for (const id of c.variableIds) {
      const v = await figma.variables.getVariableByIdAsync(id);
      if (v) vars.push(v);
    }
    vars.sort(byName);
    for (const v of vars) {
      const vals = c.modes.map((m) => {
        const raw = v.valuesByMode[m.modeId];
        if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
          if (!localIds.has(raw.id)) external.add(raw.id);
          return [shortId(raw.id)];
        }
        if (raw && typeof raw === 'object' && 'r' in raw) return colorHex(raw);
        return raw === undefined ? null : raw;
      });
      rows.push([v.key, shortId(v.id), v.name, ci, typeCode[v.resolvedType], v.scopes.join(','),
        v.description || '', v.hiddenFromPublishing ? 1 : 0, vals]);
    }
  }
  return { rows, external: [...external] };
};

const styleRows = async () => {
  const lh = (l) => (l.unit === 'PIXELS' ? l.value : l.unit === 'PERCENT' ? `${l.value}%` : 'AUTO');
  const groups = [
    ['TEXT', await figma.getLocalTextStylesAsync()],
    ['FILL', await figma.getLocalPaintStylesAsync()],
    ['EFFECT', await figma.getLocalEffectStylesAsync()],
    ['GRID', await figma.getLocalGridStylesAsync()],
  ];
  const rows = [];
  for (const [type, list] of groups) {
    for (const s of list) {
      const font = type === 'TEXT' ? [s.fontName.family, s.fontName.style, s.fontSize, lh(s.lineHeight)] : null;
      rows.push([s.key, s.id, s.name, type, s.description || '', font]);
    }
  }
  return rows;
};

if (MODE === 'meta') {
  return {
    kind: 'meta',
    fileName: figma.root.name,
    collections: collections.map((c) => ({
      name: c.name,
      id: c.id,
      modes: c.modes.map((m) => ({ id: m.modeId, name: m.name })),
      defaultModeId: c.defaultModeId,
      variableCount: c.variableIds.length,
    })),
    styleCounts: {
      TEXT: (await figma.getLocalTextStylesAsync()).length,
      FILL: (await figma.getLocalPaintStylesAsync()).length,
      EFFECT: (await figma.getLocalEffectStylesAsync()).length,
      GRID: (await figma.getLocalGridStylesAsync()).length,
    },
  };
}

if (MODE === 'variables') {
  const { rows, external } = await variableRows();
  const slice = rows.slice(OFFSET, OFFSET + LIMIT);
  const next = OFFSET + LIMIT < rows.length ? OFFSET + LIMIT : null;
  return { kind: 'variables', offset: OFFSET, total: rows.length, next, external, rows: slice };
}

if (MODE === 'styles') {
  const rows = await styleRows();
  return { kind: 'styles', total: rows.length, rows };
}

if (MODE === 'checksums') {
  const { rows } = await variableRows();
  const variables = {};
  for (let o = 0; o < rows.length; o += LIMIT) variables[o] = fnv(JSON.stringify(rows.slice(o, o + LIMIT)));
  return { kind: 'checksums', limit: LIMIT, variableTotal: rows.length, variables, styles: fnv(JSON.stringify(await styleRows())) };
}

throw new Error('MODE 必须是 meta / variables / styles / checksums');
