import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import './__fixtures__/setup.mjs';

const { classifyNode } = await import('./classify.ts');

const ctx = (node) => ({
  parent: null,
  isRoot: false,
  entry: { document: node, components: {}, componentSets: {}, styles: {} },
  kitKeys: new Set(),
  kitNames: new Set(),
  statsCache: new WeakMap(),
  insidePossibleIllustration: false,
});

const shape = (id, type) => ({ id, name: `${type} ${id}`, type });

describe('插图判定', () => {
  it('路径矢量组成的图形视为插图', () => {
    const node = { id: '1', name: 'Group', type: 'GROUP', children: [shape('2', 'VECTOR'), shape('3', 'VECTOR')] };
    assert.equal(classifyNode(node, ctx(node)).reason, 'illustration');
  });

  it('路径矢量为主、混有圆形的图标视为插图（基础形状不重复计入其他叶子）', () => {
    const node = {
      id: '1',
      name: '时钟',
      type: 'GROUP',
      children: [shape('2', 'VECTOR'), shape('3', 'VECTOR'), shape('4', 'ELLIPSE')],
    };
    assert.equal(classifyNode(node, ctx(node)).reason, 'illustration');
  });

  it('矩形和圆拼出的控件（滑条轨道）不视为插图', () => {
    const node = {
      id: '1',
      name: 'Slider-Track',
      type: 'COMPONENT_SET',
      children: [shape('2', 'RECTANGLE'), shape('3', 'RECTANGLE'), shape('4', 'ELLIPSE')],
    };
    assert.equal(classifyNode(node, ctx(node)).kind, 'included');
  });

  it('含自动布局的矢量容器不视为插图', () => {
    const node = {
      id: '1',
      name: 'Steps',
      type: 'FRAME',
      layoutMode: 'HORIZONTAL',
      children: [shape('2', 'VECTOR'), shape('3', 'VECTOR')],
    };
    assert.equal(classifyNode(node, ctx(node)).kind, 'included');
  });
});
