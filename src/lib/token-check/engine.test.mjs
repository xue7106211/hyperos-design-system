import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadFixture } from './__fixtures__/setup.mjs';

const { runTokenCheck, coverageOf } = await import('./engine.ts');
const { isTokenCheckError } = await import('./errors.ts');

const snapshot = loadFixture('snapshot.json');
const home = loadFixture('nodes-home.json');
const FILE = 'DESIGNfileKey00000000000';
const target = { url: `https://www.figma.com/design/${FILE}/x?node-id=1-2`, fileKey: FILE, nodeId: '1:2' };
const KIT_KEYS = ['kitButtonSet'];
const NOW = new Date('2026-11-09T08:00:00.000Z');

const run = (overrides = {}) =>
  runTokenCheck({
    targets: [target],
    nodesResponses: { [FILE]: home },
    kitComponentKeys: KIT_KEYS,
    kitComponentNames: ['Button'],
    snapshot,
    now: NOW,
    ...overrides,
  });

const report = await run();
/** 用 checks 注入拿到全部属性 */
async function allProps() {
  let captured = [];
  await run({ checks: [{ id: 'capture', run: (props) => ((captured = props), []) }] });
  return captured;
}
const props = await allProps();
const find = (nodeId, field) => props.find((p) => p.nodeId === nodeId && p.field === field);

describe('exclusions', () => {
  const reasonOf = (id) => report.exclusions.find((e) => e.nodeId === id)?.reason;

  it('excludes hidden layers with their subtree node count', () => {
    const hidden = report.exclusions.find((e) => e.nodeId === '1:7');
    assert.equal(hidden.reason, 'hidden');
    assert.equal(hidden.nodeCount, 2);
    assert.ok(!props.some((p) => p.nodeId === '1:8'));
  });

  it('excludes annotations by name, by type, and loose Section text', () => {
    assert.equal(reasonOf('1:9'), 'annotation'); // 名称「交互」
    assert.equal(reasonOf('1:10'), 'annotation'); // STICKY
    assert.equal(reasonOf('1:3'), 'annotation'); // Section 直接子级 TEXT
    assert.match(report.exclusions.find((e) => e.nodeId === '1:3').detail, /Section/);
  });

  it('excludes MIUIX instances matched through the component set key', () => {
    const miuix = report.exclusions.find((e) => e.nodeId === '3:9');
    assert.equal(miuix.reason, 'miuix-instance');
    assert.equal(miuix.nodeCount, 3);
    assert.match(miuix.detail, /Button/);
  });

  it('excludes illustrations by vectors, image fill, export settings and name', () => {
    assert.equal(reasonOf('1:11'), 'illustration');
    assert.match(report.exclusions.find((e) => e.nodeId === '1:11').detail, /2 个矢量/);
    assert.equal(reasonOf('1:14'), 'illustration');
    assert.equal(reasonOf('1:15'), 'illustration');
    assert.equal(reasonOf('1:16'), 'illustration');
  });

  it('keeps a single vector, Picker names and non-MIUIX instance internals', () => {
    assert.equal(reasonOf('1:17'), undefined);
    assert.equal(reasonOf('1:26'), undefined);
    assert.equal(reasonOf('4:1'), undefined);
    assert.equal(find('I4:1;20:2', 'fills[0]').state, 'unbound');
  });

  it('summarizes exclusions by reason', () => {
    assert.deepEqual(report.exclusionSummary, {
      'miuix-instance': { count: 1, nodeCount: 3 },
      illustration: { count: 4, nodeCount: 6 },
      annotation: { count: 3, nodeCount: 3 },
      hidden: { count: 1, nodeCount: 2 },
    });
  });

  it('flags uncertain nodes without excluding them', () => {
    const kinds = Object.fromEntries(report.uncertain.map((u) => [u.nodeId, u.kind]));
    assert.deepEqual(kinds, { '1:18': 'possible-illustration', '1:24': 'possible-detached-component' });
    assert.ok(find('1:23', 'text'), 'possible-illustration 子树仍计入');
    assert.ok(find('1:25', 'text'));
  });

  it('does not exclude the selected root even if it matches a rule', async () => {
    const response = structuredClone(home);
    response.nodes['1:2'].document.name = '交互说明 Section';
    const r = await run({ nodesResponses: { [FILE]: response } });
    assert.equal(r.coverage.overall.total, report.coverage.overall.total);
  });
});

describe('MIUIX instance overrides', () => {
  it('counts only overridden fields and marks them', () => {
    const insideInstance = props.filter((p) => p.nodeId.startsWith('I3:9;'));
    assert.equal(insideInstance.length, 1);
    assert.equal(insideInstance[0].field, 'fills[0]');
    assert.equal(insideInstance[0].fromInstanceOverride, true);
    assert.deepEqual(insideInstance[0].path, ['首页 Section', '首页', 'Button', 'bg']);
  });

  it('counts nothing inside the instance when the kit list is empty, and warns', async () => {
    const r = await run({ kitComponentKeys: [] });
    assert.ok(!r.exclusions.some((e) => e.reason === 'miuix-instance'));
    assert.ok(r.warnings.some((w) => w.includes('MIUIX')));
  });
});

describe('properties and bindings', () => {
  it('extracts all 6 categories and never effects', () => {
    assert.deepEqual(new Set(props.map((p) => p.category)), new Set(['fill', 'text-color', 'stroke', 'typography', 'radius', 'spacing']));
    assert.ok(!props.some((p) => p.field.startsWith('effects')));
  });

  it('resolves remote HyperOS variables by key with tier', () => {
    assert.deepEqual(find('1:4', 'fills[0]').token, { name: 'color/blue/miuix_ref_blue_50', tier: 'reference', kind: 'variable' });
    assert.equal(find('1:4', 'paddingLeft').token.tier, 'semantic');
    assert.equal(find('1:40', 'cornerRadius').token.name, 'card/miuix_comp_card_radius');
    assert.equal(find('1:6', 'text').token.name, 'font/miuix_sys_font_size_body');
  });

  it('marks local variables as other', () => {
    assert.equal(find('1:4', 'itemSpacing').state, 'other');
    assert.equal(find('1:6', 'fills[0]').state, 'other');
  });

  it('resolves styles through the response styles map', () => {
    assert.deepEqual(find('1:5', 'text').token, { name: 'Body/Regular', kind: 'style' });
    assert.equal(find('1:5', 'fills[0]').state, 'other'); // 非 HyperOS 库的颜色样式
  });

  it('formats values for designers', () => {
    assert.equal(find('1:4', 'fills[0]').value, '#3482FF');
    assert.equal(find('1:5', 'fills[0]').value, '#000000 90%');
    assert.equal(find('1:5', 'text').value, 'MiSans Medium 17/22');
    assert.equal(find('1:4', 'strokes[0]').value, '#000000 10% 1px');
    assert.equal(find('1:27', 'rectangleCornerRadii').value, '8/8/0/0');
  });

  it('skips zero values, hidden paints, zero-weight strokes and Section backgrounds', () => {
    assert.ok(!find('1:4', 'paddingTop'));
    assert.ok(!find('1:17', 'fills[1]'));
    assert.ok(!find('1:17', 'strokes[0]'));
    assert.ok(!props.some((p) => p.nodeId === '1:2'));
  });

  it('skips radius on artboards (selected root frame or top-level frame in a Section)', async () => {
    assert.ok(!find('1:4', 'cornerRadius'), 'Section 内顶层 Frame 的圆角是屏幕外形');
    assert.ok(find('1:4', 'fills[0]'), '画板的填充仍然统计');
    const response = structuredClone(home);
    const frame = response.nodes['1:2'].document.children[1];
    const r = await run({
      targets: [{ url: `https://www.figma.com/design/${FILE}/x?node-id=1-4`, fileKey: FILE, nodeId: '1:4' }],
      nodesResponses: { [FILE]: { ...response, nodes: { '1:4': { ...response.nodes['1:2'], document: frame } } } },
    });
    // 只剩画板内的 1:27、1:40 两个圆角
    assert.equal(r.coverage.byCategory.radius.total, 2);
  });

    it('uses the real parent for overlapping targets when deciding artboards', async () => {
    const response = structuredClone(home);
    const card = response.nodes['1:2'].document.children[1].children.find((n) => n.id === '1:40');
    response.nodes['1:40'] = { ...response.nodes['1:2'], document: card };
    const inner = { url: `https://www.figma.com/design/${FILE}/x?node-id=1-40`, fileKey: FILE, nodeId: '1:40' };
    const r = await run({ targets: [target, inner], nodesResponses: { [FILE]: response } });
    // 卡片在 Section 里的父级是画板 Frame，不是画板本身：单独作为目标时圆角同样计入
    assert.equal(r.targets[1].coverage.total, 1);
    assert.equal(r.coverage.overall.total, report.coverage.overall.total);
  });

  it('counts itemSpacing only with 2+ flow children and without space-between', () => {
    assert.ok(!find('1:28', 'itemSpacing'));
    assert.ok(!find('1:31', 'itemSpacing'));
    assert.ok(find('1:4', 'itemSpacing'));
  });

  it('builds figma links with dashes', () => {
    assert.equal(find('1:4', 'fills[0]').figmaUrl, `https://www.figma.com/design/${FILE}/?node-id=1-4`);
  });
});

describe('coverage', () => {
  it('computes overall coverage', () => {
    assert.deepEqual(report.coverage.overall, { total: 16, hyperos: 5, legacy: 0, other: 3, unbound: 8, rate: 5 / 16 });
    assert.equal(report.issues.length, 11);
    assert.ok(report.issues.every((p) => p.state !== 'hyperos'));
  });

  it('computes coverage by category and tier', () => {
    const { byCategory, byTier } = report.coverage;
    assert.deepEqual(byCategory.fill, { total: 4, hyperos: 1, legacy: 0, other: 0, unbound: 3, rate: 0.25 });
    assert.deepEqual(byCategory['text-color'], { total: 2, hyperos: 0, legacy: 0, other: 2, unbound: 0, rate: 0 });
    assert.deepEqual(byCategory.spacing, { total: 3, hyperos: 1, legacy: 0, other: 1, unbound: 1, rate: 1 / 3 });
    assert.deepEqual(byCategory.typography, { total: 4, hyperos: 2, legacy: 0, other: 0, unbound: 2, rate: 0.5 });
    assert.equal(byCategory.radius.total, 2);
    assert.equal(byCategory.stroke.total, 1);
    assert.equal(byCategory.effect, undefined);
    assert.deepEqual(byTier, { reference: 1, semantic: 2, component: 1 });
  });

  it('returns null rate for empty stats', () => {
    assert.equal(coverageOf([]).rate, null);
  });

  it('fills report metadata', () => {
    assert.equal(report.generatedAt, NOW.toISOString());
    assert.equal(report.library.fileName, snapshot.source.fileName);
    assert.equal(report.targets[0].nodeType, 'SECTION');
    assert.equal(report.targets[0].coverage.total, 16);
    assert.deepEqual(report.checksRun, ['reference-tier']);
  });

  it('dedupes overlapping targets in the overall coverage', async () => {
    const inner = { url: `https://www.figma.com/design/${FILE}/x?node-id=1-4`, fileKey: FILE, nodeId: '1:4' };
    const response = structuredClone(home);
    response.nodes['1:4'] = { ...response.nodes['1:2'], document: response.nodes['1:2'].document.children[1] };
    const r = await run({ targets: [target, inner], nodesResponses: { [FILE]: response } });
    assert.equal(r.targets.length, 2);
    assert.equal(r.coverage.overall.total, 16);
    assert.equal(r.findings.length, 1);
  });
});

describe('reference-tier check', () => {
  it('warns on reference tokens and suggests aliasing semantic tokens', () => {
    assert.equal(report.findings.length, 1);
    const [finding] = report.findings;
    assert.equal(finding.checkId, 'reference-tier');
    assert.equal(finding.severity, 'warning');
    assert.equal(finding.nodeId, '1:4');
    assert.equal(finding.current, 'color/blue/miuix_ref_blue_50');
    // 两个模式都指向它的 primary 排在前面
    assert.equal(finding.suggestion, 'brand/miuix_sys_color_primary、text/miuix_sys_color_link');
    assert.equal(finding.confidence, 1);
  });
});

describe('errors and limits', () => {
  const expectError = async (promise, code) => {
    await assert.rejects(promise, (error) => isTokenCheckError(error) && error.code === code);
  };

  it('rejects pages and documents', async () => {
    const response = { nodes: { '0:1': { document: { id: '0:1', name: 'Page 1', type: 'CANVAS', children: [] } } } };
    const page = { url: 'page-url', fileKey: FILE, nodeId: '0:1' };
    await expectError(run({ targets: [page], nodesResponses: { [FILE]: response } }), 'unsupported-node-type');
  });

  it('reports missing nodes', async () => {
    await expectError(run({ nodesResponses: { [FILE]: { nodes: { '1:2': null } } } }), 'figma-not-found');
    await expectError(run({ nodesResponses: {} }), 'figma-not-found');
  });

  it('enforces the node limit', async () => {
    await expectError(run({ maxNodes: 10 }), 'too-large');
  });

  it('enforces the default 30000 node limit', async () => {
    const children = Array.from({ length: 30_000 }, (_, i) => ({ id: `2:${i}`, name: '块', type: 'FRAME', children: [] }));
    const big = { nodes: { '1:2': { document: { id: '1:2', name: '大', type: 'FRAME', children } } } };
    await expectError(run({ nodesResponses: { [FILE]: big } }), 'too-large');
    big.nodes['1:2'].document.children.pop();
    const ok = await run({ nodesResponses: { [FILE]: big } });
    assert.equal(ok.coverage.overall.total, 0);
  });

  it('warns about non-container target types', async () => {
    const response = { nodes: { '1:5': { document: { id: '1:5', name: '标题', type: 'TEXT', style: {} } } } };
    const r = await run({ targets: [{ ...target, nodeId: '1:5' }], nodesResponses: { [FILE]: response } });
    assert.ok(r.warnings.some((w) => w.includes('TEXT')));
  });
});


describe('旧版 Kit 变量', () => {
  const legacySnapshot = {
    source: { fileKey: FILE, fileName: 'Kit', exportedAt: '2026-11-09T00:00:00.000Z' },
    variables: [{ key: 'oldPaddingMd', id: 'VariableID:9:9', name: 'padding/padding_md', collection: '4.Number Token', type: 'FLOAT' }],
  };

  it('绑定旧版 Kit 变量记为 legacy，单独计数且不计入覆盖率', async () => {
    let props = [];
    const withLegacy = await run({ legacySnapshot, checks: [{ id: 'capture', run: (p) => ((props = p), []) }] });
    const spacing = props.find((p) => p.nodeId === '1:4' && p.field === 'itemSpacing');
    assert.equal(spacing.state, 'legacy');
    assert.deepEqual(spacing.token, { name: 'padding/padding_md', kind: 'variable', collection: '4.Number Token' });
    // 其他本地变量仍是 other
    assert.equal(props.find((p) => p.nodeId === '1:6' && p.field === 'fills[0]').state, 'other');
    const { overall } = withLegacy.coverage;
    assert.equal(overall.legacy, 1);
    assert.equal(overall.other, report.coverage.overall.other - 1);
    assert.equal(overall.rate, report.coverage.overall.rate);
    assert.ok(withLegacy.issues.some((i) => i.state === 'legacy'));
  });

  it('远程绑定按 key 匹配旧版变量', async () => {
    const remote = { ...legacySnapshot, source: { ...legacySnapshot.source, fileKey: 'KITfileKey' }, variables: [{ ...legacySnapshot.variables[0], key: 'refBlue50x' }] };
    const r = await run({ legacySnapshot: remote });
    assert.equal(r.coverage.overall.legacy, 0); // 本地 id 不再匹配
  });
});
