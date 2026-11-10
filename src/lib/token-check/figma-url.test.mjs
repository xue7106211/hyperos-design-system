import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import './__fixtures__/setup.mjs';

const { buildFigmaUrl, isFigmaUrlError, parseFigmaUrl } = await import('./figma-url.ts');

describe('parseFigmaUrl', () => {
  it('parses /design/ links and converts node-id dashes', () => {
    assert.deepEqual(parseFigmaUrl('https://www.figma.com/design/AbC123xyz/首页?node-id=12-345&t=abc'), {
      url: 'https://www.figma.com/design/AbC123xyz/首页?node-id=12-345&t=abc',
      fileKey: 'AbC123xyz',
      nodeId: '12:345',
    });
  });

  it('parses legacy /file/ links', () => {
    const result = parseFigmaUrl('https://figma.com/file/LegacyKey/Name?node-id=1-2');
    assert.equal(result.fileKey, 'LegacyKey');
    assert.equal(result.nodeId, '1:2');
  });

  it('uses branchKey as fileKey for branch links', () => {
    const result = parseFigmaUrl('https://www.figma.com/design/MainKey/branch/BranchKey/Name?node-id=3-4');
    assert.equal(result.fileKey, 'BranchKey');
    assert.equal(result.nodeId, '3:4');
  });

  it('decodes %3A encoded node ids', () => {
    assert.equal(parseFigmaUrl('https://www.figma.com/design/K/N?node-id=5%3A6').nodeId, '5:6');
  });

  it('accepts instance sublayer ids and links without protocol', () => {
    const result = parseFigmaUrl('  figma.com/design/K/N?node-id=I1-2;3-4 ');
    assert.equal(result.nodeId, 'I1:2;3:4');
    assert.equal(result.url, 'figma.com/design/K/N?node-id=I1-2;3-4');
  });

  it('rejects non-Figma hosts and unsupported link kinds', () => {
    for (const url of [
      'https://example.com/design/K/N?node-id=1-2',
      'https://www.figma.com/proto/K/N?node-id=1-2',
      'https://www.figma.com/board/K/N?node-id=1-2',
      'https://www.figma.com/files/recent',
      'not a url at all',
      '',
    ]) {
      const result = parseFigmaUrl(url);
      assert.ok(isFigmaUrlError(result), url);
      assert.equal(result.error, 'invalid-url', url);
      assert.ok(result.message.length > 0);
    }
  });

  it('rejects branch links without a branch key', () => {
    assert.equal(parseFigmaUrl('https://www.figma.com/design/K/branch/?node-id=1-2').error, 'invalid-url');
  });

  it('requires a valid node-id', () => {
    assert.equal(parseFigmaUrl('https://www.figma.com/design/K/N').error, 'missing-node-id');
    assert.equal(parseFigmaUrl('https://www.figma.com/design/K/N?node-id=abc').error, 'missing-node-id');
  });
});

describe('buildFigmaUrl', () => {
  it('turns : into - in node-id', () => {
    assert.equal(buildFigmaUrl('FILE', '1:2'), 'https://www.figma.com/design/FILE/?node-id=1-2');
    assert.equal(buildFigmaUrl('FILE', 'I1:2;3:4'), 'https://www.figma.com/design/FILE/?node-id=I1-2%3B3-4');
  });
});
