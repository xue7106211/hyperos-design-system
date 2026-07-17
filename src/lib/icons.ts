import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type IconCategory = {
  id: string;
  label: string;
};

export type IconEntry = {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  path: string;
  multicolor?: boolean;
};

export type IconManifest = {
  version: number;
  generatedAt?: string;
  categories: IconCategory[];
  icons: IconEntry[];
};

/** Always read from disk so `icons:sync` is visible without restarting the server. */
export function getIconManifest(): IconManifest {
  const path = join(process.cwd(), 'icons', 'manifest.json');
  const raw = readFileSync(path, 'utf8');
  return JSON.parse(raw) as IconManifest;
}
