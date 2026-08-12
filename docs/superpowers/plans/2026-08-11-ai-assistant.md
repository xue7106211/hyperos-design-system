# AI 问答助手（Ask AI）Implementation Plan

> **As-built（2026-08-11）**：本计划为实施过程记录。落地与计划差异如下，以代码与 [设计规格](../specs/2026-08-11-ai-assistant-design.md) 为准，勿按下文旧步骤重做：
>
> - Provider：`@ai-sdk/anthropic`（非 `@ai-sdk/openai-compatible`）
> - 检索：Orama + 中文 tokenizer（已卸载未使用的 `flexsearch`）
> - UI：AI Elements + shadcn（`src/components/ai-elements/`、`ui/`）；已删除 `src/components/ai/markdown.tsx`
> - Chat API：AI SDK 7 使用 `instructions`（非 system message 塞进 `messages`）
> - 首页不挂「返回顶部」；打开 Ask AI 时入口淡出，面板从右下角进入

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全站浮动 Ask AI：经小米内网 Anthropic 网关流式问答，检索仅限 OS4 文档，回答必须附带来源链接。

**Architecture（计划原文，已过时见上方 As-built）:** 按 Fumadocs Ask AI 官方模式组装：Client `AISearch*` → `POST /api/chat`（Vercel AI SDK `streamText` + `searchDocs` tool）→ `@ai-sdk/openai-compatible` 指向内网 `baseURL`。检索用与 `/api/search` 同源的 OS4 MDX（`getText('processed')`）建 Flexsearch 内存索引（官方 Ask AI 同款，避免耦合 Orama HTTP）；不落库、不接外网 SaaS。

**Tech Stack（计划原文）:** Next.js 16 App Router · Vercel AI SDK (`ai` + `@ai-sdk/react` + `@ai-sdk/openai-compatible`) · Flexsearch · Zod · Node `node:test` · 现有 `source` / `cn` / Tailwind `fd-*`

**Spec:** [docs/superpowers/specs/2026-08-11-ai-assistant-design.md](../specs/2026-08-11-ai-assistant-design.md)

## Global Constraints

- Key 仅服务端：`MI_LLM_BASE_URL` / `MI_LLM_API_KEY` / `MI_LLM_MODEL`；禁止 `NEXT_PUBLIC_*` 暴露密钥
- 可选 `AI_CHAT_ENABLED=false` 强制关闭；未配齐 Key 时不渲染入口
- 知识源：仅 `page.slugs[0] === 'os4'`；与现有搜索过滤一致
- 回答必须引用文档 URL；无命中须拒答（中文话术）
- 入口：根布局全站浮动右下角；**排除 `/admin`**
- 不引入 Inkeep / Orama Cloud / 外网 SaaS；不改 Tina schema / `content/docs/`
- Commit（仅用户要求时）：中文 Conventional Commits；`git -c user.email="xueyifei1@xiaomi.com"`；勿改全局 git config
- 包管理器：npm；新增依赖写入 `package.json` + lockfile

## File Structure

| 文件 | 职责 |
|------|------|
| `src/lib/ai/config.ts` | 读 env、`isAiChatConfigured()`、导出模型配置 |
| `src/lib/ai/provider.ts` | `createOpenAICompatible` 单例 |
| `src/lib/ai/prompt.ts` | System prompt（中文、强制引用、拒答） |
| `src/lib/ai/types.ts` | 前后端共享的 `ChatUIMessage` 类型 |
| `src/lib/ai/search-docs.ts` | OS4 Flexsearch 索引 + `searchDocs(query, limit)` |
| `src/lib/ai/search-docs.test.mjs` | 检索归一化 / OS4 过滤单测 |
| `src/app/api/chat/route.ts` | `POST` 流式 chat + `search` tool |
| `src/components/ai/markdown.tsx` | 对话内 Markdown 渲染（轻量） |
| `src/components/ai/search.tsx` | Ask AI UI（改编自 Fumadocs Ask AI） |
| `src/components/ai/AiAssistant.tsx` | Server 门闩：未配置则不挂载 |
| `src/app/layout.tsx` | 挂载 `AiAssistant` |
| `.env.example` | 补充 LLM 变量说明 |

**依赖（Task 1 安装）：** `ai`、`@ai-sdk/react`、`@ai-sdk/openai-compatible`、`flexsearch`、`zod`（若未在 dependencies 声明则显式加入）、`react-markdown`

**说明：** 不强制跑交互式 `npx @fumadocs/cli add ai/openrouter`（会拉 OpenRouter 依赖）。本计划按官方 [Ask AI / openrouter route](https://www.fumadocs.dev/docs/integrations/llms) 源码结构手写适配版，行为对齐、provider 换成小米网关。

---

### Task 1: 依赖、env 模板与 Provider 配置

**Files:**
- Modify: `package.json` / `package-lock.json`（经 `npm install`）
- Modify: `.env.example`
- Create: `src/lib/ai/config.ts`
- Create: `src/lib/ai/provider.ts`
- Test: 用 Node 断言 `isAiChatConfigured` 行为（同文件旁测或临时脚本；本任务以类型检查 + 逻辑自检为主）

**Interfaces:**
- Consumes: `process.env`
- Produces:
  - `export type MiLlmConfig = { baseURL: string; apiKey: string; model: string }`
  - `export function getMiLlmConfig(): MiLlmConfig | null`
  - `export function isAiChatConfigured(): boolean`
  - `export function getMiLlmModel()` — 返回 AI SDK model 实例（仅服务端调用）

- [ ] **Step 1: 安装依赖**

Run:

```bash
npm install ai @ai-sdk/react @ai-sdk/openai-compatible flexsearch react-markdown zod
npm install -D @types/flexsearch
```

Expected: `package.json` dependencies 出现上述包；`npm ls ai` 无报错。

- [ ] **Step 2: 更新 `.env.example`**

在现有 Tina 说明后追加：

```dotenv
# Ask AI — 小米内网 OpenAI 兼容大模型（仅服务端；勿提交真实 Key）
# MI_LLM_BASE_URL="https://your-internal-gateway.example/v1"
# MI_LLM_API_KEY="..."
# MI_LLM_MODEL="your-model-id"
# 设为 false 时强制关闭助手入口（即使已配置 Key）
# AI_CHAT_ENABLED=true
```

- [ ] **Step 3: 实现 `src/lib/ai/config.ts`**

```ts
export type MiLlmConfig = {
  baseURL: string;
  apiKey: string;
  model: string;
};

export function getMiLlmConfig(): MiLlmConfig | null {
  if (process.env.AI_CHAT_ENABLED === 'false') return null;

  const baseURL = process.env.MI_LLM_BASE_URL?.trim();
  const apiKey = process.env.MI_LLM_API_KEY?.trim();
  const model = process.env.MI_LLM_MODEL?.trim();

  if (!baseURL || !apiKey || !model) return null;
  return { baseURL, apiKey, model };
}

export function isAiChatConfigured(): boolean {
  return getMiLlmConfig() !== null;
}
```

- [ ] **Step 4: 实现 `src/lib/ai/provider.ts`**

```ts
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { getMiLlmConfig } from './config';

export function getMiLlmModel() {
  const config = getMiLlmConfig();
  if (!config) {
    throw new Error('Ask AI is not configured (MI_LLM_* / AI_CHAT_ENABLED)');
  }

  const provider = createOpenAICompatible({
    name: 'mi-llm',
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  });

  return provider.chatModel(config.model);
}
```

- [ ] **Step 5: 类型检查冒烟**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | head -40`  
（若项目惯用 `npm run types:check`，可在后续任务统一跑；本步确认新文件无语法错误即可。）

- [ ] **Step 6: Commit（仅当用户要求提交时）**

```bash
git add package.json package-lock.json .env.example src/lib/ai/config.ts src/lib/ai/provider.ts
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
chore: 接入 Ask AI 依赖与小米 LLM provider 配置

为内网 OpenAI 兼容网关预留 MI_LLM_* 环境变量，并集中 isAiChatConfigured 门闩。
EOF
)"
```

---

### Task 2: `searchDocs`（OS4 Flexsearch）+ 单测

**Files:**
- Create: `src/lib/ai/search-docs.ts`
- Create: `src/lib/ai/search-docs.test.mjs`
- Test: `src/lib/ai/search-docs.test.mjs`

**Interfaces:**
- Consumes: `source` from `@/lib/source`；页面 `data.getText('processed')`
- Produces:
  - `export type SearchDocsHit = { title: string; url: string; snippet: string }`
  - `export function normalizeSearchHits(raw: unknown): SearchDocsHit[]`（纯函数，供测）
  - `export async function searchDocs(query: string, limit?: number): Promise<SearchDocsHit[]>`

- [ ] **Step 1: 写失败测试（先测纯函数归一化）**

创建 `src/lib/ai/search-docs.test.mjs`：

```js
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeSearchHits } from './search-docs.ts';

describe('normalizeSearchHits', () => {
  it('maps enriched flexsearch rows to title/url/snippet', () => {
    const hits = normalizeSearchHits([
      {
        doc: {
          title: '抽屉浮窗',
          url: '/docs/os4/components/containers/drawer',
          description: 'Bottom Sheet',
          content: '圆角使用 miuix_raidus_shape_2xl，对应 36dp。更多说明……',
        },
      },
    ]);
    assert.equal(hits.length, 1);
    assert.equal(hits[0].title, '抽屉浮窗');
    assert.equal(hits[0].url, '/docs/os4/components/containers/drawer');
    assert.ok(hits[0].snippet.includes('36dp'));
    assert.ok(hits[0].snippet.length <= 240);
  });

  it('returns empty array for empty / invalid input', () => {
    assert.deepEqual(normalizeSearchHits(null), []);
    assert.deepEqual(normalizeSearchHits([]), []);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `node --test src/lib/ai/search-docs.test.mjs`  
Expected: FAIL（模块不存在或 `normalizeSearchHits` 未导出）

- [ ] **Step 3: 实现 `src/lib/ai/search-docs.ts`**

```ts
import { Document, type DocumentData } from 'flexsearch';
import { source } from '@/lib/source';

export type SearchDocsHit = {
  title: string;
  url: string;
  snippet: string;
};

interface DocRecord extends DocumentData {
  url: string;
  title: string;
  description: string;
  content: string;
}

const SNIPPET_MAX = 200;

export function normalizeSearchHits(raw: unknown): SearchDocsHit[] {
  if (!Array.isArray(raw)) return [];

  const out: SearchDocsHit[] = [];
  for (const row of raw) {
    const doc =
      row && typeof row === 'object' && 'doc' in row
        ? (row as { doc?: DocRecord }).doc
        : (row as DocRecord | undefined);
    if (!doc?.url || !doc.title) continue;
    const base = doc.description?.trim() || doc.content?.trim() || '';
    const snippet =
      base.length > SNIPPET_MAX ? `${base.slice(0, SNIPPET_MAX)}…` : base;
    out.push({ title: doc.title, url: doc.url, snippet });
  }
  return out;
}

let indexPromise: Promise<Document<DocRecord>> | null = null;

async function getIndex(): Promise<Document<DocRecord>> {
  if (!indexPromise) {
    indexPromise = buildIndex();
  }
  return indexPromise;
}

async function buildIndex(): Promise<Document<DocRecord>> {
  const search = new Document<DocRecord>({
    document: {
      id: 'url',
      index: ['title', 'description', 'content'],
      store: true,
    },
  });

  const pages = source
    .getPages()
    .filter((page) => page.slugs[0] === 'os4');

  const SIZE = 50;
  for (let i = 0; i < pages.length; i += SIZE) {
    const chunk = pages.slice(i, i + SIZE);
    const docs = await Promise.all(
      chunk.map(async (page) => {
        if (!('getText' in page.data)) return null;
        const content = await page.data.getText('processed');
        return {
          title: page.data.title,
          description: page.data.description ?? '',
          url: page.url,
          content,
        } satisfies DocRecord;
      }),
    );
    for (const doc of docs) {
      if (doc) search.add(doc);
    }
  }

  return search;
}

export async function searchDocs(
  query: string,
  limit = 8,
): Promise<SearchDocsHit[]> {
  const q = query.trim();
  if (!q) return [];

  const search = await getIndex();
  const raw = await search.searchAsync(q, {
    limit,
    merge: true,
    enrich: true,
  });
  return normalizeSearchHits(raw).slice(0, limit);
}
```

> 若 `searchAsync` / `enrich` 返回结构与假设略有差异，以本机 `node --test` + 一次 `searchDocs('抽屉')` 调试为准，**只改 `normalizeSearchHits`**，保持对外 `SearchDocsHit` 不变。

- [ ] **Step 4: 跑测试确认通过**

Run: `node --test src/lib/ai/search-docs.test.mjs`  
Expected: PASS

- [ ] **Step 5: Commit（仅当用户要求提交时）**

```bash
git add src/lib/ai/search-docs.ts src/lib/ai/search-docs.test.mjs
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
feat: 实现 Ask AI 的 OS4 文档检索 searchDocs

用 Flexsearch 索引 OS4 处理后的 MDX，归一化为可引用的 title/url/snippet。
EOF
)"
```

---

### Task 3: System prompt + `/api/chat` 路由

**Files:**
- Create: `src/lib/ai/types.ts`
- Create: `src/lib/ai/prompt.ts`
- Create: `src/app/api/chat/route.ts`

**Interfaces:**
- Consumes: `getMiLlmModel`、`isAiChatConfigured`、`searchDocs`、`SYSTEM_PROMPT`
- Produces:
  - `export type ChatUIMessage`（`src/lib/ai/types.ts`）
  - `POST /api/chat` 流式 UI message response；未配置时 `503`

- [ ] **Step 1: 实现共享类型 `src/lib/ai/types.ts`**

```ts
import type { UIMessage } from 'ai';

export type ChatUIMessage = UIMessage<
  never,
  {
    client: {
      location: string;
    };
  }
>;
```

- [ ] **Step 2: 实现 `src/lib/ai/prompt.ts`**

```ts
export const SYSTEM_PROMPT = [
  '你是 HyperOS 设计系统文档站的问答助手。',
  '只根据 search 工具返回的 OS4 文档片段回答设计规范问题。',
  '回答使用简体中文。',
  '每条有依据的回答必须包含至少一条 Markdown 链接，格式：[标题](url)，url 必须来自检索结果。',
  '若检索无结果或片段不足以支持结论，明确说：「当前 OS4 文档中未找到相关说明」，并建议换关键词或使用站内搜索；禁止编造 Token 名、尺寸、平台能力。',
  '对与设计规范无关的闲聊或站外问题，简短婉拒并引导用户提出规范相关问题。',
  '在需要时先调用 search 工具再回答。',
].join('\n');
```

- [ ] **Step 3: 实现 `src/app/api/chat/route.ts`**

对齐 Fumadocs Ask AI（AI SDK UI message + tool），provider 换成本仓 `getMiLlmModel`：

```ts
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
      { error: 'Ask AI is not configured' },
      { status: 503 },
    );
  }

  const body = (await req.json()) as { messages?: ChatUIMessage[] };
  const messages = body.messages ?? [];

  // 简单防护：拒绝过大 payload
  if (messages.length > 40) {
    return Response.json({ error: 'Too many messages' }, { status: 413 });
  }

  const result = streamText({
    model: getMiLlmModel(),
    stopWhen: stepCountIs(5),
    tools: { search: searchTool },
    toolChoice: 'auto',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(await convertToModelMessages(messages, {
        convertDataPart(part) {
          if (part.type === 'data-client') {
            return {
              type: 'text',
              text: `[Client Context: ${JSON.stringify(part.data)}]`,
            };
          }
        },
      })),
    ],
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
```

> 若当前 `ai` 大版本中 `toUIMessageStream` / `createUIMessageStreamResponse` 签名有微调，以安装版 TypeScript 报错为准，对照 [AI SDK streaming docs](https://ai-sdk.dev) 做最小修正，保持 tool 名仍为 `search`（与 UI 解析一致）。

- [ ] **Step 4: 无 Key 时冒烟**

Run（无需真实 Key；先 `npm run dev`）：

```bash
curl -s -o /tmp/chat-res.txt -w "%{http_code}" -X POST http://localhost:3000/api/chat \
  -H 'content-type: application/json' \
  -d '{"messages":[]}'
```

Expected: 未配置 `MI_LLM_*` 时 HTTP 状态码 `503`。

- [ ] **Step 5: Commit（仅当用户要求提交时）**

```bash
git add src/lib/ai/types.ts src/lib/ai/prompt.ts src/app/api/chat/route.ts
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
feat: 新增 Ask AI 的 /api/chat 流式接口

接入小米兼容网关与 searchDocs tool，并用 system prompt 强制引用与拒答。
EOF
)"
```

---

### Task 4: Ask AI 浮动 UI 组件

**Files:**
- Create: `src/components/ai/markdown.tsx`
- Create: `src/components/ai/search.tsx`
- Create: `src/components/ai/AiAssistant.tsx`

**Interfaces:**
- Consumes: `@ai-sdk/react` `useChat`、`DefaultChatTransport`、`/api/chat`、`cn`、`ChatUIMessage` from `@/lib/ai/types`
- Produces:
  - `export function AISearch` / `AISearchPanel` / `AISearchTrigger`
  - `export function AiAssistant()`（Server Component）

- [ ] **Step 1: 实现轻量 Markdown**

创建 `src/components/ai/markdown.tsx`：

```tsx
import ReactMarkdown from 'react-markdown';

export function Markdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={{
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-fd-primary underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            {children}
          </a>
        ),
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="mb-2 list-disc space-y-1 pl-4">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 list-decimal space-y-1 pl-4">{children}</ol>
        ),
        code: ({ children }) => (
          <code className="rounded bg-fd-muted px-1 py-0.5 text-[0.85em]">
            {children}
          </code>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
```

- [ ] **Step 2: 拉取官方 Ask AI 客户端为蓝本并落地本仓适配**

1. 打开 Fumadocs 仓库 `apps/docs/components/ai-sdk/search.tsx`（与 [Ask AI 文档](https://www.fumadocs.dev/docs/integrations/llms) 同源）作为结构蓝本。
2. 写入 `src/components/ai/search.tsx`，并做下列**必须**改动（逐项勾掉）：
   - import `ChatUIMessage` from `@/lib/ai/types`（不要在组件文件重复定义类型）
   - `Markdown` 改为 `./markdown`
   - `cn` 改为 `@/lib/cn`
   - 删除对本仓不存在的 `buttonVariants` 的依赖，改为 Tailwind + `fd-*` class
   - `AISearchTrigger` `position="float"`：`fixed bottom-4 right-4 z-40 …`
   - `/admin` 与 `/admin/*` 下 `AISearchTrigger` 与 `AISearchPanel` 均 `return null`
   - 角色名：`assistant` → 显示「HyperOS」
   - 文案中文：标题「Ask AI」；副文「回答可能不准确，请以文档为准。」；输入占位「询问 OS4 设计规范…」；触发按钮「Ask AI」
   - tool 名保持 `search`；展示「检索中…」/「N 条检索结果」
   - `useChat` transport：`api: '/api/chat'`
   - 发送消息仍附带 `data-client: { location: location.href }`
3. 自测：打开面板 → 输入框可输入 → Esc 关闭 → `Cmd/Ctrl+/` 打开。

- [ ] **Step 3: Server 门闩 `AiAssistant.tsx`**

```tsx
import { MessageCircleIcon } from 'lucide-react';
import { isAiChatConfigured } from '@/lib/ai/config';
import { AISearch, AISearchPanel, AISearchTrigger } from './search';

export function AiAssistant() {
  if (!isAiChatConfigured()) return null;

  return (
    <AISearch>
      <AISearchPanel />
      <AISearchTrigger position="float">
        <MessageCircleIcon className="size-4.5" aria-hidden />
        Ask AI
      </AISearchTrigger>
    </AISearch>
  );
}
```

- [ ] **Step 4: 本地无 Key 时确认入口不出现**

Run: `npm run dev`，打开首页——不应出现 Ask AI 按钮。

- [ ] **Step 5: Commit（仅当用户要求提交时）**

```bash
git add src/components/ai/
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
feat: 新增全站浮动 Ask AI 对话面板

按 Fumadocs Ask AI 模式实现客户端 UI，未配置 LLM 时不挂载入口。
EOF
)"
```

---

### Task 5: 根布局挂载 + 联调验收

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `docs/roadmap.md`（「下一步」增加 Ask AI 一条，标进行中/完成时再勾）
- Optional: `docs/deployment.md` 增加一小节「Ask AI 环境变量」（3–5 行指针即可）

**Interfaces:**
- Consumes: `AiAssistant`
- Produces: 全站可用入口（admin / 未配置除外）

- [ ] **Step 1: 修改 `src/app/layout.tsx`**

在 `EasterEggProvider` 内（或并列）挂载：

```tsx
import { AiAssistant } from '@/components/ai/AiAssistant';
// ...
<RootProvider>
  <EasterEggProvider>
    {children}
    <AiAssistant />
  </EasterEggProvider>
</RootProvider>
```

- [ ] **Step 2: 配置本地 `.env.local`（不提交）**

```dotenv
MI_LLM_BASE_URL="https://<小米内网网关>/v1"
MI_LLM_API_KEY="<申请到的 Key>"
MI_LLM_MODEL="<模型 id>"
AI_CHAT_ENABLED=true
```

- [ ] **Step 3: 手工验收（对照 spec）**

| # | 操作 | 期望 |
|---|------|------|
| 1 | 首页 / docs / resources 右下角 | 可见 Ask AI |
| 2 | `/admin` | 无入口 |
| 3 | 问「Drawer 圆角」 | 流式回答 + 至少一条 `/docs/os4/...` 链接 |
| 4 | 问无关闲聊 | 婉拒并引导 |
| 5 | 问不存在能力 | 「未找到相关说明」类拒答 |
| 6 | 临时改错 Key | 友好错误，不白屏 |
| 7 | `AI_CHAT_ENABLED=false` 重启 | 入口消失 |

- [ ] **Step 4: 构建与类型检查**

Run:

```bash
npm run types:check
npm run build
```

Expected: 退出码 0。

- [ ] **Step 5: 更新工程文档指针**

在 `docs/roadmap.md`「下一步」增加：

```md
- [ ] Ask AI 文档问答助手（Fumadocs Ask AI + 小米内网 OpenAI 兼容网关；spec 见 `docs/superpowers/specs/2026-08-11-ai-assistant-design.md`）
```

在 `docs/deployment.md` 适当位置追加短节：部署需注入 `MI_LLM_BASE_URL` / `MI_LLM_API_KEY` / `MI_LLM_MODEL`；可选 `AI_CHAT_ENABLED`；Key 勿写入镜像。

- [ ] **Step 6: Commit（仅当用户要求提交时）**

```bash
git add src/app/layout.tsx docs/roadmap.md docs/deployment.md
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
feat: 全站挂载 Ask AI 并补充部署环境变量说明

根布局接入助手入口，并在 roadmap / deployment 记录内网 LLM 配置要求。
EOF
)"
```

---

## Spec Coverage Checklist（写计划时自检）

| Spec 要求 | 对应 Task |
|-----------|-----------|
| 站点统一 Key + OpenAI 兼容 | Task 1 |
| 仅 OS4 检索 | Task 2 |
| 强制引用 / 拒答 | Task 3 prompt + Task 5 手工验收 |
| 全局浮动入口 | Task 4–5 |
| 排除外网 SaaS | 全局约束；依赖列表无 Inkeep |
| 未配置隐藏入口 | Task 4 `AiAssistant` + Task 1 config |
| `/admin` 排除 | Task 4 `AISearchTrigger` / Panel |
| `npm run build` | Task 5 |
| 不改 Tina / content/docs | 全局约束 |

## 执行说明

- 实现前确认本机可访问小米 LLM 网关（或先完成 Task 1–4 UI，Task 5 再用真实 Key）
- AI SDK 小版本 API 若漂移，以 TypeScript 与官方迁移说明做最小修补，勿改产品规则
- 用户未要求时不要 commit / push；1Password 签名失败时停下来询问，勿擅自 `--no-gpg-sign`
