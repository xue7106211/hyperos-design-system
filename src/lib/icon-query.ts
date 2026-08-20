import type { IconEntry } from './icons';

export const ALL_FONTS = 'all';

export const COLOR_PRESETS = [
  { id: 'black', hex: '#111111', label: '黑' },
  { id: 'white', hex: '#FFFFFF', label: '白' },
  { id: 'brand', hex: '#FF6900', label: '品牌' },
];

export function formatUnicode(hex: string): string {
  const h = String(hex)
    .replace(/^U\+/i, '')
    .replace(/^0x/i, '')
    .toUpperCase();
  return `U+${h.padStart(4, '0')}`;
}

export function codePointToChar(hex: string): string {
  return String.fromCodePoint(Number.parseInt(String(hex).replace(/^U\+/i, ''), 16));
}

export function parseHexColor(input: string, fallback: string): string {
  const m = String(input)
    .trim()
    .match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return fallback;
  return `#${m[1].toUpperCase()}`;
}

function linearizeChannel(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function previewSurfaceHex(hex: string): string {
  const raw = parseHexColor(hex, '#111111').slice(1);
  const r = linearizeChannel(Number.parseInt(raw.slice(0, 2), 16) / 255);
  const g = linearizeChannel(Number.parseInt(raw.slice(2, 4), 16) / 255);
  const b = linearizeChannel(Number.parseInt(raw.slice(4, 6), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? '#1A1A1A' : '#F5F5F5';
}

function extractHexQuery(query: string): string {
  let s = query.trim().toLowerCase();
  s = s.replace(/^(u\+|\\u|0x)/, '');
  return /^[0-9a-f]+$/.test(s) ? s : '';
}

function digitQuery(query: string): string {
  return query.replace(/\D/g, '');
}

type FilterOptions = {
  fontId?: string;
  query?: string;
};

export function filterIcons(icons: IconEntry[], { fontId = ALL_FONTS, query = '' }: FilterOptions = {}): IconEntry[] {
  const suite =
    fontId && fontId !== ALL_FONTS
      ? icons.filter((icon) => icon.fontId === fontId)
      : icons;

  const q = query.trim().toLowerCase();
  if (!q) return suite;

  const hexQ = extractHexQuery(q);
  const digits = digitQuery(q);

  return suite.filter((icon) => {
    if (icon.name.toLowerCase().includes(q) || icon.id.toLowerCase().includes(q)) {
      return true;
    }
    if (hexQ && icon.unicode.toLowerCase().includes(hexQ)) return true;
    if (digits && String(icon.glyphIndex).includes(digits)) return true;
    return false;
  });
}
