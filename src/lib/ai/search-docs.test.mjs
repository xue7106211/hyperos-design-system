import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeSearchHits } from './search-docs.ts';

describe('normalizeSearchHits', () => {
  it('maps enriched flexsearch rows to title/url/snippet', () => {
    const hits = normalizeSearchHits([
      {
        doc: {
          title: '抽屉浮窗',
          url: '/docs/os4/components/containers/drawer',
          description: 'Bottom Sheet',
          content: '圆角使用 miuix_raidus_shape_2xl，对应 36dp。更多说明……',
        },
      },
    ]);
    assert.equal(hits.length, 1);
    assert.equal(hits[0].title, '抽屉浮窗');
    assert.equal(hits[0].url, '/docs/os4/components/containers/drawer');
    assert.ok(hits[0].snippet.includes('36dp'));
    assert.ok(hits[0].snippet.length <= 240);
  });

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
