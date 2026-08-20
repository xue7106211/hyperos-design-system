import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ALL_FONTS,
  codePointToChar,
  filterIcons,
  formatBBox,
  formatUnicode,
  parseHexColor,
  previewSurfaceHex,
  unicodeToDecimal,
} from './icon-query.ts';

const sample = [
  { id: 'symbols.reset', fontId: 'symbols', name: 'reset', unicode: 'F0000', glyphIndex: 1 },
  { id: 'symbols.play', fontId: 'symbols', name: 'play', unicode: 'F0002', glyphIndex: 3 },
  { id: 'small.uF02AA', fontId: 'small', name: 'uF02AA', unicode: 'F02AA', glyphIndex: 1 },
];

describe('unicodeToDecimal', () => {
  it('parses 5-digit PUA hex', () => {
    assert.equal(unicodeToDecimal('F0000'), 983040);
    assert.equal(unicodeToDecimal('U+F0000'), 983040);
  });
});

describe('formatBBox', () => {
  it('joins four integers, em dash when missing', () => {
    assert.equal(formatBBox([112, -95, 1222, 931]), '112, -95, 1222, 931');
    assert.equal(formatBBox(undefined), '—');
  });
});

describe('formatUnicode', () => {
  it('pads to at least 4 uppercase hex digits with U+ prefix', () => {
    assert.equal(formatUnicode('E1'), 'U+00E1');
    assert.equal(formatUnicode('f0000'), 'U+F0000');
    assert.equal(formatUnicode('F0000'), 'U+F0000');
  });
});

describe('codePointToChar', () => {
  it('maps hex to a single character', () => {
    assert.equal(codePointToChar('F0000'), String.fromCodePoint(0xf0000));
  });
});

describe('parseHexColor', () => {
  it('accepts #rrggbb and rrggbb, keeps last valid on junk', () => {
    assert.equal(parseHexColor('#ff6900', '#111111'), '#FF6900');
    assert.equal(parseHexColor('111111', '#FF6900'), '#111111');
    assert.equal(parseHexColor('zzz', '#111111'), '#111111');
  });
});

describe('previewSurfaceHex', () => {
  it('uses a dark tile for light glyphs', () => {
    assert.equal(previewSurfaceHex('#FFFFFF'), '#1A1A1A');
    assert.equal(previewSurfaceHex('#111111'), '#F5F5F5');
  });

  it('uses linearized relative luminance at the 0.179 threshold', () => {
    assert.equal(previewSurfaceHex('#C9C9C9'), '#1A1A1A');
    assert.equal(previewSurfaceHex('#FF6900'), '#1A1A1A');
  });
});

describe('filterIcons', () => {
  it('returns all when fontId is all and query is empty', () => {
    assert.equal(filterIcons(sample, { fontId: ALL_FONTS, query: '' }).length, 3);
  });

  it('filters by fontId', () => {
    const hits = filterIcons(sample, { fontId: 'small', query: '' });
    assert.deepEqual(hits.map((i) => i.id), ['small.uF02AA']);
  });

  it('matches name, U+F0000, f0000, and glyph index', () => {
    assert.equal(filterIcons(sample, { fontId: ALL_FONTS, query: 'RESET' })[0].name, 'reset');
    assert.equal(filterIcons(sample, { fontId: ALL_FONTS, query: 'U+F0000' })[0].name, 'reset');
    assert.equal(filterIcons(sample, { fontId: ALL_FONTS, query: ' f0000 ' })[0].name, 'reset');
    assert.equal(filterIcons(sample, { fontId: 'symbols', query: '3' })[0].name, 'play');
  });

  it('does not treat non-hex queries as unicode hex', () => {
    assert.equal(filterIcons(sample, { fontId: ALL_FONTS, query: 'zzzf' }).length, 0);
    assert.equal(filterIcons(sample, { fontId: ALL_FONTS, query: '#F0000' }).length, 0);
  });

  it('matches icon id substring', () => {
    assert.equal(filterIcons(sample, { fontId: ALL_FONTS, query: 'symbols' })[0].id, 'symbols.reset');
  });
});
