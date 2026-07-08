import tokensData from '../../../tokens/tokens.json';

export type TokenEntry = {
  name: string;
  type?: string;
  value: string;
  description?: string;
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
        name: path,
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

export function getAllTokens(): TokenEntry[] {
  return collectTokens(tokensData as Record<string, unknown>);
}

export function filterTokensByGroups(groups: string[]): TokenEntry[] {
  const all = getAllTokens();
  if (groups.length === 0) return all;

  return all.filter((token) =>
    groups.some((group) => token.name === group || token.name.startsWith(`${group}.`)),
  );
}

export function isColorToken(token: TokenEntry): boolean {
  return token.type === 'color' || token.name.startsWith('color.');
}
