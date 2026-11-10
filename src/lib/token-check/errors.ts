import type { TokenCheckErrorCode } from './types';

/** 面向设计师的默认错误文案 */
export const ERROR_MESSAGES: Record<TokenCheckErrorCode, string> = {
  'invalid-url': '这不是 Figma 设计文件链接。请在 Figma 中选中 Section 或 Frame，右键「复制链接」后粘贴。',
  'missing-node-id': '链接里没有图层信息。请在 Figma 中选中 Section 或 Frame，右键「复制链接」，不要直接复制浏览器地址栏。',
  'unsupported-node-type': '链接指向的是整个页面。请在 Figma 中选中 Section 或 Frame，右键复制链接。',
  'figma-auth': '检查服务没有权限读取这个文件。请确认文件已共享给检查服务使用的 Figma 账号，或联系管理员。',
  'figma-not-found': '找不到这个文件或图层。请确认链接没有失效，图层没有被删除。',
  'figma-rate-limit': 'Figma 接口请求过于频繁，请稍后重试。',
  'too-large': '选中的范围太大。请缩小到单个 Section 或几个 Frame 后再检查。',
  'not-configured': 'Token 检查服务尚未开启，请联系站点管理员。',
  internal: '检查服务出错了，请稍后重试。',
};

export class TokenCheckError extends Error {
  readonly code: TokenCheckErrorCode;
  readonly url?: string;

  constructor(code: TokenCheckErrorCode, message: string = ERROR_MESSAGES[code], url?: string) {
    super(message);
    this.name = 'TokenCheckError';
    this.code = code;
    this.url = url;
  }
}

export function isTokenCheckError(error: unknown): error is TokenCheckError {
  return error instanceof TokenCheckError;
}
