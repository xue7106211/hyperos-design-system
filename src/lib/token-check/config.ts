import { parseKitFileKeys } from './figma-client';

export type TokenCheckConfig = {
  accessToken: string;
  kitFileKeys: string[];
};

/** 读取服务端配置；未开启或缺少 FIGMA_ACCESS_TOKEN 时返回 null */
export function getTokenCheckConfig(env: Record<string, string | undefined> = process.env): TokenCheckConfig | null {
  if (env.TOKEN_CHECK_ENABLED?.trim().toLowerCase() === 'false') return null;
  const accessToken = env.FIGMA_ACCESS_TOKEN?.trim();
  if (!accessToken) return null;
  return { accessToken, kitFileKeys: parseKitFileKeys(env.TOKEN_CHECK_KIT_FILE_KEYS) };
}
