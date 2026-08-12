export type MiLlmConfig = {
  baseURL: string;
  apiKey: string;
  model: string;
};

/** 规范化网关前缀：去掉尾斜杠与误粘贴的 /messages */
export function normalizeMiLlmBaseURL(raw: string): string {
  let baseURL = raw.trim().replace(/\/+$/, '');
  if (baseURL.endsWith('/messages')) {
    baseURL = baseURL.slice(0, -'/messages'.length).replace(/\/+$/, '');
  }
  return baseURL;
}

export function getMiLlmConfig(): MiLlmConfig | null {
  if (process.env.AI_CHAT_ENABLED === 'false') return null;

  const rawBaseURL = process.env.MI_LLM_BASE_URL?.trim();
  const apiKey = process.env.MI_LLM_API_KEY?.trim();
  const model = process.env.MI_LLM_MODEL?.trim();

  if (!rawBaseURL || !apiKey || !model) return null;
  return {
    baseURL: normalizeMiLlmBaseURL(rawBaseURL),
    apiKey,
    model,
  };
}

export function isAiChatConfigured(): boolean {
  return getMiLlmConfig() !== null;
}
