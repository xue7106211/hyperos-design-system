import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const { nearestTokens, parseColor, parseNumber, suggestForIssues, suggestionKey } = await import('./nearest.ts');

function variable(name, type, resolved, overrides = {}) {
  return {
    key: name,
    id: name,
    name,
    collection: 'Semantic Token',
    tier: 'semantic',
    type,
    scopes: ['ALL_SCOPES'],
    description: '',
    hiddenFromPublishing: false,
    aliasOf: {},
    resolved,
    ...overrides,
  };
}

const snapshot = {
  source: { fileKey: 'F', fileName: 'HyperOS Design Token', exportedAt: '2026-11-09' },
  collections: [],
  styles: [],
  variables: [
    variable('text/miuix_sys_color_text_primary', 'COLOR', { Light: '#000000', Dark: '#FFFFFFF2' }),
    variable('text/miuix_sys_color_text_secondary', 'COLOR', { Light: '#000000CC', Dark: '#FFFFFFCC' }),
    variable('bg/miuix_sys_color_bg_page', 'COLOR', { Light: '#FFFFFF', Dark: '#000000' }),
    variable('palette/miuix_ref_black', 'COLOR', { Light: '#000000', Dark: '#000000' }, { tier: 'reference' }),
    variable('text/miuix_sys_color_text_hidden', 'COLOR', { Light: '#000000', Dark: '#000000' }, { hiddenFromPublishing: true }),
    variable('space/miuix_sys_space_16', 'FLOAT', { Light: 16, Dark: 16 }, { scopes: ['GAP'] }),
    variable('space/miuix_sys_space_12', 'FLOAT', { Light: 12, Dark: 12 }, { scopes: ['GAP'] }),
    variable('radius/miuix_sys_radius_12', 'FLOAT', { Light: 12, Dark: 12 }, { scopes: ['CORNER_RADIUS'] }),
  ],
};

describe('parseColor / parseNumber', () => {
  it('解析带透明度、描边宽度和 8 位色值', () => {
    assert.deepEqual(parseColor('#000000 90%'), { r: 0, g: 0, b: 0, a: 0.9 });
    assert.equal(parseColor('#FFFFFF 1px').a, 1);
    assert.ok(Math.abs(parseColor('#000000CC').a - 0.8) < 0.01);
    assert.equal(parseColor('线性渐变 #000000 → #FFFFFF'), null);
  });

  it('四角不同的圆角不对应单个 Token', () => {
    assert.equal(parseNumber('16'), 16);
    assert.equal(parseNumber('8/8/8/8'), 8);
    assert.equal(parseNumber('8/8/0/0'), null);
  });
});

describe('nearestTokens', () => {
  it('文字色优先用途对得上的 Token，不推荐 Reference 层和未发布的变量', () => {
    const names = nearestTokens('text-color', '#000000 90%', snapshot).map((s) => s.name);
    assert.deepEqual([...names.slice(0, 2)].sort(), ['miuix_sys_color_text_primary', 'miuix_sys_color_text_secondary']);
    assert.ok(!names.includes('miuix_ref_black'));
    assert.ok(!names.includes('miuix_sys_color_text_hidden'));
  });

  it('差距说明写清方向，并带上各模式的值', () => {
    const found = nearestTokens('text-color', '#000000 90%', snapshot);
    const primary = found.find((s) => s.name === 'miuix_sys_color_text_primary');
    const secondary = found.find((s) => s.name === 'miuix_sys_color_text_secondary');
    assert.equal(primary.note, '明显更深');
    assert.equal(secondary.note, '明显更浅');
    assert.equal(primary.role, 'text');
    assert.equal(primary.matchedMode, 'Light');
    assert.deepEqual(primary.values, { Light: '#000000', Dark: '#FFFFFFF2' });
    assert.equal(nearestTokens('fill', '#FFFFFF', snapshot)[0].note, '完全一致');
  });

  it('间距按作用域筛选，按数值差排序', () => {
    const spacing = nearestTokens('spacing', '14', snapshot);
    assert.deepEqual(spacing.map((s) => s.name), ['miuix_sys_space_12', 'miuix_sys_space_16']);
    assert.equal(spacing[0].note, '小 2');
    assert.deepEqual(nearestTokens('radius', '12', snapshot).map((s) => s.name), ['miuix_sys_radius_12']);
  });

  it('不透明的灰和带透明度的黑叠在白底上观感接近时也算候选', () => {
    const names = nearestTokens('text-color', '#333333', snapshot).map((s) => s.name);
    const [first] = nearestTokens('text-color', '#333333', snapshot);
    assert.equal(first.name, 'miuix_sys_color_text_secondary');
    assert.equal(first.note, '观感接近，透明度不同');
  });

  it('比较过但没有接近的值返回空数组，无法比较的返回 null', () => {
    assert.deepEqual(nearestTokens('fill', '#FF00AA', snapshot), []);
    assert.deepEqual(nearestTokens('spacing', '40', snapshot), []);
    assert.equal(nearestTokens('typography', 'MiSans 16/24 Medium', snapshot), null);
    assert.equal(nearestTokens('radius', '8/8/0/0', snapshot), null);
  });
});

describe('suggestForIssues', () => {
  it('同一个「类别 + 取值」只算一次', () => {
    const issues = [
      { category: 'text-color', value: '#000000 90%' },
      { category: 'text-color', value: '#000000 90%' },
      { category: 'spacing', value: '16' },
      { category: 'typography', value: 'MiSans 16/24 Medium' },
    ];
    const map = suggestForIssues(issues, snapshot);
    assert.deepEqual(Object.keys(map).sort(), [suggestionKey('spacing', '16'), suggestionKey('text-color', '#000000 90%')].sort());
  });
});
