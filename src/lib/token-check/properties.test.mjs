import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadFixture } from './__fixtures__/setup.mjs';

const { extractProperties, collectAliases, formatPaint } = await import('./properties.ts');
const { createLibraryIndex, remoteVariableKey, lookupVariable } = await import('./library.ts');
const { classifyNode } = await import('./classify.ts');

const snapshot = loadFixture('snapshot.json');
const library = createLibraryIndex(snapshot);
const entry = {
  document: null,
  styles: { 'S:fill': { key: 'styleSurface', name: 'Surface/Primary', styleType: 'FILL' } },
};
const ctx = (extra = {}) => ({ fileKey: 'DESIGN', entry, library, path: ['root'], figmaUrl: 'u', ...extra });
const red = { r: 1, g: 0, b: 0, a: 1 };

describe('library index', () => {
  it('extracts the key from remote variable ids', () => {
    assert.equal(remoteVariableKey('VariableID:abc123/45:6'), 'abc123');
    assert.equal(remoteVariableKey('VariableID:45:6'), null);
  });

  it('indexes variables and styles', () => {
    assert.equal(library.variableByKey.get('semPrimary').name, 'brand/miuix_sys_color_primary');
    assert.equal(library.styleByKey.get('styleBody').name, 'Body/Regular');
    assert.equal(library.semanticAliasesOf.get('color/blue/miuix_ref_blue_50').length, 2);
  });

  it('resolves local ids only when checking the library file itself', () => {
    assert.equal(lookupVariable(library, 'VariableID:200:1', 'DESIGN'), undefined);
    assert.equal(lookupVariable(library, 'VariableID:200:1', snapshot.source.fileKey).key, 'semPrimary');
  });
});

describe('extractProperties', () => {
  it('collects aliases from single, array and nested shapes', () => {
    const alias = { type: 'VARIABLE_ALIAS', id: 'VariableID:a/1:1' };
    assert.equal(collectAliases(alias).length, 1);
    assert.equal(collectAliases([alias, null, alias]).length, 2);
    assert.equal(collectAliases({ color: alias, radius: alias }).length, 2);
    assert.equal(collectAliases(undefined).length, 0);
  });

  it('treats a HyperOS fill style as bound for every paint', () => {
    const node = {
      id: '1:1', name: '卡片', type: 'FRAME', styles: { fill: 'S:fill' },
      fills: [{ type: 'SOLID', color: red }, { type: 'GRADIENT_LINEAR', gradientStops: [{ position: 0, color: red }] }],
    };
    const props = extractProperties(node, ctx());
    assert.equal(props.length, 2);
    assert.ok(props.every((p) => p.state === 'hyperos' && p.token.kind === 'style'));
    assert.equal(props[1].value, '线性渐变 #FF0000');
  });

  it('prefers a HyperOS binding when style and variable disagree', () => {
    const node = {
      id: '1:1', name: '卡片', type: 'FRAME', styles: { fill: 'S:unknown' },
      fills: [{ type: 'SOLID', color: red, boundVariables: { color: { type: 'VARIABLE_ALIAS', id: 'VariableID:semPrimary/200:1' } } }],
    };
    assert.equal(extractProperties(node, ctx())[0].state, 'hyperos');
  });

  it('ignores image paints and zero-opacity paints', () => {
    const node = { id: '1:1', name: '块', type: 'RECTANGLE', fills: [{ type: 'IMAGE' }, { type: 'SOLID', opacity: 0, color: red }] };
    assert.equal(extractProperties(node, ctx()).length, 0);
  });

  it('uses individual stroke weights when strokeWeight is missing', () => {
    const node = {
      id: '1:1', name: '块', type: 'FRAME', strokes: [{ type: 'SOLID', color: red }],
      individualStrokeWeights: { top: 0, right: 0, bottom: 1, left: 0 },
    };
    const [prop] = extractProperties(node, ctx());
    assert.equal(prop.category, 'stroke');
    assert.equal(prop.value, '#FF0000 1px');
  });

  it('marks unbound text with no fills as typography only', () => {
    const node = { id: '1:1', name: '字', type: 'TEXT', style: { fontFamily: 'MiSans', fontWeight: 500, fontSize: 14 } };
    const props = extractProperties(node, ctx());
    assert.deepEqual(props.map((p) => [p.category, p.state, p.value]), [['typography', 'unbound', 'MiSans 500 14/auto']]);
  });

  it('limits instance overrides to the overridden fields', () => {
    const node = {
      id: 'I1:1;2:2', name: '容器', type: 'FRAME', layoutMode: 'HORIZONTAL',
      paddingLeft: 8, paddingRight: 8, cornerRadius: 4, fills: [{ type: 'SOLID', color: red }],
      children: [{ id: 'a', name: 'a', type: 'FRAME' }, { id: 'b', name: 'b', type: 'FRAME' }], itemSpacing: 4,
    };
    const props = extractProperties(node, ctx({ overriddenFields: new Set(['paddingLeft', 'cornerRadius']) }));
    assert.deepEqual(props.map((p) => p.field).sort(), ['cornerRadius', 'paddingLeft']);
    assert.ok(props.every((p) => p.fromInstanceOverride));
  });

  it('maps styles / boundVariables overrides to the categories they touch', () => {
    const node = {
      id: 'I1:1;2:3', name: '文字', type: 'TEXT', styles: { text: 'S:x' },
      fills: [{ type: 'SOLID', color: red }],
      boundVariables: { fills: [{ type: 'VARIABLE_ALIAS', id: 'VariableID:semLink/200:2' }] },
      style: { fontFamily: 'MiSans', fontSize: 14, lineHeightPx: 20 },
    };
    const viaStyles = extractProperties(node, ctx({ overriddenFields: new Set(['styles']) }));
    assert.deepEqual(viaStyles.map((p) => p.category), ['typography']);
    const viaVariables = extractProperties(node, ctx({ overriddenFields: new Set(['boundVariables']) }));
    assert.deepEqual(viaVariables.map((p) => [p.category, p.state]), [['text-color', 'hyperos']]);
  });

  it('formats translucent solid paints', () => {
    assert.equal(formatPaint({ type: 'SOLID', opacity: 0.5, color: { r: 0, g: 0, b: 0, a: 0.8 } }), '#000000 40%');
  });
});

describe('classifyNode', () => {
  const base = {
    parent: { id: 'p', name: 'p', type: 'FRAME' },
    isRoot: false,
    entry: { document: null, components: {}, componentSets: {} },
    kitKeys: new Set(['kitKey']),
    kitNames: new Set(['Switch']),
    statsCache: new WeakMap(),
    insidePossibleIllustration: false,
  };
  const classify = (node, extra = {}) => classifyNode(node, { ...base, statsCache: new WeakMap(), ...extra });

  it('applies rules in order: hidden before annotation', () => {
    const result = classify({ id: '1', name: '标注', type: 'FRAME', visible: false });
    assert.equal(result.reason, 'hidden');
  });

  it('matches MIUIX instances by component key without a set', () => {
    const entry = { document: null, components: { c: { key: 'kitKey', name: 'Switch' } } };
    const result = classify({ id: '1', name: '开关', type: 'INSTANCE', componentId: 'c' }, { entry });
    assert.equal(result.reason, 'miuix-instance');
    assert.match(result.detail, /Switch/);
  });

  it('does not treat a lone vector as illustration', () => {
    assert.equal(classify({ id: '1', name: 'Rectangle', type: 'RECTANGLE' }).kind, 'included');
  });

  it('does not repeat possible-illustration below a flagged ancestor', () => {
    const node = {
      id: '1', name: '组合', type: 'FRAME',
      children: [
        { id: 'v1', name: 'v', type: 'VECTOR' },
        { id: 'v2', name: 'v', type: 'VECTOR' },
        { id: 'v3', name: 'v', type: 'VECTOR' },
        { id: 't', name: 't', type: 'TEXT' },
      ],
    };
    assert.equal(classify(node).uncertain.kind, 'possible-illustration');
    assert.equal(classify(node, { insidePossibleIllustration: true }).uncertain, undefined);
  });

  it('ignores hidden descendants when deciding illustrations', () => {
    const node = {
      id: '1', name: '组合', type: 'GROUP',
      children: [
        { id: 'v1', name: 'v', type: 'VECTOR' },
        { id: 'v2', name: 'v', type: 'VECTOR' },
        { id: 't', name: 't', type: 'TEXT', visible: false },
      ],
    };
    assert.equal(classify(node).reason, 'illustration');
  });

  it('flags detached components by exact kit name', () => {
    assert.equal(classify({ id: '1', name: 'Switch', type: 'FRAME', children: [] }).uncertain.kind, 'possible-detached-component');
    assert.equal(classify({ id: '1', name: 'Switch 2', type: 'FRAME', children: [] }).uncertain, undefined);
    assert.equal(classify({ id: '1', name: 'Switch', type: 'GROUP', children: [] }).uncertain, undefined);
  });
});
