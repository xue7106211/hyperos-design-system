import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type IconFontWeight = {
  min: number;
  max: number;
  default: number;
};

export type IconFont = {
  id: string;
  label: string;
  family: string;
  path: string;
  weight: IconFontWeight;
};

export type IconEntry = {
  id: string;
  fontId: string;
  name: string;
  unicode: string;
  glyphIndex: number;
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
