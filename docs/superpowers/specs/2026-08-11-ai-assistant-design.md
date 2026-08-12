# AI 问答助手（Ask AI）设计

日期：2026-08-11  
状态：已实现（分支 `feat/ai-assistant`；上线需 Matrix 注入 `MI_LLM_*`）  
范围：全站浮动 Ask AI；知识源仅 OS4 文档；小米内网 Anthropic Messages 网关

## 目标

在 HyperOS 设计系统文档站接入 **站点侧统一配置** 的大模型能力，让用户基于 **本站 OS4 文档内容** 进行问答，回答必须 **附带可点击的文档来源链接**；优先复用 **Vercel AI SDK + 站内检索 tool**，不自研 RAG / 聊天框架。UI 采用 **AI Elements + shadcn**（初版曾对标 Fumadocs Ask AI 脚手架，后改为 AI Elements）。

## 非目标（首版不做）

- OS5、`/resources`、Landing 等非 OS4 文档入库检索
- 自建向量库 / embedding 重建索引
- 聊天历史落库、点赞点踩、运营看板
- 用户自带 API Key、前端模型切换 UI
- Inkeep / Kapa / Orama Cloud 等外网 SaaS（与仅内网可访问冲突）
- TinaCMS 配置助手文案；Figma / Token 深度 tool（首版仅 `searchDocs`）
- Storybook / 可交互 Web 组件 demo（shadcn 仅用于 Ask AI 站点 chrome）

## 约束与前提

| 项 | 约定 |
|----|------|
| 网络 | 站点仅小米内网可访问；运行时调用内网 LLM 网关 |
| 模型 API | 小米内网 Anthropic Messages（`baseURL` + Bearer + model id；流式；`X-Model-Request-Id`） |
| Key | 站点统一申请与配置，仅服务端环境变量 |
| 知识源 | `content/docs/os4/**`，与现有 Orama 搜索过滤一致 |
| 入口 | 全局浮动助手（右下角），全站可用（**排除 `/admin`**） |
| 引用 | **必须**；无依据则拒答 |

## 方案选型

采用 **Vercel AI SDK + 小米内网 Anthropic 网关 + AI Elements UI**。

- Provider：`@ai-sdk/anthropic`（`authToken` Bearer + 自定义 `baseURL`）→ `https://api.llm.mioffice.cn/anthropic/v1`
- 检索：模型 tool calling 调用站内 `searchDocs`（Orama + 中文 tokenizer），不另建向量库
- UI：`src/components/ai/search.tsx` + `ai-elements/` + `components/ui/`（shadcn）；可拖拽调节面板大小
- 弃用方案：纯自组 assistant-ui；Inkeep 等 SaaS；初版 OpenAI 兼容假设（联调确认为 Anthropic `/v1/messages` 后已切换）；独立 Flexsearch 索引（CJK 效果差，改为 Orama）

## 架构

```text
浏览器（全站浮动 Ask AI）
        │  POST /api/chat（流式）
        ▼
Next.js Route Handler
  ├─ Vercel AI SDK（streamText + tools；instructions）
  ├─ Provider: @ai-sdk/anthropic
  │     → 小米内网 LLM（baseURL + Bearer + X-Model-Request-Id，仅服务端）
  └─ Tool: searchDocs
        → 复用现有 Orama（仅 OS4）
        → 返回 title / url / snippet
        ▼
模型根据检索片段作答 + 强制附文档链接
无命中 → 明确说「文档中未找到」
```

要点：

- UI 不直连模型，只请求 `/api/chat`
- Key 不出浏览器；不使用 `NEXT_PUBLIC_*` 暴露密钥
- 生产 Docker 仍只跑 `npx next build`；Ask AI 为运行时能力，不增加 `tinacms build` 步骤

## 组件边界与目录

| 单元 | 职责 | 位置 |
|------|------|------|
| Ask AI UI | 浮动按钮 + 可调大小对话面板 | `src/components/ai/search.tsx` |
| AI Elements / shadcn | 对话、消息、输入、tool 展示 | `src/components/ai-elements/`、`src/components/ui/` |
| 根挂载 | 全站可用（首页 / docs / resources）；admin 隐藏 | `src/app/layout.tsx` + `AiAssistant.tsx` |
| Chat API | 流式对话、挂 search tool、instructions | `src/app/api/chat/route.ts` |
| 检索工具 | `searchDocs(query)` → OS4 命中列表 | `src/lib/ai/search-docs.ts` |
| Provider | 读 env，创建 Anthropic 客户端（Bearer） | `src/lib/ai/provider.ts` |
| 提示词 | 强制引用、拒答、中文优先 | `src/lib/ai/prompt.ts` |
| Env 模板 | 内网 LLM 配置说明 | `.env.example`（不提交真实 Key） |

与现有全站彩蛋浮层共存：Ask AI 固定右下角，避免与 easter-egg 抢交互。  
工程说明写入 `docs/superpowers/`；**不**写入 `content/docs/`，不改侧栏 `meta.json`。

## 数据流与引用规则

1. 用户在浮动面板输入（可多轮；会话仅浏览器内存，首版不落库）
2. 前端 AI SDK `useChat` → `POST /api/chat`
3. 服务端 `streamText`：`instructions` 约束「只依据检索结果；必须引用；无依据拒答」
4. 模型调用 `searchDocs`，得到 `{ title, url, snippet }[]`
5. 基于片段流式生成 Markdown 回答；附可点击来源 `[标题](url)`

| 情况 | 行为 |
|------|------|
| 有命中且能回答 | 正文 + **至少 1 条**文档链接 |
| 有命中但答不全 | 只答有依据部分，并标明未覆盖点 |
| 无命中 / 检索空 | 「当前 OS4 文档中未找到相关说明」，建议换关键词或用站内搜索 |
| 站外 / 闲聊 | 婉拒，引导回设计规范问题 |

规则同时写入 prompt；实现阶段可对「无 tool 结果却声称有规范」做轻量校验（可选，不阻塞首版上线）。

## 配置、安全与错误处理

### 环境变量（仅服务端）

| 变量 | 用途 |
|------|------|
| `MI_LLM_BASE_URL` | Anthropic 网关前缀，如 `https://api.llm.mioffice.cn/anthropic/v1` |
| `MI_LLM_API_KEY` | 站点统一 Bearer Key |
| `MI_LLM_MODEL` | 模型 ID（如 `ppio/pa/claude-sonnet-4-6`） |
| `AI_CHAT_ENABLED`（可选） | 缺 Key / 预发关闭时隐藏入口 |

由本地 `.env.local` 与 Matrix / 部署侧注入；**不进 git、不进镜像层**。

### 安全

- Key 仅在 `route.ts` / `provider.ts` 使用
- `/api/chat`：请求体大小上限；可选同 IP 简单限流
- 内网站点首版不做登录墙；SSO 审计留后续
- System prompt 常规越权/jailbreak 防护即可

### 错误处理（用户可见）

| 失败 | 表现 |
|------|------|
| 未配置 Key / `AI_CHAT_ENABLED=false` | 不展示浮动入口 |
| 网关超时 / 5xx | 「模型服务暂时不可用，请稍后重试」 |
| 流中断 | 保留已生成内容 + 可重试 |
| 检索异常 | 视为无依据 → 拒答话术，不编造 |

测环境与正式环境各自配置 Key / model。

## 验收标准

- [x] 全站右下角可打开 Ask AI，多轮流式对话可用
- [x] 服务端经小米 Anthropic 网关出答（Key 仅 env）
- [x] 相关规范问题能附上可点的 OS4 文档链接
- [x] 无依据时明确拒答，不编造 Token / 尺寸 / 平台能力
- [x] 本地缺 Key 时入口可关；有 Key 时可联调
- [x] `npm run build` / types 检查路径可用；无外网 SaaS 运行时依赖
- [x] 与彩蛋浮层、`/admin` 共存（admin 隐藏 Ask AI）

## 手工验证用例（实现阶段）

1. 问「Drawer 圆角是多少？」→ 有依据回答 + 链接到抽屉规范页  
2. 问无关闲聊 → 婉拒并引导回规范  
3. 故意问文档不存在的能力 → 拒答  
4. 错误 Key / 断网关 → 友好错误，不白屏  
5. 关闭 `AI_CHAT_ENABLED` → 入口不可用  

## 决策记录

- 核心目标：文档答疑（非纯导航、非深度设计顾问）
- Key：站点统一；小米内部 Anthropic Messages 网关（`api.llm.mioffice.cn`）
- 入口：全局浮动（A）
- 引用：必须（A）
- 知识范围首版：仅 OS4（A）
- 技术路线：Vercel AI SDK + `@ai-sdk/anthropic` + AI Elements / shadcn；检索 Orama `searchDocs`，不自研框架
