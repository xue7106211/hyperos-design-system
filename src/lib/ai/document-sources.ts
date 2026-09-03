export type DocumentSource = { href: string; title: string };

type MessageLike = { role: string; parts: unknown[] };

const MARKDOWN_DOCUMENT_LINK = /\[([^\]]+)\]\((\/[^)\s]+)\)/g;

function isInternalAppLink(href: unknown): href is string {
  return (
    typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')
  );
}

function getDocumentCitations(message: MessageLike): DocumentSource[] {
  if (message.role !== 'assistant') return [];

  const citations = new Map<string, DocumentSource>();
  for (const part of message.parts) {
    if (
      !part ||
      typeof part !== 'object' ||
      (part as { type?: unknown }).type !== 'text' ||
      typeof (part as { text?: unknown }).text !== 'string'
    ) {
      continue;
    }

    const text = (part as { text: string }).text;
    for (const match of text.matchAll(MARKDOWN_DOCUMENT_LINK)) {
      const title = match[1]?.trim();
      const href = match[2];
      if (!title || !isInternalAppLink(href)) continue;
      citations.set(href, { href, title });
    }
  }

  return [...citations.values()];
}

function getSearchResultSources(message: MessageLike): DocumentSource[] {
  if (message.role !== 'assistant') return [];

  const sources = new Map<string, DocumentSource>();
  for (const part of message.parts) {
    if (!part || typeof part !== 'object') continue;

    const invocation = part as {
      output?: unknown;
      state?: unknown;
      type?: unknown;
    };
    if (
      invocation.type !== 'tool-search' ||
      invocation.state !== 'output-available' ||
      !invocation.output ||
      typeof invocation.output !== 'object'
    ) {
      continue;
    }

    const result = invocation.output as { hits?: unknown; status?: unknown };
    if (result.status !== 'ok' || !Array.isArray(result.hits)) continue;

    for (const hit of result.hits) {
      if (!hit || typeof hit !== 'object') continue;
      const { title, url } = hit as { title?: unknown; url?: unknown };
      if (typeof title !== 'string' || !title.trim() || !isInternalAppLink(url)) {
        continue;
      }
      sources.set(url, { href: url, title: title.trim() });
    }
  }

  return [...sources.values()];
}

/**
 * 首选模型在正文中明确引用的文档；若模型遗漏 Markdown 链接，则展示同一轮
 * 检索工具已返回的文档，避免 Sources 因模型格式波动而消失。
 */
export function getDocumentSources(message: MessageLike): DocumentSource[] {
  const citations = getDocumentCitations(message);
  return citations.length > 0 ? citations : getSearchResultSources(message);
}
