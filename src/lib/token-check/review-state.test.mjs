import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const { applyWaivers, diffRuns, fixGain, historyKey, recordRun, snapshotOf, waiverKey } = await import(
  './review-state.ts'
);

const url = (id) => `https://www.figma.com/design/FILE1/x?node-id=${id.replace(':', '-')}`;

function issue(overrides) {
  return {
    nodeId: '1:1',
    nodeName: '标题',
    path: ['首页', '标题'],
    category: 'text-color',
    field: 'fills[0]',
    state: 'unbound',
    value: '#000000',
    figmaUrl: url('1:1'),
    targetIndex: 0,
    ...overrides,
  };
}

function stat(total, hyperos, legacy, other, unbound) {
  return { total, hyperos, legacy, other, unbound, rate: total ? hyperos / total : null };
}

function emptyCategories() {
  const s = stat(0, 0, 0, 0, 0);
  return { fill: s, 'text-color': s, stroke: s, typography: s, radius: s, spacing: s };
}

function report(overrides = {}) {
  const issues = [
    issue({ nodeId: '1:1', figmaUrl: url('1:1') }),
    issue({ nodeId: '1:2', figmaUrl: url('1:2'), state: 'legacy' }),
    issue({ nodeId: '1:3', figmaUrl: url('1:3'), category: 'fill' }),
  ];
  return {
    generatedAt: '2026-11-10T04:00:00.000Z',
    library: { fileName: 'HyperOS Design Token', exportedAt: '2026-11-09T00:00:00.000Z' },
    targets: [
      {
        target: { url: url('1:0'), fileKey: 'FILE1', nodeId: '1:0' },
        nodeName: '首页',
        nodeType: 'FRAME',
        coverage: stat(10, 7, 1, 0, 2),
      },
    ],
    coverage: {
      overall: stat(10, 7, 1, 0, 2),
      byCategory: { ...emptyCategories(), 'text-color': stat(6, 4, 1, 0, 1), fill: stat(4, 3, 0, 0, 1) },
      byTier: { reference: 0, semantic: 4, component: 3 },
    },
    issues,
    exclusions: [],
    exclusionSummary: {},
    uncertain: [],
    findings: [],
    checksRun: [],
    warnings: [],
    ...overrides,
  };
}

describe('applyWaivers', () => {
  it('没有保留项时原样返回', () => {
    const r = report();
    const { report: out, waived } = applyWaivers(r, new Set());
    assert.equal(out, r);
    assert.deepEqual(waived, []);
  });

  it('保留项移出问题清单和分母，总体、类别、目标三处口径一致', () => {
    const r = report();
    const keys = new Set([waiverKey(r.issues[0]), waiverKey(r.issues[1])]);
    const { report: out, waived } = applyWaivers(r, keys);
    assert.equal(waived.length, 2);
    assert.equal(out.issues.length, 1);
    assert.deepEqual(
      { ...out.coverage.overall },
      { total: 8, hyperos: 7, legacy: 0, other: 0, unbound: 1, rate: 7 / 8 },
    );
    assert.equal(out.coverage.byCategory['text-color'].total, 4);
    assert.equal(out.coverage.byCategory['text-color'].rate, 1);
    assert.equal(out.targets[0].coverage.total, 8);
    // 原报告不被修改
    assert.equal(r.coverage.overall.total, 10);
    assert.equal(r.issues.length, 3);
  });

  it('key 区分文件、节点、类别和字段', () => {
    const a = waiverKey(issue({}));
    assert.notEqual(a, waiverKey(issue({ field: 'fills[1]' })));
    assert.notEqual(a, waiverKey(issue({ category: 'fill' })));
    assert.notEqual(a, waiverKey(issue({ figmaUrl: 'https://www.figma.com/design/FILE2/x?node-id=1-1' })));
    assert.equal(a, waiverKey(issue({ value: '#FFFFFF' })));
  });
});

describe('fixGain', () => {
  it('按当前分母换算百分点', () => {
    assert.equal(fixGain(18, 236).toFixed(1), '7.6');
    assert.equal(fixGain(3, 0), 0);
  });
});

describe('检查历史', () => {
  it('historyKey 与目标顺序无关', () => {
    const a = report({
      targets: [
        { target: { url: '', fileKey: 'F', nodeId: '2:1' }, nodeName: 'b', nodeType: 'FRAME', coverage: stat(0, 0, 0, 0, 0) },
        { target: { url: '', fileKey: 'F', nodeId: '1:1' }, nodeName: 'a', nodeType: 'FRAME', coverage: stat(0, 0, 0, 0, 0) },
      ],
    });
    const b = report({ targets: [...a.targets].reverse() });
    assert.equal(historyKey(a), historyKey(b));
  });

  it('第一次检查没有对比；同一份报告重复打开不会和自己比', () => {
    const first = snapshotOf(report());
    let history = recordRun(undefined, first);
    assert.equal(diffRuns(history, first), null);
    history = recordRun(history, first);
    assert.equal(history.previous, undefined);
  });

  it('重新检查后对比上一次：待改处数和覆盖率百分点', () => {
    const first = snapshotOf(report());
    const second = snapshotOf(
      report({ generatedAt: '2026-11-10T05:00:00.000Z', coverage: { ...report().coverage, overall: stat(10, 9, 0, 0, 1) } }),
    );
    const history = recordRun(recordRun(undefined, first), second);
    const diff = diffRuns(history, second);
    assert.equal(diff.previousAt, first.generatedAt);
    assert.equal(diff.pendingDelta, -2);
    assert.equal(Math.round(diff.rateDelta), 20);
    // 记录前调用也得到同样的结果
    assert.deepEqual(diffRuns(recordRun(undefined, first), second), diff);
  });
});
