import { ERROR_MESSAGES } from './errors';
import type { CheckTarget, TokenCheckErrorCode } from './types';

export type FigmaUrlError = { error: TokenCheckErrorCode; message: string };

const NODE_ID_PATTERN = /^I?\d+:\d+(;\d+:\d+)*$/;

function fail(error: TokenCheckErrorCode, message = ERROR_MESSAGES[error]): FigmaUrlError {
  return { error, message };
}

export function isFigmaUrlError(value: CheckTarget | FigmaUrlError): value is FigmaUrlError {
  return 'error' in value;
}

/**
 * 解析 Figma 设计文件链接。
 * 支持 `/design/:fileKey/…` 与旧版 `/file/:fileKey/…`；带 `/branch/:branchKey/` 时用 branchKey 作为 fileKey。
 * `node-id` 中的 `-` 转为 `:`，URL 编码的 `%3A` 由 URLSearchParams 自动解码。
 */
export function parseFigmaUrl(input: string): CheckTarget | FigmaUrlError {
  const raw = typeof input === 'string' ? input.trim() : '';
  if (!raw) return fail('invalid-url', '链接为空。请粘贴 Figma 图层链接。');

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return fail('invalid-url');
  }

  const host = url.hostname.toLowerCase();
  if (host !== 'figma.com' && !host.endsWith('.figma.com')) return fail('invalid-url');

  const segments = url.pathname.split('/').filter(Boolean);
  const [kind, fileKey] = segments;
  if (kind !== 'design' && kind !== 'file') {
    if (kind === 'proto' || kind === 'board' || kind === 'slides' || kind === 'make') {
      return fail('invalid-url', '只支持 Figma 设计文件（链接包含 /design/），原型、FigJam、Slides 和 Make 链接无法检查。');
    }
    return fail('invalid-url');
  }
  if (!fileKey || !/^[\w-]+$/.test(fileKey)) return fail('invalid-url');

  let key = fileKey;
  if (segments[2] === 'branch') {
    const branchKey = segments[3];
    if (!branchKey || !/^[\w-]+$/.test(branchKey)) return fail('invalid-url');
    key = branchKey;
  }

  const rawNodeId = url.searchParams.get('node-id');
  if (!rawNodeId) return fail('missing-node-id');
  const nodeId = rawNodeId.trim().replace(/-/g, ':');
  if (!NODE_ID_PATTERN.test(nodeId)) return fail('missing-node-id', '链接里的图层 id 无法识别。请在 Figma 中重新右键「复制链接」。');

  return { url: raw, fileKey: key, nodeId };
}

/** 生成跳转到图层的 Figma 链接 */
export function buildFigmaUrl(fileKey: string, nodeId: string): string {
  return `https://www.figma.com/design/${fileKey}/?node-id=${encodeURIComponent(nodeId.replace(/:/g, '-'))}`;
}
