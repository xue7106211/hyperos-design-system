import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  excerptAround,
  excerptAroundHeading,
  normalizeSearchHits,
  searchDocs,
  tokenizeQuery,
} from './search-docs.ts';

/**
 * 两个话题段刻意拉开 > EXCERPT_WINDOW(240)，否则单个窗口会覆盖全文，
 * 测不出「摘录是否被拽向圆角」。
 */
const PAGE = [
  '# 抽屉浮窗 Bottom Sheet',
  `抽屉浮窗是在底部弹出交互内容区的控件。${'概述补充说明。'.repeat(40)}`,
  '## 标题栏',
  `标题栏高度为 56dp，左右内边距 24dp。${'标题排版补充说明。'.repeat(40)}`,
  '## 圆角',
  '抽屉顶部圆角为 36dp，对应 Token miuix_raidus_large。',
].join('\n\n');

describe('normalizeSearchHits', () => {
  it('maps Orama/Fumadocs hits and keeps section anchors', () => {
    const hits = normalizeSearchHits([
      {
        id: '/docs/os4/components/containers/drawer',
        type: 'page',
        content: '<mark>抽屉</mark>浮窗 Bottom Sheet',
        url: '/docs/os4/components/containers/drawer',
      },
      {
        id: '/docs/os4/components/containers/drawer-190',
        type: 'text',
        content: '抽屉圆角为 36dp',
        url: '/docs/os4/components/containers/drawer#圆角',
      },
    ]);
    assert.equal(hits.length, 2);
    assert.equal(hits[0].url, '/docs/os4/components/containers/drawer');
    assert.equal(hits[0].title, '抽屉浮窗 Bottom Sheet');
    assert.equal(hits[1].url, '/docs/os4/components/containers/drawer#圆角');
    assert.ok(hits[1].snippet.includes('36dp'));
    assert.ok(!hits[0].snippet.includes('<mark>'));
  });

  it('returns empty array for empty / invalid input', () => {
    assert.deepEqual(normalizeSearchHits(null), []);
    assert.deepEqual(normalizeSearchHits([]), []);
  });
});

describe('tokenizeQuery', () => {
  it('splits Chinese queries without whitespace', () => {
    const tokens = tokenizeQuery('抽屉的圆角是多少');
    assert.ok(tokens.includes('圆角'), `expected 圆角 in ${tokens.join('/')}`);
    assert.ok(tokens.includes('抽屉'), `expected 抽屉 in ${tokens.join('/')}`);
  });

  it('drops stopwords that cannot locate content', () => {
    const tokens = tokenizeQuery('圆角是多少');
    assert.ok(!tokens.includes('是'));
    assert.ok(!tokens.includes('多少'));
  });

  it('keeps token names and latin words', () => {
    const tokens = tokenizeQuery('miuix_raidus 36dp');
    assert.ok(tokens.some((t) => t.includes('miuix')));
    assert.ok(tokens.some((t) => t.includes('36')));
  });

  it('returns empty for blank query', () => {
    assert.deepEqual(tokenizeQuery('   '), []);
  });
});

describe('excerptAround', () => {
  it('does not drift to the radius section for unrelated queries', () => {
    // 旧实现按空白切词，无空格中文查询整句 indexOf 必然落空，
    // 于是掉进硬编码回退词「圆角」——这两个查询在旧实现下都会摘出 36dp。
    for (const query of ['标题栏高度是多少', '抽屉的标题栏内边距']) {
      const excerpt = excerptAround(PAGE, tokenizeQuery(query));
      assert.ok(
        excerpt.includes('56dp') || excerpt.includes('24dp'),
        `「${query}」expected 标题栏 excerpt, got: ${excerpt.slice(0, 60)}`,
      );
      assert.ok(
        !excerpt.includes('36dp'),
        `「${query}」radius bias leaked: ${excerpt.slice(0, 60)}`,
      );
    }
  });

  it('still locates the radius section when asked about it', () => {
    const excerpt = excerptAround(PAGE, tokenizeQuery('抽屉圆角'));
    assert.ok(excerpt.includes('36dp'), `expected 圆角 excerpt, got: ${excerpt}`);
  });

  it('locates content for a whitespace-free Chinese sentence', () => {
    // 旧实现按空白切词，整句 indexOf 必然落空，只能靠硬编码回退词命中
    const excerpt = excerptAround(PAGE, tokenizeQuery('抽屉的圆角是多少'));
    assert.ok(excerpt.includes('36dp'), `expected 圆角 excerpt, got: ${excerpt}`);
  });

  it('prefers the window covering more query tokens', () => {
    const text = `圆角说明。${'填充。'.repeat(120)}标题栏圆角与内边距说明。`;
    const excerpt = excerptAround(text, tokenizeQuery('标题栏 圆角'));
    assert.ok(excerpt.includes('标题栏圆角'), `got: ${excerpt}`);
  });

  it('returns empty when no query token appears', () => {
    assert.equal(excerptAround(PAGE, tokenizeQuery('夜间模式对比度')), '');
    assert.equal(excerptAround(PAGE, tokenizeQuery('foobar-quux')), '');
    assert.equal(excerptAround(PAGE, []), '');
    assert.equal(excerptAround('', tokenizeQuery('圆角')), '');
  });

  it('drops single-char noise tokens when longer ones exist', () => {
    // 「圆角」被 ICU 切成「圆 / 角」；单字保留会让摘录在长文档里随处命中
    const tokens = tokenizeQuery('抽屉的圆角是多少');
    assert.ok(!tokens.includes('圆'), `single char kept: ${tokens.join('/')}`);
    assert.ok(!tokens.includes('角'), `single char kept: ${tokens.join('/')}`);
  });
});

describe('excerptAroundHeading', () => {
  it('starts the excerpt at the matching heading', () => {
    const excerpt = excerptAroundHeading(PAGE, '圆角');
    assert.ok(excerpt.startsWith('## 圆角'), `got: ${excerpt}`);
    assert.ok(excerpt.includes('36dp'));
  });

  it('returns empty for a missing heading', () => {
    assert.equal(excerptAroundHeading(PAGE, ''), '');
    assert.equal(excerptAroundHeading(PAGE, '不存在的小节'), '');
  });
});

describe('searchDocs', () => {
  it('reports ok with empty hits for a blank query', async () => {
    assert.deepEqual(await searchDocs('   '), { status: 'ok', hits: [] });
  });
});
