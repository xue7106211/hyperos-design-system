import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type IconFontWeight = {
  min: number;
  max: number;
  default: number;
};

export type IconFontMetrics = {
  unitsPerEm: number;
  ascender: number;
  descender: number;
  capHeight: number;
  xHeight: number;
};

export type IconFont = {
  id: string;
  label: string;
  family: string;
  path: string;
  weight: IconFontWeight;
  metrics?: IconFontMetrics;
};

export type IconEntry = {
  id: string;
  fontId: string;
  name: string;
  unicode: string;
  glyphIndex: number;
  advanceWidth?: number;
  bbox?: [number, number, number, number];
};

export type IconManifest = {
  version: number;
  generatedAt?: string;
  fonts: IconFont[];
  icons: IconEntry[];
};

/** Always read from disk so `icons:sync` is visible without restarting the server. */
export function getIconManifest(): IconManifest {
  const path = join(process.cwd(), 'icons', 'manifest.json');
  const raw = readFileSync(path, 'utf8');
  return JSON.parse(raw) as IconManifest;
}
