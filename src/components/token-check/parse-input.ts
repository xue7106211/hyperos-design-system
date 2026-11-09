/**
 * 客户端预校验：只拦明显不对的输入，节点类型等仍以服务端判定为准。
 */

export const MAX_URLS = 10;

export type LineStatus =
  | { kind: 'ok' }
  | { kind: 'duplicate' }
  | { kind: 'error'; message: string };

export type ParsedLine = {
  /** 文本框中的行号（从 1 开始） */
  line: number;
  raw: string;
  status: LineStatus;
};

export type ParsedInput = {
  lines: ParsedLine[];
  /** 可提交的链接（去重后、按出现顺序） */
  urls: string[];
  errorCount: number;
  overLimit: boolean;
};

function checkLine(raw: string): LineStatus {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { kind: 'error', message: '不是有效的链接' };
  }

  const host = url.hostname.toLowerCase();
  if (host !== 'figma.com' && !host.endsWith('.figma.com')) {
    return { kind: 'error', message: '不是 Figma 链接' };
  }

  const segment = url.pathname.split('/').filter(Boolean)[0];
  if (segment === 'board' || segment === 'slides' || segment === 'make' || segment === 'proto') {
    return { kind: 'error', message: '只支持设计文件（/design/ 或 /file/）' };
  }
  if (segment !== 'design' && segment !== 'file') {
    return { kind: 'error', message: '无法识别的 Figma 链接' };
  }

  if (!url.searchParams.get('node-id')) {
    return { kind: 'error', message: '缺少 node-id，请复制图层链接而不是文件链接' };
  }

  return { kind: 'ok' };
}

export function parseUrlInput(text: string): ParsedInput {
  const seen = new Set<string>();
  const lines: ParsedLine[] = [];
  const urls: string[] = [];
  let errorCount = 0;

  text.split(/\r?\n/).forEach((rawLine, index) => {
    const raw = rawLine.trim();
    if (!raw) return;

    let status = checkLine(raw);
    if (status.kind === 'ok') {
      if (seen.has(raw)) {
        status = { kind: 'duplicate' };
      } else {
        seen.add(raw);
        urls.push(raw);
      }
    } else {
      errorCount += 1;
    }
    lines.push({ line: index + 1, raw, status });
  });

  return { lines, urls, errorCount, overLimit: urls.length > MAX_URLS };
}
