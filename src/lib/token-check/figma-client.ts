/**
 * Figma REST 客户端（仅服务端）。不要在日志或错误信息中输出 access token。
 */
import { ERROR_MESSAGES, TokenCheckError } from './errors';
import type { FigmaNodesResponse } from './figma-api-types';
import type { CheckTarget } from './types';

const FIGMA_API = 'https://api.figma.com/v1';
// 低于路由 maxDuration（60s），超时时还能把「缩小范围」的提示返回给用户
const REQUEST_TIMEOUT_MS = 50_000;
export const KIT_CACHE_TTL_MS = 60 * 60 * 1000;
export const DEFAULT_KIT_FILE_KEYS = ['7PVSm4yEbknNLFaqauI4EM'];

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type FigmaClientOptions = {
  token: string;
  /** 测试注入 */
  fetch?: FetchLike;
};

function formatWait(seconds: number): string {
  if (seconds < 120) return `${Math.max(1, Math.ceil(seconds))} 秒`;
  if (seconds < 7200) return `${Math.ceil(seconds / 60)} 分钟`;
  return `${Math.ceil(seconds / 3600)} 小时`;
}

/** HTTP 状态 → 面向设计师的错误 */
export function figmaHttpError(status: number, retryAfter: string | null, url?: string): TokenCheckError {
  if (status === 401 || status === 403) return new TokenCheckError('figma-auth', undefined, url);
  if (status === 404) return new TokenCheckError('figma-not-found', undefined, url);
  if (status === 429) {
    const seconds = retryAfter ? Number(retryAfter) : NaN;
    const message = Number.isFinite(seconds) && seconds > 0
      ? `Figma 接口请求过于频繁，请在 ${formatWait(seconds)}后重试。`
      : ERROR_MESSAGES['figma-rate-limit'];
    return new TokenCheckError('figma-rate-limit', message, url);
  }
  return new TokenCheckError('internal', `Figma 接口返回异常（HTTP ${status}），请稍后重试。`, url);
}

async function figmaGet<T>(path: string, options: FigmaClientOptions, url?: string): Promise<T> {
  const doFetch = options.fetch ?? fetch;
  let response: Response;
  try {
    response = await doFetch(`${FIGMA_API}${path}`, {
      headers: { 'X-Figma-Token': options.token },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    throw new TokenCheckError(
      'internal',
      timedOut ? 'Figma 接口响应超时。请缩小检查范围后重试。' : '无法连接 Figma，请稍后重试。',
      url,
    );
  }
  if (!response.ok) throw figmaHttpError(response.status, response.headers.get('retry-after'), url);
  try {
    return (await response.json()) as T;
  } catch {
    throw new TokenCheckError('internal', 'Figma 返回的数据无法解析，请稍后重试。', url);
  }
}

/** 同一文件的多个节点合并为一次 /nodes 请求；不同文件并行请求 */
export async function fetchNodesForTargets(
  targets: CheckTarget[],
  options: FigmaClientOptions,
): Promise<Record<string, FigmaNodesResponse>> {
  const byFile = new Map<string, CheckTarget[]>();
  for (const target of targets) byFile.set(target.fileKey, [...(byFile.get(target.fileKey) ?? []), target]);

  const entries = await Promise.all(
    [...byFile].map(async ([fileKey, fileTargets]) => {
      const ids = [...new Set(fileTargets.map((target) => target.nodeId))].join(',');
      const response = await figmaGet<FigmaNodesResponse>(
        `/files/${encodeURIComponent(fileKey)}/nodes?ids=${encodeURIComponent(ids)}`,
        options,
        fileTargets[0].url,
      );
      return [fileKey, response] as const;
    }),
  );
  return Object.fromEntries(entries);
}

type ComponentsResponse = {
  meta?: {
    components?: { key: string; name: string; containing_frame?: { containingComponentSet?: unknown } | null }[];
  };
};
type ComponentSetsResponse = { meta?: { component_sets?: { key: string; name: string }[] } };

const kitCache = new Map<string, { at: number; data: { keys: string[]; names: string[] } }>();

export function clearKitCache(): void {
  kitCache.clear();
}

async function fetchKitFile(fileKey: string, options: FigmaClientOptions, now: number) {
  const cached = kitCache.get(fileKey);
  if (cached && now - cached.at < KIT_CACHE_TTL_MS) return cached.data;

  const path = `/files/${encodeURIComponent(fileKey)}`;
  const [components, componentSets] = await Promise.all([
    figmaGet<ComponentsResponse>(`${path}/components`, options),
    figmaGet<ComponentSetsResponse>(`${path}/component_sets`, options),
  ]);
  const keys: string[] = [];
  const names: string[] = [];
  for (const component of components.meta?.components ?? []) {
    keys.push(component.key);
    // 变体名（如 `Type=Primary`）没有识别价值，只收独立组件名
    if (!component.containing_frame?.containingComponentSet) names.push(component.name);
  }
  for (const set of componentSets.meta?.component_sets ?? []) {
    keys.push(set.key);
    names.push(set.name);
  }
  const data = { keys, names };
  kitCache.set(fileKey, { at: now, data });
  return data;
}

/** MIUIX UI Kit 已发布组件与组件集（按 Kit 文件内存缓存 1 小时） */
export async function fetchKitComponents(
  kitFileKeys: string[],
  options: FigmaClientOptions & { now?: number },
): Promise<{ keys: string[]; names: string[] }> {
  const now = options.now ?? Date.now();
  const results = await Promise.all(kitFileKeys.map((fileKey) => fetchKitFile(fileKey, options, now)));
  return {
    keys: [...new Set(results.flatMap((result) => result.keys))],
    names: [...new Set(results.flatMap((result) => result.names))],
  };
}

export function parseKitFileKeys(raw: string | undefined): string[] {
  const keys = (raw ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
  return keys.length ? keys : DEFAULT_KIT_FILE_KEYS;
}
