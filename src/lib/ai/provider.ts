import { createAnthropic } from '@ai-sdk/anthropic';
import { getMiLlmConfig } from './config';

/**
 * 小米内网 LLM 网关使用 Anthropic Messages API（Bearer），
 * 并要求每次请求带唯一 X-Model-Request-Id。
 *
 * MI_LLM_BASE_URL 示例：https://api.llm.mioffice.cn/anthropic/v1
 * （SDK 会请求 `${baseURL}/messages`）
 */
export function getMiLlmModel() {
  const config = getMiLlmConfig();
  if (!config) {
    throw new Error('Ask AI is not configured (MI_LLM_* / AI_CHAT_ENABLED)');
  }

  const anthropic = createAnthropic({
    baseURL: config.baseURL,
    // 网关鉴权是 Authorization: Bearer（不是 x-api-key）
    authToken: config.apiKey,
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      headers.set('X-Model-Request-Id', crypto.randomUUID());
      return fetch(input, { ...init, headers });
    },
  });

  return anthropic(config.model);
}
