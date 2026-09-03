import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getDocumentSources } from './document-sources.ts';

describe('getDocumentSources', () => {
  it('uses the assistant response Markdown citations when present', () => {
    const sources = getDocumentSources({
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: '参考[标题栏](/docs/os4/components/navigation/action-bar)。',
        },
        {
          type: 'tool-search',
          state: 'output-available',
          output: {
            status: 'ok',
            hits: [
              { title: '抽屉浮窗', url: '/docs/os4/components/containers/drawer' },
            ],
          },
        },
      ],
    });

    assert.deepEqual(sources, [
      { title: '标题栏', href: '/docs/os4/components/navigation/action-bar' },
    ]);
  });

  it('falls back to completed search hits when the response has no Markdown citation', () => {
    const sources = getDocumentSources({
      role: 'assistant',
      parts: [
        { type: 'text', text: '可以使用，但仅支持小标题态。' },
        {
          type: 'tool-search',
          state: 'output-available',
          output: {
            status: 'ok',
            hits: [
              { title: '抽屉浮窗', url: '/docs/os4/components/containers/drawer' },
              { title: '抽屉浮窗', url: '/docs/os4/components/containers/drawer' },
            ],
          },
        },
      ],
    });

    assert.deepEqual(sources, [
      { title: '抽屉浮窗', href: '/docs/os4/components/containers/drawer' },
    ]);
  });

  it('does not create sources for unavailable, malformed, or external results', () => {
    assert.deepEqual(
      getDocumentSources({
        role: 'assistant',
        parts: [
          { type: 'text', text: '文档检索暂时不可用。' },
          {
            type: 'tool-search',
            state: 'output-available',
            output: {
              status: 'unavailable',
              hits: [{ title: '无效', url: '/docs/os4/general/index' }],
            },
          },
          {
            type: 'tool-search',
            state: 'output-available',
            output: {
              status: 'ok',
              hits: [{ title: '外部文档', url: 'https://example.com' }],
            },
          },
        ],
      }),
      [],
    );
  });
});
