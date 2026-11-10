/**
 * /api/token-check 的请求处理（与 Next 解耦，便于测试）。
 */
import type { TokenCheckConfig } from './config';
import { runTokenCheck } from './engine';
import { ERROR_MESSAGES, isTokenCheckError, TokenCheckError } from './errors';
import { fetchKitComponents, fetchNodesForTargets } from './figma-client';
import { isFigmaUrlError, parseFigmaUrl } from './figma-url';
import type { CheckTarget, LegacySnapshot, LibrarySnapshot, TokenCheckErrorCode, TokenCheckResponse } from './types';

export const MAX_URLS = 10;

const HTTP_STATUS: Record<TokenCheckErrorCode, number> = {
  'invalid-url': 400,
  'missing-node-id': 400,
  'unsupported-node-type': 400,
  'figma-auth': 403,
  'figma-not-found': 404,
  'figma-rate-limit': 429,
  'too-large': 413,
  'not-configured': 503,
  internal: 500,
};

export type TokenCheckDeps = {
  config: TokenCheckConfig | null;
  getSnapshot: () => LibrarySnapshot;
  getLegacySnapshot?: () => LegacySnapshot;
  fetch?: (input: string, init?: RequestInit) => Promise<Response>;
  now?: Date;
};

export type TokenCheckResult = { status: number; body: TokenCheckResponse };

function failure(code: TokenCheckErrorCode, message = ERROR_MESSAGES[code], url?: string): TokenCheckResult {
  return { status: HTTP_STATUS[code], body: { ok: false, error: url ? { code, message, url } : { code, message } } };
}

/** 校验请求体：urls 为 1–10 个字符串 */
export function readUrls(body: unknown): string[] | null {
  if (!body || typeof body !== 'object') return null;
  const { urls } = body as { urls?: unknown };
  if (!Array.isArray(urls) || urls.length < 1 || urls.length > MAX_URLS) return null;
  if (!urls.every((url) => typeof url === 'string')) return null;
  return urls as string[];
}

export async function handleTokenCheck(body: unknown, deps: TokenCheckDeps): Promise<TokenCheckResult> {
  if (!deps.config) return failure('not-configured');

  const urls = readUrls(body);
  if (!urls) return failure('invalid-url', `请提供 1–${MAX_URLS} 个 Figma 图层链接。`);

  const targets: CheckTarget[] = [];
  const seen = new Set<string>();
  for (const url of urls) {
    const parsed = parseFigmaUrl(url);
    if (isFigmaUrlError(parsed)) return failure(parsed.error, parsed.message, url);
    const key = `${parsed.fileKey}|${parsed.nodeId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push(parsed);
  }

  const client = { token: deps.config.accessToken, fetch: deps.fetch };
  try {
    const warnings: string[] = [];
    const [nodesResponses, kit] = await Promise.all([
      fetchNodesForTargets(targets, client),
      fetchKitComponents(deps.config.kitFileKeys, client).catch((error: unknown) => {
        const reason = isTokenCheckError(error) ? error.message : '未知错误';
        warnings.push(`MIUIX 组件库读取失败（${reason}），本次未排除组件实例。`);
        return { keys: [] as string[], names: [] as string[] };
      }),
    ]);
    const report = await runTokenCheck({
      targets,
      nodesResponses,
      kitComponentKeys: kit.keys,
      kitComponentNames: kit.names,
      snapshot: deps.getSnapshot(),
      legacySnapshot: deps.getLegacySnapshot?.(),
      warnings,
      now: deps.now,
    });
    // 组件库失败时引擎还会追加一条“未读取到组件列表”，保留更具体的那条
    if (warnings.length) report.warnings = report.warnings.filter((w) => !w.startsWith('未读取到 MIUIX 组件列表'));
    return { status: 200, body: { ok: true, report } };
  } catch (error) {
    if (error instanceof TokenCheckError) return failure(error.code, error.message, error.url);
    console.error('[token-check] unexpected error:', error instanceof Error ? error.message : error);
    return failure('internal');
  }
}
