export type SearchDocsHit = {
  title: string;
  url: string;
  snippet: string;
};

const SNIPPET_MAX = 200;

function stripHighlightMarks(text: string): string {
  return text.replace(/<\/?mark>/gi, '').trim();
}

/**
 * 归一化检索结果为 Ask AI 可引用的 hit。
 * 兼容：Fumadocs/Orama 命中，以及早期 Flexsearch enrich 行。
 */
export function normalizeSearchHits(raw: unknown): SearchDocsHit[] {
  if (!Array.isArray(raw)) return [];

  const out: SearchDocsHit[] = [];
  const seenPages = new Set<string>();

  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;

    // Flexsearch enrich: { doc: { title, url, description, content } }
    if ('doc' in row) {
      const doc = (row as { doc?: Record<string, unknown> }).doc;
      if (!doc || typeof doc.url !== 'string' || typeof doc.title !== 'string') {
        continue;
      }
      const url = doc.url;
      if (seenPages.has(url)) continue;
      seenPages.add(url);
      const base =
        (typeof doc.content === 'string' && doc.content.trim()) ||
        (typeof doc.description === 'string' && doc.description.trim()) ||
        '';
      const snippet =
        base.length > SNIPPET_MAX ? `${base.slice(0, SNIPPET_MAX)}…` : base;
      out.push({ title: doc.title, url, snippet });
      continue;
    }

    // Fumadocs Orama: { url, content, type, ... }
    const hit = row as {
      url?: string;
      content?: string;
      title?: string;
      type?: string;
    };
    if (typeof hit.url !== 'string' || !hit.url) continue;

    // 保留锚点命中（如 /drawer#圆角），避免只剩页面标题、丢掉规范正文片段
    if (seenPages.has(hit.url)) continue;
    seenPages.add(hit.url);

    const text = stripHighlightMarks(
      (typeof hit.content === 'string' && hit.content) ||
        (typeof hit.title === 'string' && hit.title) ||
        '',
    );
    if (!text) continue;

    const hash = hit.url.includes('#') ? hit.url.split('#')[1] : '';
    const title = hash
      ? `${text.length > 60 ? `${text.slice(0, 60)}…` : text}（${decodeURIComponent(hash)}）`
      : text.length > 80
        ? `${text.slice(0, 80)}…`
        : text;
    const snippet =
      text.length > SNIPPET_MAX ? `${text.slice(0, SNIPPET_MAX)}…` : text;
    out.push({ title, url: hit.url, snippet });
  }

  return out;
}

type SearchApi = {
  search: (
    query: string,
    options?: { limit?: number },
  ) => Promise<unknown>;
};

let searchApiPromise: Promise<SearchApi> | null = null;

async function getSearchApi(): Promise<SearchApi> {
  if (!searchApiPromise) {
    searchApiPromise = buildSearchApi().catch((err) => {
      searchApiPromise = null;
      throw err;
    });
  }
  return searchApiPromise;
}

async function buildSearchApi(): Promise<SearchApi> {
  const { source } = await import('../source');
  const { createFromSource } = await import('fumadocs-core/search/server');
  const { chineseSearchTokenizer } = await import('../search-tokenizer');

  const os4SearchSource = {
    ...source,
    getPages: () =>
      source.getPages().filter((page) => page.slugs[0] === 'os4'),
  };

  return createFromSource(os4SearchSource, {
    tokenizer: chineseSearchTokenizer,
  });
}

export async function searchDocs(
  query: string,
  limit = 8,
): Promise<SearchDocsHit[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const api = await getSearchApi();
    // 多取一些再归一化，保留页面 + 锚点命中
    const raw = await api.search(q, { limit: Math.max(limit * 4, 16) });
    const hits = normalizeSearchHits(raw).slice(0, limit);
    return enrichHitsWithPageExcerpts(hits, q);
  } catch {
    // Empty hits → model follows 拒答 path instead of an uncaught tool error.
    return [];
  }
}

/** 为命中页补充正文摘录，避免 Orama 只返回标题/标题锚点导致模型无依据可引 */
async function enrichHitsWithPageExcerpts(
  hits: SearchDocsHit[],
  query: string,
): Promise<SearchDocsHit[]> {
  if (hits.length === 0) return hits;

  const { source } = await import('../source');
  const tokens = query
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 1);

  const cache = new Map<string, string>();

  async function loadPageText(pageUrl: string): Promise<string> {
    if (cache.has(pageUrl)) return cache.get(pageUrl)!;
    const path = pageUrl.replace(/^\/docs\//, '').replace(/\/$/, '');
    const slugs = path.split('/').filter(Boolean);
    const page = source.getPage(slugs);
    if (!page || !('getText' in page.data)) {
      cache.set(pageUrl, '');
      return '';
    }
    const text = await page.data.getText('processed');
    cache.set(pageUrl, text);
    return text;
  }

  const enriched: SearchDocsHit[] = [];
  for (const hit of hits) {
    const pageUrl = hit.url.split('#')[0]!;
    const hash = hit.url.includes('#')
      ? decodeURIComponent(hit.url.split('#')[1] || '')
      : '';
    const full = await loadPageText(pageUrl);
    if (!full) {
      enriched.push(hit);
      continue;
    }

    const excerpt =
      (hash && excerptAroundHeading(full, hash)) ||
      excerptAround(full, tokens) ||
      full.slice(0, SNIPPET_MAX);
    const snippet =
      excerpt.length > SNIPPET_MAX
        ? `${excerpt.slice(0, SNIPPET_MAX)}…`
        : excerpt;

    enriched.push({
      ...hit,
      snippet:
        snippet.length > (hit.snippet?.length ?? 0) ? snippet : hit.snippet,
    });
  }
  return enriched;
}

/** 优先截取标题锚点附近正文（如 #圆角） */
function excerptAroundHeading(text: string, heading: string): string {
  if (!heading) return '';
  const patterns = [
    `# ${heading}`,
    `## ${heading}`,
    `### ${heading}`,
    `#### ${heading}`,
    heading,
  ];
  let best = -1;
  for (const p of patterns) {
    const idx = text.indexOf(p);
    if (idx >= 0) {
      best = idx;
      break;
    }
  }
  if (best < 0) return '';
  const start = best;
  const end = Math.min(text.length, best + 280);
  return text.slice(start, end).replace(/\s+/g, ' ').trim();
}

function excerptAround(text: string, tokens: string[]): string {
  const lower = text.toLocaleLowerCase('zh-CN');
  // 优先用查询词；再补常见规范词（避免过早命中文首的「抽屉」概述）
  const preferred = [
    ...tokens.filter((t) => !['的', '是', '多少', '什么', '如何'].includes(t)),
    '圆角',
    'radius',
    '36dp',
    'miuix_raidus',
  ];

  let best = -1;
  for (const token of preferred) {
    const idx = lower.indexOf(token.toLocaleLowerCase('zh-CN'));
    if (idx >= 0) {
      best = idx;
      break;
    }
  }
  if (best < 0) return '';
  const start = Math.max(0, best - 40);
  const end = Math.min(text.length, best + 200);
  return text.slice(start, end).replace(/\s+/g, ' ').trim();
}
