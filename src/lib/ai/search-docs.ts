export type SearchDocsHit = {
  title: string;
  url: string;
  snippet: string;
};

/**
 * 检索结果三态：命中 / 无命中（hits 为空）/ 检索不可用。
 * 前两者都是 `ok`，模型据此走引用或拒答；`unavailable` 让模型改口「检索服务异常」，
 * 而不是把基础设施故障说成「文档里没有」。
 */
export type SearchDocsResult =
  | { status: 'ok'; hits: SearchDocsHit[] }
  | { status: 'unavailable'; error: string };

const SNIPPET_MAX = 200;
/** 摘录窗口：略大于 SNIPPET_MAX，留出截断余量 */
const EXCERPT_WINDOW = 240;
/** 命中词前保留的上下文长度 */
const EXCERPT_LEAD = 40;
/** 单个词最多考察的出现位置，避免长文档退化成 O(n²) */
const MAX_OCCURRENCES_PER_TOKEN = 24;

export const SEARCH_UNAVAILABLE_MESSAGE = '文档检索服务暂时不可用';

/** 只承担句法作用、对定位正文无帮助的词 */
const QUERY_STOPWORDS = new Set([
  '的',
  '了',
  '是',
  '在',
  '和',
  '与',
  '或',
  '吗',
  '呢',
  '有',
  '要',
  '需要',
  '应该',
  '可以',
  '多少',
  '几个',
  '什么',
  '怎么',
  '怎样',
  '如何',
  '为什么',
  '哪些',
  '哪个',
  'the',
  'a',
  'an',
  'of',
  'is',
  'are',
  'how',
  'what',
  'which',
]);

function stripHighlightMarks(text: string): string {
  return text.replace(/<\/?mark>/gi, '').trim();
}

/**
 * 归一化检索结果为 Ask AI 可引用的 hit（Fumadocs / Orama 命中形状）。
 */
export function normalizeSearchHits(raw: unknown): SearchDocsHit[] {
  if (!Array.isArray(raw)) return [];

  const out: SearchDocsHit[] = [];
  const seenPages = new Set<string>();

  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;

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

/**
 * 查询词切分。中文查询没有空格，按空白切分会得到整句，后续 indexOf 必然落空。
 *
 * 配置与 `src/lib/search-tokenizer.ts`（Orama 索引侧）保持一致——同样的
 * `Intl.Segmenter('zh-CN', { granularity: 'word' })` + NFKC + 小写，
 * 这样查询与索引的切分口径相同。此处不 import 那个模块：本文件被
 * `search-docs.test.mjs` 用 `node --test` 直接加载，顶层相对导入会解析失败。
 */
const queryWordSegmenter = new Intl.Segmenter('zh-CN', {
  granularity: 'word',
});

type QueryWord = { text: string; start: number; end: number };

function segmentQuery(query: string): QueryWord[] {
  const normalized = query.normalize('NFKC').toLocaleLowerCase('zh-CN');
  const out: QueryWord[] = [];
  for (const item of queryWordSegmenter.segment(normalized)) {
    if (!item.isWordLike) continue;
    const text = item.segment.trim();
    if (!text) continue;
    out.push({
      text,
      start: item.index,
      end: item.index + item.segment.length,
    });
  }
  return out;
}

/**
 * ICU 会把「圆角」这类复合词切成「圆 / 角」，单字命中太廉价、定位不准
 * （早期实现正是因此才硬编码了回退词）。这里把停用词之间**字符相邻**的词
 * 重新粘成短语，让长片段参与打分。
 *
 * 取相邻词的全部 n-gram（n ≥ 2），不只是最长那一段：查「抽屉圆角」时
 * 整段在正文里不存在，真正需要的是其中的「圆角」。
 */
function joinAdjacentPhrases(words: QueryWord[]): string[] {
  const phrases: string[] = [];
  let buffer: QueryWord[] = [];

  const flush = () => {
    for (let i = 0; i < buffer.length; i += 1) {
      for (let j = i + 1; j < buffer.length; j += 1) {
        phrases.push(
          buffer
            .slice(i, j + 1)
            .map((w) => w.text)
            .join(''),
        );
      }
    }
    buffer = [];
  };

  for (const word of words) {
    if (QUERY_STOPWORDS.has(word.text)) {
      flush();
      continue;
    }
    const previous = buffer.at(-1);
    if (previous && previous.end !== word.start) flush();
    buffer.push(word);
  }
  flush();

  return phrases;
}

export function tokenizeQuery(query: string): string[] {
  if (!query.trim()) return [];

  const words = segmentQuery(query);
  const meaningful = words
    .map((w) => w.text)
    .filter((token) => !QUERY_STOPWORDS.has(token));

  // 全是停用词时退回原始分词，宁可弱定位也不要完全无依据
  const base = meaningful.length > 0 ? meaningful : words.map((w) => w.text);
  const candidates = [...new Set([...base, ...joinAdjacentPhrases(words)])];

  // 有 ≥2 字的词时丢掉单字：单字在长文档里几乎必然命中，会把摘录拽偏
  const multiChar = candidates.filter((token) => token.length > 1);
  return multiChar.length > 0 ? multiChar : candidates;
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
): Promise<SearchDocsResult> {
  const q = query.trim();
  if (!q) return { status: 'ok', hits: [] };

  try {
    const api = await getSearchApi();
    // 多取一些再归一化，保留页面 + 锚点命中
    const raw = await api.search(q, { limit: Math.max(limit * 4, 16) });
    const hits = normalizeSearchHits(raw).slice(0, limit);
    return { status: 'ok', hits: await enrichHitsWithPageExcerpts(hits, q) };
  } catch (error) {
    // 索引构建 / MDX 读取失败属于故障，不能伪装成「文档里没有」
    console.error('[ask-ai/search-docs]', error);
    return { status: 'unavailable', error: SEARCH_UNAVAILABLE_MESSAGE };
  }
}

/** 为命中页补充正文摘录，避免 Orama 只返回标题/标题锚点导致模型无依据可引 */
async function enrichHitsWithPageExcerpts(
  hits: SearchDocsHit[],
  query: string,
): Promise<SearchDocsHit[]> {
  if (hits.length === 0) return hits;

  const { source } = await import('../source');
  const tokens = tokenizeQuery(query);

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
export function excerptAroundHeading(text: string, heading: string): string {
  if (!heading) return '';

  // 行首锚定：`indexOf('# 圆角')` 会在 `## 圆角` 里命中并偏移一位，切出半个标题
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headingLine = new RegExp(`^#{1,6}[ \\t]+${escaped}[ \\t]*$`, 'm');

  let best = text.search(headingLine);
  if (best < 0) best = text.indexOf(heading);
  if (best < 0) return '';

  const end = Math.min(text.length, best + EXCERPT_WINDOW);
  return text.slice(best, end).replace(/\s+/g, ' ').trim();
}

function collectOccurrences(
  haystack: string,
  token: string,
  limit: number,
): number[] {
  const out: number[] = [];
  let idx = haystack.indexOf(token);
  while (idx >= 0 && out.length < limit) {
    out.push(idx);
    idx = haystack.indexOf(token, idx + token.length);
  }
  return out;
}

/**
 * 选取覆盖查询词最多的正文窗口。
 *
 * 只用查询词打分——不带任何题材偏好的回退词表，否则无关查询的摘录会被
 * 拽向某个固定话题（早期实现曾硬编码「圆角 / 36dp」，是调试 Bottom Sheet 时的残留）。
 * 找不到任何查询词就返回空串，交由调用方回退到页首。
 */
export function excerptAround(text: string, tokens: string[]): string {
  if (!text || tokens.length === 0) return '';

  const lower = text.toLocaleLowerCase('zh-CN');
  const normalized = [
    ...new Set(
      tokens
        .map((token) => token.trim().toLocaleLowerCase('zh-CN'))
        .filter(Boolean),
    ),
  ];

  const found = normalized
    .map((token) => ({
      token,
      at: collectOccurrences(lower, token, MAX_OCCURRENCES_PER_TOKEN),
    }))
    .filter((entry) => entry.at.length > 0);

  if (found.length === 0) return '';

  let bestStart = -1;
  let bestScore = -1;

  for (const entry of found) {
    for (const position of entry.at) {
      const start = Math.max(0, position - EXCERPT_LEAD);
      const end = Math.min(lower.length, start + EXCERPT_WINDOW);
      // 窗口内命中的不同查询词越多越好；长词信息量更大，按长度加权
      let score = 0;
      for (const other of found) {
        if (other.at.some((at) => at >= start && at < end)) {
          score += other.token.length;
        }
      }
      // 严格大于：同分时保留更靠前的窗口
      if (score > bestScore) {
        bestScore = score;
        bestStart = start;
      }
    }
  }

  if (bestStart < 0) return '';
  return text
    .slice(bestStart, Math.min(text.length, bestStart + EXCERPT_WINDOW))
    .replace(/\s+/g, ' ')
    .trim();
}
