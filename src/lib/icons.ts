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

let cached: IconManifest | null = null;

export function getIconManifest(): IconManifest {
  if (cached) return cached;

  const path = join(process.cwd(), 'icons', 'manifest.json');
  const raw = readFileSync(path, 'utf8');
  cached = JSON.parse(raw) as IconManifest;
  return cached;
}
