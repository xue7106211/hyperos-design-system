import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const { groupIssuesByFix, rankFixesByImpact } = await import('./fix-groups.ts');

function issue(overrides) {
  return {
    nodeId: '1:1',
    nodeName: '标题',
    path: ['首页', '标题'],
    category: 'text-color',
    field: 'fills[0]',
    state: 'unbound',
    value: '#000000 90%',
    figmaUrl: 'https://www.figma.com/design/F/x?node-id=1-1',
    targetIndex: 0,
    ...overrides,
  };
}

describe('groupIssuesByFix', () => {
  it('同类别、同状态、同取值归成一条；先按类别聚合，类别内按影响面排序', () => {
    const groups = groupIssuesByFix([
      issue({ nodeId: '1:1' }),
      issue({ nodeId: '1:2' }),
      issue({ nodeId: '1:3', value: '#000000 90% ' }),
      issue({ nodeId: '1:4', category: 'fill', value: '#FFFFFF' }),
      issue({ nodeId: '1:5', value: '#333333' }),
      issue({ nodeId: '1:6', category: 'fill', value: '#F5F5F5' }),
      issue({ nodeId: '1:7', category: 'fill', value: '#F5F5F5' }),
    ]);
    assert.deepEqual(
      groups.map((g) => [g.category, g.value, g.issues.length]),
      [
        ['fill', '#F5F5F5', 2],
        ['fill', '#FFFFFF', 1],
        ['text-color', '#000000 90%', 3],
        ['text-color', '#333333', 1],
      ],
    );
    assert.equal(groups[2].nodeCount, 3);
  });

  it('rankFixesByImpact 跨类别按影响面排序，不改原数组', () => {
    const groups = groupIssuesByFix([
      issue({ nodeId: '1:1' }),
      issue({ nodeId: '1:2' }),
      issue({ nodeId: '1:3', category: 'fill', value: '#FFFFFF' }),
    ]);
    const ranked = rankFixesByImpact(groups);
    assert.equal(ranked[0].category, 'text-color');
    assert.equal(groups[0].category, 'fill');
  });

  it('同一图层的多个字段只算一个图层', () => {
    const [group] = groupIssuesByFix([
      issue({ category: 'spacing', field: 'paddingLeft', value: '16' }),
      issue({ category: 'spacing', field: 'paddingRight', value: '16' }),
    ]);
    assert.equal(group.issues.length, 2);
    assert.equal(group.nodeCount, 1);
  });

  it('不同状态或不同旧版变量分开；跳过已绑定 HyperOS 的属性', () => {
    const groups = groupIssuesByFix([
      issue({ state: 'legacy', token: { name: 'a', kind: 'variable', collection: '1. feature token' } }),
      issue({ state: 'legacy', token: { name: 'b', kind: 'variable', collection: '1. feature token' } }),
      issue({ state: 'unbound' }),
      issue({ state: 'hyperos' }),
    ]);
    assert.equal(groups.length, 3);
    assert.ok(groups.some((g) => g.tokenLabel === '1. feature token / a'));
    assert.ok(groups.every((g) => g.state !== 'hyperos'));
  });

  it('统计实例覆写数量', () => {
    const [group] = groupIssuesByFix([issue({ fromInstanceOverride: true }), issue({ nodeId: '1:9' })]);
    assert.equal(group.overrideCount, 1);
  });
});
