import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { loadFixture } from './__fixtures__/setup.mjs';

const { clearKitCache, fetchKitComponents, fetchNodesForTargets, figmaHttpError, parseKitFileKeys, KIT_CACHE_TTL_MS } =
  await import('./figma-client.ts');
const { getTokenCheckConfig } = await import('./config.ts');
const { handleTokenCheck, readUrls } = await import('./service.ts');

const TOKEN = 'figd_secret_test_token';
const home = loadFixture('nodes-home.json');
const snapshot = loadFixture('snapshot.json');

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
}

/** 记录请求并按路径返回响应 */
function mockFetch(routes) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, token: init?.headers?.['X-Figma-Token'] });
    for (const [pattern, handler] of routes) if (url.includes(pattern)) return handler(url);
    return json({ status: 404, err: 'Not found' }, 404);
  };
  return { fetch, calls };
}

const kitRoutes = [
  ['/components', () => json({ meta: { components: [
    { key: 'kitButtonVariant', name: 'Type=Primary', containing_frame: { containingComponentSet: { name: 'Button' } } },
    { key: 'kitDivider', name: 'Divider', containing_frame: {} },
  ] } })],
  ['/component_sets', () => json({ meta: { component_sets: [{ key: 'kitButtonSet', name: 'Button' }] } })],
];

beforeEach(() => clearKitCache());

describe('figma-client', () => {
  it('maps HTTP errors to designer-facing codes', () => {
    assert.equal(figmaHttpError(401, null).code, 'figma-auth');
    assert.equal(figmaHttpError(403, null).code, 'figma-auth');
    assert.equal(figmaHttpError(404, null).code, 'figma-not-found');
    const limited = figmaHttpError(429, '90');
    assert.equal(limited.code, 'figma-rate-limit');
    assert.match(limited.message, /90 秒后重试/);
    assert.match(figmaHttpError(429, '600').message, /10 分钟后重试/);
    assert.equal(figmaHttpError(429, null).code, 'figma-rate-limit');
    assert.equal(figmaHttpError(500, null).code, 'internal');
  });

  it('merges nodes of the same file into one request', async () => {
    const { fetch, calls } = mockFetch([['/nodes', () => json(home)]]);
    const targets = [
      { url: 'a', fileKey: 'F1', nodeId: '1:2' },
      { url: 'b', fileKey: 'F1', nodeId: '1:4' },
      { url: 'c', fileKey: 'F2', nodeId: '9:9' },
    ];
    const responses = await fetchNodesForTargets(targets, { token: TOKEN, fetch });
    assert.deepEqual(Object.keys(responses).sort(), ['F1', 'F2']);
    assert.equal(calls.length, 2);
    assert.ok(calls[0].url.endsWith('/files/F1/nodes?ids=1%3A2%2C1%3A4'));
    assert.equal(calls[0].token, TOKEN);
  });

  it('collects kit keys and names and caches them for an hour', async () => {
    const { fetch, calls } = mockFetch(kitRoutes);
    const now = Date.now();
    const kit = await fetchKitComponents(['KIT'], { token: TOKEN, fetch, now });
    assert.deepEqual(kit.keys.sort(), ['kitButtonSet', 'kitButtonVariant', 'kitDivider']);
    assert.deepEqual(kit.names.sort(), ['Button', 'Divider']);
    await fetchKitComponents(['KIT'], { token: TOKEN, fetch, now: now + KIT_CACHE_TTL_MS - 1 });
    assert.equal(calls.length, 2);
    await fetchKitComponents(['KIT'], { token: TOKEN, fetch, now: now + KIT_CACHE_TTL_MS + 1 });
    assert.equal(calls.length, 4);
  });

  it('parses kit file keys with a default', () => {
    assert.deepEqual(parseKitFileKeys(undefined), ['7PVSm4yEbknNLFaqauI4EM']);
    assert.deepEqual(parseKitFileKeys(' A, B ,,'), ['A', 'B']);
  });
});

describe('config', () => {
  it('requires a token and respects TOKEN_CHECK_ENABLED=false', () => {
    assert.equal(getTokenCheckConfig({}), null);
    assert.equal(getTokenCheckConfig({ FIGMA_ACCESS_TOKEN: TOKEN, TOKEN_CHECK_ENABLED: 'false' }), null);
    assert.deepEqual(getTokenCheckConfig({ FIGMA_ACCESS_TOKEN: TOKEN, TOKEN_CHECK_KIT_FILE_KEYS: 'K1,K2' }), {
      accessToken: TOKEN,
      kitFileKeys: ['K1', 'K2'],
    });
  });
});

describe('handleTokenCheck', () => {
  const config = { accessToken: TOKEN, kitFileKeys: ['KIT'] };
  const url = 'https://www.figma.com/design/DESIGNfileKey00000000000/x?node-id=1-2';
  const deps = (fetch) => ({ config, getSnapshot: () => snapshot, fetch });

  it('validates the urls field', () => {
    assert.equal(readUrls({ urls: [] }), null);
    assert.equal(readUrls({ urls: Array(11).fill(url) }), null);
    assert.equal(readUrls({ urls: [url, 1] }), null);
    assert.equal(readUrls(null), null);
    assert.deepEqual(readUrls({ urls: [url] }), [url]);
  });

  it('returns not-configured without config', async () => {
    const result = await handleTokenCheck({ urls: [url] }, { config: null, getSnapshot: () => snapshot });
    assert.equal(result.status, 503);
    assert.equal(result.body.error.code, 'not-configured');
  });

  it('rejects invalid bodies and links with the offending url', async () => {
    const empty = await handleTokenCheck({ urls: [] }, deps());
    assert.equal(empty.body.error.code, 'invalid-url');
    const missing = await handleTokenCheck({ urls: ['https://www.figma.com/design/K/x'] }, deps());
    assert.equal(missing.status, 400);
    assert.equal(missing.body.error.code, 'missing-node-id');
    assert.equal(missing.body.error.url, 'https://www.figma.com/design/K/x');
  });

  it('runs a full check', async () => {
    const { fetch } = mockFetch([['/nodes', () => json(home)], ...kitRoutes]);
    const result = await handleTokenCheck({ urls: [url, url] }, deps(fetch));
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    assert.equal(result.body.report.targets.length, 1, '重复链接去重');
    assert.equal(result.body.report.coverage.overall.total, 16);
  });

  it('returns unsupported-node-type for pages', async () => {
    const page = { nodes: { '0:1': { document: { id: '0:1', name: 'Page', type: 'CANVAS', children: [] } } } };
    const { fetch } = mockFetch([['/nodes', () => json(page)], ...kitRoutes]);
    const pageUrl = 'https://www.figma.com/design/K/x?node-id=0-1';
    const result = await handleTokenCheck({ urls: [pageUrl] }, deps(fetch));
    assert.equal(result.body.error.code, 'unsupported-node-type');
    assert.match(result.body.error.message, /Section 或 Frame/);
    assert.equal(result.body.error.url, pageUrl);
  });

  it('maps Figma auth and rate-limit failures without leaking the token', async () => {
    const auth = await handleTokenCheck({ urls: [url] }, deps(mockFetch([['/nodes', () => json({}, 403)], ...kitRoutes]).fetch));
    assert.equal(auth.status, 403);
    assert.equal(auth.body.error.code, 'figma-auth');
    const limited = await handleTokenCheck(
      { urls: [url] },
      deps(mockFetch([['/nodes', () => json({}, 429, { 'retry-after': '30' })], ...kitRoutes]).fetch),
    );
    assert.equal(limited.body.error.code, 'figma-rate-limit');
    assert.match(limited.body.error.message, /30 秒/);
    assert.ok(!JSON.stringify([auth, limited]).includes(TOKEN));
  });

  it('degrades with a warning when the kit cannot be read', async () => {
    const { fetch } = mockFetch([['/nodes', () => json(home)]]);
    const result = await handleTokenCheck({ urls: [url] }, deps(fetch));
    assert.equal(result.body.ok, true);
    const warnings = result.body.report.warnings;
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /MIUIX 组件库读取失败/);
  });

  it('turns network failures into a Chinese internal error', async () => {
    const fetch = async () => {
      throw new TypeError('fetch failed');
    };
    const result = await handleTokenCheck({ urls: [url] }, deps(fetch));
    assert.equal(result.body.error.code, 'internal');
    assert.match(result.body.error.message, /无法连接 Figma/);
  });
});
