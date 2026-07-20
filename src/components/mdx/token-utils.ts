import componentDark from '../../../tokens/component.dark.json';
import componentLight from '../../../tokens/component.light.json';
import referenceDark from '../../../tokens/reference.dark.json';
import referenceLight from '../../../tokens/reference.light.json';
import semanticDark from '../../../tokens/semantic.dark.json';
import semanticLight from '../../../tokens/semantic.light.json';

export type TokenMode = 'light' | 'dark';

export type TokenLayer = 'reference' | 'semantic' | 'component';

export type TokenEntry = {
  /** Figma / MIUIX 原名（miuix_*），无层/分组前缀 */
  name: string;
  /** 文档站过滤用路径，如 semantic.bg.layout.miuix_…；不用于展示 */
  path: string;
  type?: string;
  value: string;
  description?: string;
};

type TokenTree = Record<string, unknown>;

const catalogs: Record<TokenMode, Record<TokenLayer, TokenTree>> = {
  light: {
    reference: referenceLight as TokenTree,
    semantic: semanticLight as TokenTree,
    component: componentLight as TokenTree,
  },
  dark: {
    reference: referenceDark as TokenTree,
    semantic: semanticDark as TokenTree,
    component: componentDark as TokenTree,
  },
};

function isTokenObject(value: unknown): value is {
  $type?: string;
  $value?: unknown;
  $description?: string;
} {
  return typeof value === 'object' && value !== null && '$value' in value;
}

export function collectTokens(
  obj: Record<string, unknown>,
  prefix = '',
): TokenEntry[] {
  const results: TokenEntry[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;

    const path = prefix ? `${prefix}.${key}` : key;

    if (isTokenObject(value)) {
      results.push({
        name: key,
        path,
        type: value.$type,
        value: String(value.$value ?? ''),
        description: value.$description,
      });
      continue;
    }

    if (value && typeof value === 'object') {
      results.push(...collectTokens(value as Record<string, unknown>, path));
    }
  }

  return results;
}

export function getAllTokens(mode: TokenMode = 'light'): TokenEntry[] {
  const layers = catalogs[mode];
  const results: TokenEntry[] = [];

  for (const layer of ['reference', 'semantic', 'component'] as TokenLayer[]) {
    results.push(...collectTokens(layers[layer], layer));
  }

  return results;
}

export function filterTokensByGroups(
  groups: string[],
  mode: TokenMode = 'light',
): TokenEntry[] {
  const all = getAllTokens(mode);
  if (groups.length === 0) return all;

  return all.filter((token) =>
    groups.some(
      (group) =>
        token.name === group ||
        token.path === group ||
        token.path.startsWith(`${group}.`),
    ),
  );
}

export function isColorToken(token: TokenEntry): boolean {
  if (token.type === 'color') return true;
  const value = token.value.trim();
  return (
    value.startsWith('#') ||
    value.startsWith('rgb') ||
    value.startsWith('hsl')
  );
}

export function isPaintValue(value: string): boolean {
  const v = value.trim();
  return v.startsWith('#') || v.startsWith('rgb') || v.startsWith('hsl');
}
