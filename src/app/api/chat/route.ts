import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
} from 'ai';
import { z } from 'zod';
import { isAiChatConfigured } from '@/lib/ai/config';
import { getMiLlmModel } from '@/lib/ai/provider';
import { SYSTEM_PROMPT } from '@/lib/ai/prompt';
import { searchDocs } from '@/lib/ai/search-docs';
import type { ChatUIMessage } from '@/lib/ai/types';

export const maxDuration = 60;

const MODEL_UNAVAILABLE_MESSAGE = '模型服务暂时不可用，请稍后重试';

const searchTool = tool({
  description:
    'Search HyperOS OS4 design-system docs and return title, url, snippet JSON.',
  inputSchema: z.object({
    query: z.string().describe('Search query in Chinese or English'),
    limit: z.number().int().min(1).max(20).default(8),
  }),
  execute: async ({ query, limit }) => searchDocs(query, limit),
});

export async function POST(req: Request) {
  if (!isAiChatConfigured()) {
    return Response.json(
      { error: 'Ask AI 未配置，请稍后重试' },
      { status: 503 },
    );
  }

  let body: { messages?: ChatUIMessage[] };
  try {
    body = (await req.json()) as { messages?: ChatUIMessage[] };
  } catch {
    return Response.json({ error: '请求体不是有效的 JSON' }, { status: 400 });
  }

  const messages = body.messages ?? [];

  // 简单防护：拒绝过大 payload
  if (messages.length > 40) {
    return Response.json({ error: '消息过多，请精简后重试' }, { status: 413 });
  }

  try {
    const result = streamText({
      model: getMiLlmModel(),
      instructions: SYSTEM_PROMPT,
      stopWhen: stepCountIs(5),
      tools: { search: searchTool },
      toolChoice: 'auto',
      messages: await convertToModelMessages(messages, {
        convertDataPart(part) {
          if (part.type === 'data-client') {
            return {
              type: 'text',
              text: `[Client Context: ${JSON.stringify(part.data)}]`,
            };
          }
        },
      }),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error('[ask-ai/chat]', error);
    return Response.json(
      { error: MODEL_UNAVAILABLE_MESSAGE },
      { status: 503 },
    );
  }
}
