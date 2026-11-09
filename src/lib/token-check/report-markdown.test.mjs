import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadFixture } from './__fixtures__/setup.mjs';

const { runTokenCheck } = await import('./engine.ts');
const { reportToMarkdown } = await import('./report-markdown.ts');

const FILE = 'DESIGNfileKey00000000000';
const target = { url: `https://www.figma.com/design/${FILE}/x?node-id=1-2`, fileKey: FILE, nodeId: '1:2' };
const report = await runTokenCheck({
  targets: [target],
  nodesResponses: { [FILE]: loadFixture('nodes-home.json') },
  kitComponentKeys: ['kitButtonSet'],
  kitComponentNames: ['Button'],
  snapshot: loadFixture('snapshot.json'),
  now: new Date('2026-11-09T08:00:00.000Z'),
});
const md = reportToMarkdown(report);

describe('reportToMarkdown', () => {
  it('contains the required sections in Chinese', () => {
    for (const heading of ['# Figma Token 绑定检查报告', '## 总览', '## 分类覆盖率', '## 排除统计', '## 问题清单（11）', '## 准确性发现（1）', '## 需要人工确认']) {
      assert.ok(md.includes(heading), heading);
    }
  });

  it('renders overall and per-category coverage', () => {
    assert.match(md, /\| \*\*全部\*\* \| 31\.3% \| 16 \| 5 \| 0 \| 3 \| 8 \|/);
    assert.match(md, /\| 填充 \| 25\.0% \| 4 \| 1 \| 0 \| 0 \| 3 \|/);
    assert.match(md, /\| Reference \| 1 \| 25\.0% \|/);
  });

  it('links each issue and finding to Figma', () => {
    assert.ok(md.includes(`](https://www.figma.com/design/${FILE}/?node-id=1-17)`), '分割线');
    assert.ok(md.includes(`](https://www.figma.com/design/${FILE}/?node-id=I3-9%3B10-2)`), '实例覆写');
    assert.ok(md.includes('（实例覆写）'));
    assert.match(md, /reference-tier .*brand\/miuix_sys_color_primary/);
    assert.ok(md.includes(`[首页 Section](${target.url})`));
  });

  it('includes exclusion counts', () => {
    assert.match(md, /\| MIUIX 组件实例 \| 1 \| 3 \|/);
    assert.match(md, /\| 插图 \/ 矢量 \/ 图片 \| 4 \| 6 \|/);
  });

  it('escapes table pipes in layer names', async () => {
    const response = loadFixture('nodes-home.json');
    response.nodes['1:2'].document.children[1].children.find((n) => n.id === '1:17').name = 'a|b';
    const r = await runTokenCheck({
      targets: [target],
      nodesResponses: { [FILE]: response },
      kitComponentKeys: ['kitButtonSet'],
      snapshot: loadFixture('snapshot.json'),
    });
    assert.ok(reportToMarkdown(r).includes('a\\|b'));
  });

  it('escapes table pipes in target names', async () => {
    const response = loadFixture('nodes-home.json');
    response.nodes['1:2'].document.name = '首页 | v2';
    const r = await runTokenCheck({
      targets: [target],
      nodesResponses: { [FILE]: response },
      kitComponentKeys: ['kitButtonSet'],
      snapshot: loadFixture('snapshot.json'),
    });
    assert.ok(reportToMarkdown(r).includes('[首页 \\| v2]('));
  });

  it('handles an empty report', () => {
    const empty = {
      ...report,
      issues: [],
      findings: [],
      exclusions: [],
      uncertain: [],
      warnings: ['测试提示'],
      coverage: {
        ...report.coverage,
        byTier: { reference: 0, semantic: 0, component: 0 },
      },
    };
    const text = reportToMarkdown(empty);
    assert.ok(text.includes('没有发现未绑定'));
    assert.ok(text.includes('没有发现准确性问题'));
    assert.ok(text.includes('> - 测试提示'));
    assert.ok(!text.includes('层级分布'));
  });
});
