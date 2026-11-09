import { getTokenCheckConfig } from '@/lib/token-check/config';
import { getLegacySnapshot, getLibrarySnapshot } from '@/lib/token-check/library-snapshot';
import { handleTokenCheck } from '@/lib/token-check/service';
import type { TokenCheckResponse } from '@/lib/token-check/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    const response: TokenCheckResponse = {
      ok: false,
      error: { code: 'invalid-url', message: '请求格式不正确，请刷新页面后重试。' },
    };
    return Response.json(response, { status: 400 });
  }

  const result = await handleTokenCheck(body, {
    config: getTokenCheckConfig(),
    getSnapshot: getLibrarySnapshot,
    getLegacySnapshot,
  });
  return Response.json(result.body, { status: result.status });
}
