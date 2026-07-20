# HyperOS Design System 文档站 — V1 技术设计方案

> **版本**：V1.0  
> **日期**：2026-07-08  
> **状态**：Phase 0–1 已实施；Phase 2 TinaCMS 本地模式已接入（2026-07-08）；生产鉴权与 Token CI 规划中

---

## 1. 背景与目标

HyperOS 设计系统面向 **移动端客户端组件库**（Android / iOS 等），需要建设一套 **设计系统文档网站**，用于：

- 传播设计原则、组件规范、页面模式（Patterns）
- 连接 Figma 设计源与工程实现
- 展示 Design Tokens 与平台代码参考
- 支持设计/文档同学 **低门槛维护内容**（TinaCMS `/admin` 本地模式已接入；生产鉴权与 Git 同步待补）

### 1.1 V1 范围

| 在范围内（已实施） | 不在范围内 / 后续 Phase |
|----------|----------------------|
| 静态文档站（Guidelines + 组件规范页） | 网站内 **可交互 Web 组件** demo |
| Figma 设计稿 / 原型 iframe 嵌入 | Storybook / 在线 Playground |
| Token 目录页（从 `tokens/*.{light,dark}.json` 渲染；Light / Dark 切换） | Tokens Studio → Git 自动同步（Phase 3） |
| Android / iOS **静态**代码片段展示 | 完整 npm 组件包发布流水线 |
| 图标库预览（`IconGallery` + `icons/` 资产） | 可交互 icon picker / Storybook |
| MDX + `meta.json` 内容维护 | TinaCMS 生产鉴权 / TinaCloud 部署（Phase 2 剩余项） |
| 示例 Token JSON + `TokenTable` 组件 | 客户端组件 CI/CD（另仓维护） |
| OS4 Token 真源（Reference / Semantic / Component × Light / Dark） | Typography Token（待导出） |
| — | Figma Code Connect 试点（Phase 3） |
| — | 采用率统计、复杂权限系统 |

### 1.2 核心约束（决策前提）

1. **客户端组件库**：组件运行在移动端，文档站 **不承载** 可运行的 UI 组件。
2. **移动端内容**：文档以移动 UI 规范为主；交互演示优先用 **Figma 原型 embed**，而非 Web demo。
3. **CMS 优先（Phase 2）**：内容上传与日常维护必须对非工程同学友好；本地 `/admin` 已可用，生产鉴权待补。
4. **Figma 强连接**：Token 展示、设计稿 iframe、与 Dev Mode 的代码桥接均为一等公民。

---

## 2. 竞品与参考方向

V1 不对标「Web 组件库文档站」（如 shadcn、Radix），而偏向 **工程化、内容型、Figma 驱动** 的设计系统文档体验。

### 2.1 文档体验参考

| 参考 | 链接 | 借鉴点 |
|------|------|--------|
| Geist (Vercel) | https://vercel.com/geist | 极简 UI、Typography / Token 层级 |
| Paste (Twilio) | https://paste.twilio.design | Token 与 Component 文档双轨 |
| Primer (GitHub) | https://primer.style | Foundation → Components → Patterns IA |
| shadcn/ui | https://ui.shadcn.com | MDX 信息密度、工程文档气质（非 Web demo 模式） |

### 2.2 开源工具链参考

| 类别 | 参考 | 说明 |
|------|------|------|
| 文档框架 | Fumadocs | **V1 选定** |
| Token 管线 | Tokens Studio + Style Dictionary / Terrazzo | Figma → JSON → 多平台 |
| Figma 桥接 | figma/code-connect | Dev Mode ↔ Compose / SwiftUI |
| CMS 模式 | Docusaurus + TinaCMS 实践 | 设计师 Git-less 编辑 + Figma embed |

### 2.3 明确不采用

| 方案 | 原因 |
|------|------|
| Storybook 作为主文档站 | 面向 Web 组件隔离开发，与「无在线组件 demo」约束冲突 |
| Zeroheight / Supernova 等 SaaS | 可参考 IA，V1 走自建开源栈以控成本与定制 |
| Backlight / Specify | 产品已关停，不宜作为依赖 |

---

## 3. 技术选型

### 3.1 总览

```text
┌─────────────────────────────────────────────────────────┐
│  CMS 层                                                  │
│  TinaCMS（首选）或 Keystatic（备选）                      │
│  设计师编辑 → MDX/Markdown → Git PR → 构建部署            │
└──────────────────────────┬──────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  文档站 — Fumadocs + Next.js App Router                  │
│  fumadocs-mdx / fumadocs-core / fumadocs-ui              │
│  自定义 MDX：FigmaEmbed · TokenTable · IconGallery · PlatformTabs │
└──────────────────────────┬──────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  设计源 & 工程桥接                                        │
│  Figma Embed API · Tokens Studio · Code Connect          │
│  tokens/*.json (W3C DTCG) → Style Dictionary / Terrazzo  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 文档框架：Fumadocs

**选定理由：**

- **Next.js 栈**：与团队 React/前端生态一致，便于后续扩展。
- **Headless 分层**：`core`（数据/搜索/i18n）+ `ui`（布局）+ `mdx`（内容），可只定制需要的层。
- **MDX 组件扩展**：通过 `getMDXComponents()` 注册 `FigmaEmbed`、`TokenTable`、`IconGallery` 等，契合 DS 文档模式。
- **现代 UI**：Radix + Tailwind，默认可定制 `--color-fd-*` CSS 变量映射 HyperOS 品牌。
- **非 Storybook 路线**：纯内容站，不引入组件 playground 负担。

**初始化（本仓库已采用 npm）：**

```bash
CI=true npm create fumadocs-app@latest hyperos-design-system -- \
  --template "+next+fuma-docs-mdx" --pm npm --src --no-git --search orama
npm install
```

> 非交互环境需设置 `CI=true`；本地交互式创建可使用 `npm create fumadocs-app@latest`。

**官方资源：**

- 站点：https://www.fumadocs.dev
- 仓库：https://github.com/fuma-nama/fumadocs

### 3.3 CMS 选型

| 方案 | 角色 | 阶段 |
|------|------|------|
| **TinaCMS** | 可视化编辑 MDX，支持自定义 block（FigmaEmbed 等） | **Phase 2 首选** — 本地 `/admin` 已接入；TinaCloud / 自托管鉴权待补 |
| **Keystatic** | Git-based，TypeScript schema，完全 OSS | **备选** — 工程主导、零 SaaS |
| Notion → MD 同步 | API 拉取转 Markdown | 仅作过渡方案，不推荐 V1 主路径 |

**TinaCMS 工作流：**

```text
设计师访问 /admin
  → 编辑组件页（富文本 + Figma 字段 + 平台代码块）
  → 保存写入 content/docs/{os4|os5}/*.mdx
  → 自动/手动 Git commit → PR Review
  → CI 构建 Fumadocs → 部署
```

### 3.4 Token 工具链

采用 **W3C DTCG** 作为 canonical 格式，保证工具可替换性。

```text
Figma（Tokens Studio 插件）
  → tokens/*.json（W3C DTCG）
  → GitHub PR（CI 自动）
  → Style Dictionary v4 / Terrazzo
  → CSS variables · TS constants · 移动端产物（按需）
  → 文档站 TokenTable 组件读取 JSON 渲染
```

| 工具 | 用途 |
|------|------|
| [Tokens Studio](https://tokens.studio) | Figma 侧编辑，GitHub 双向同步 |
| [Style Dictionary v4](https://github.com/style-dictionary/style-dictionary) | JSON → 多平台代码 |
| [Terrazzo](https://terrazzo.app) | DTCG 原生 toolchain（可选替代 SD） |
| [@tokens-studio/sd-transforms](https://www.npmjs.com/package/@tokens-studio/sd-transforms) | Tokens Studio ↔ Style Dictionary 桥接 |
| [Swatchbook](https://github.com/unpunnyfuns/swatchbook) | Token 可视化 blocks（可选，V1 可自研轻量 TokenTable） |

### 3.5 Figma 集成

分三层，职责不重叠：

| 层级 | 机制 | 面向谁 | V1 |
|------|------|--------|-----|
| **文档展示** | Figma Embed API（iframe） | 全员读文档 | ✅ 必做 |
| **Token 同步** | Tokens Studio → Git → 构建 | 设计 + 工程 | ⚪ Phase 3（当前为手工 `tokens:import` 维护分层 JSON） |
| **Dev Mode 代码** | [figma/code-connect](https://github.com/figma/code-connect) | 工程师在 Figma 内 | ⚪ 试点 1–2 个组件 |

**Embed URL 规范：**

```text
https://embed.figma.com/design/{file_key}?embed-host=hyperos-ds&node-id={node_id}&theme=system
https://embed.figma.com/design/{file_key}?embed-host=hyperos-ds&node-id={node_id}&mode=dev&theme=system
```

- `embed-host=hyperos-ds`：必填，标识宿主应用
- `node-id`：定位到组件 Frame
- `mode=dev`：Dev Mode 标注（`FigmaEmbed` 的 `mode="dev"`）
- 原型演示：`embed.figma.com/proto/...`（`FigmaPrototypeEmbed`）

参考：[Figma Embed 官方文档](https://developers.figma.com/docs/embeds/embed-figma-file/)

### 3.6 搜索、国际化、部署

| 能力 | V1 方案 |
|------|---------|
| 搜索 | Orama（`src/app/api/search/route.ts`）；当前 `language: 'english'`，中文 CJK encoder 待配置 |
| i18n | Fumadocs i18n（`zh` / `en`），见 `fumadocs-core/i18n` |
| 部署 | MiFlow + Matrix + Docker（`Dockerfile`）；分支/环境与卡点见 [deployment.md](./deployment.md)；生产只跑 `npx next build`（不跑 `tinacms build`） |
| 主题 | Fumadocs 默认 `neutral.css`；`global.css` 定制紧凑排版与 sidebar 布局；Dark mode via `next-themes` |

---

## 4. 系统架构

### 4.1 逻辑架构

```text
                    ┌──────────────┐
                    │   编辑者      │
                    │ 设计 / 文档   │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      ┌──────────────┐          ┌──────────────┐
      │   TinaCMS    │          │ Figma +      │
      │   /admin     │          │ Tokens Studio│
      └──────┬───────┘          └──────┬───────┘
             │                         │
             ▼                         ▼
      ┌──────────────────────────────────────┐
      │           Git Repository              │
      │  content/docs/  ·  tokens/  ·  src/  │
      └──────────────────┬───────────────────┘
                         │
                         ▼
      ┌──────────────────────────────────────┐
      │     CI (MiFlow) + Matrix + Docker       │
      │  本地：tinacms build + next build        │
      │  生产镜像：仅 next build（见 Dockerfile） │
      │  发布流程见 docs/deployment.md           │
      └──────────────────┬───────────────────┘
                         │
                         ▼
      ┌──────────────────────────────────────┐
      │      Fumadocs 文档站 (Next.js)          │
      │  静态页面 + MDX + 搜索 + i18n           │
      └──────────────────┬───────────────────┘
                         │
                         ▼
                    ┌─────────┐
                    │  访问者  │
                    └─────────┘
```

### 4.2 仓库结构（当前）

```text
hyperos-design-system/
├── content/docs/           # MDX 文档（网站内容源）
│   ├── meta.json           # 根级 os4 / os5 版本 Tab
│   ├── os4/                # HyperOS 4（当前默认）
│   │   ├── icons.mdx       # 图标预览（一级入口）
│   │   ├── general/        # 通用设计标准
│   │   ├── components/     # 控件与组件
│   │   ├── interaction/    # 人机交互标准
│   │   ├── system/         # 系统特性与能力标准
│   │   ├── multi-device/    # 多端设备标准
│   │   └── best-practices/ # 应用最佳实践标准
│   └── os5/                # HyperOS 5（占位；结构同 os4）
├── tokens/                 # Design Tokens（层 × light/dark）
│   ├── reference.{light,dark}.json
│   ├── semantic.{light,dark}.json
│   └── component.{light,dark}.json
├── icons/                  # 图标源 SVG + manifest（IconGallery）
│   ├── svg/{category}/
│   ├── manifest.json
│   └── README.md
├── scripts/                # 仓库脚本（generate-icon-manifest.mjs 等）
├── tina/                   # TinaCMS schema（按 os4/os5 × 分组 collections）
├── .env.example            # TinaCMS 本地模式环境变量模板
├── public/
│   ├── logo/               # HyperOS Logo（light / dark）
│   ├── home/               # Landing 页静态图
│   ├── icons/              # 图标静态访问（icons:sync 产物）
│   └── uploads/            # TinaCMS 媒体上传（本地模式）
├── src/
│   ├── app/                # Next.js App Router（docs、admin、api/tina、search、llms、og）
│   ├── components/
│   │   ├── docs/           # DocsVersionSwitcher、FigmaJumpButton、DocMeta
│   │   ├── home/           # Landing：HomeHero、PillNav、HalftoneBloom
│   │   ├── mdx/            # FigmaEmbed、TokenTable、IconGallery、PlatformTabs、PlatformCodeBlock 等
│   │   ├── tina/           # Tina Visual Editing
│   │   └── HyperOSLogo.tsx
│   └── lib/                # source、layout、shared、icons、docs-version-tabs、tina-docs、git-file-mtime、cn
├── source.config.ts        # frontmatter Zod schema
├── next.config.mjs         # Next.js + fumadocs-mdx；/docs 重定向与旧路径兼容
├── proxy.ts                # Markdown 内容协商
├── .npmrc                  # legacy-peer-deps
├── docs/                   # 工程设计文档（本目录；deployment / technical-design / sidebar-ia 等）
├── AGENTS.md               # Agent 工作指引（精简；部署细节见 deployment.md）
├── CLAUDE.md               # 指向 AGENTS.md
├── Dockerfile              # 生产镜像（builder 保留 .git 以解析文档更新时间）
├── README.md
└── package.json            # npm scripts；锁文件 package-lock.json
```

**规划中（Phase 3，尚未创建）：**

- Token 构建脚本（Style Dictionary / Terrazzo）— 可扩展现有 `scripts/`，勿与当前 `icons:sync` 混淆

> **说明**：客户端组件 **源码** 建议在独立仓库维护；本仓聚焦 **文档站 + Token + 图标资产 + Figma 连接**。Code Connect 映射文件可放本仓或组件仓，V1 试点时按团队习惯定。

### 4.3 Fumadocs 分层映射

| 包 | 职责 | HyperOS 定制点 |
|----|------|----------------|
| `fumadocs-mdx` | MDX 编译、frontmatter、Collections | 扩展组件页 schema（figmaNodeId、platforms 等） |
| `fumadocs-core` | Source API、搜索、i18n | 中文搜索 encoder、structured data |
| `fumadocs-ui` | DocsPage、Sidebar、TOC | 默认 neutral 主题、紧凑排版与 sidebar 布局（`global.css`） |

---

## 5. 内容模型

### 5.1 Frontmatter Schema（组件页）

在 `source.config.ts` 中扩展：

```typescript
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      status: z.enum(['stable', 'beta', 'deprecated']).optional(),
      platforms: z.array(z.enum(['android', 'ios', 'pad'])).optional(),
      figmaFileKey: z.string().optional(),
      figmaNodeId: z.string().optional(),
      figmaPrototypeUrl: z.string().url().optional(),
      tokenGroups: z.array(z.string()).optional(),
      maintainer: z.string().optional(),
      maintainerOpenId: z.string().optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: { schema: metaSchema },
});

export default defineConfig({ mdxOptions: {} });
```

### 5.2 页面类型

| 类型 | 路径示例 | 核心内容 |
|------|----------|----------|
| 通用设计 | `/docs/os4/general/design-token` | 原则说明 + TokenTable |
| 图标 | `/docs/os4/icons` | IconGallery（分类 / 复制名称与 SVG） |
| 组件 | `/docs/os4/components/actions/button` | FigmaEmbed + Token + PlatformTabs + Do/Don't |
| 系统特性 | `/docs/os4/system` | 系统能力总览与专题页 |
| 最佳实践 | `/docs/os4/best-practices` | 应用层实践入口（原 Resources 收口） |

> 旧路径 `/docs/foundations/...`、`/docs/os4/foundations/...` 等永久 301 到新 IA；`/docs` 默认进入 OS4。

### 5.3 组件文档页模板

每页固定区块（由 MDX 组件拼装）：

```text
1. 标题 + status badge + 支持平台
2. 简介（MDX 正文；亦可通过 `/admin` 编辑）
3. FigmaEmbed（设计稿 Frame，node-id 精确定位）
4. FigmaPrototypeEmbed（可选 — 移动端交互演示）
5. Anatomy（Figma node 或导出静态图）
6. TokenTable（关联 tokenGroups，自动从 JSON 渲染）
7. PlatformTabs
     [Android] Jetpack Compose 静态代码
     [iOS]     SwiftUI 静态代码
8. Usage / Do's & Don'ts（MDX + `<DosDonts />`）
9. Accessibility / Motion（MDX 正文）
```

---

## 6. 自定义 MDX 组件（Phase 0–1 已实现）

### 6.1 组件清单

| 组件 | 职责 | 优先级 |
|------|------|--------|
| `FigmaEmbed` | 设计稿 iframe（fileKey + nodeId + theme；可选 `mode="dev"`） | P0 |
| `FigmaPrototypeEmbed` | 原型 iframe，替代 Web 交互 demo | P0 |
| `PlatformTabs` / `PlatformTab` | Android / iOS 代码 Tab 切换 | P0 |
| `PlatformCodeBlock` | Tina CMS 友好的平台代码 block（扁平 android/ios 字段） | P0 ✅ |
| `TokenTable` | 从 `tokens/*.{light,dark}.json` 按 group 渲染；支持 Light / Dark | P0 ✅ |
| `IconGallery` | 图标库预览（`icons/manifest.json`；分类 / 搜索 / 深浅色 / 复制名称与 SVG） | P1 ✅ |
| `DeviceFrame` | 移动端设备框包裹静态截图 | P1（未实现） |
| `StatusBadge` | stable / beta / deprecated | P1 ✅ |
| `DosDonts` | Do/Don't 双栏布局 | P1 ✅ |
| `DocsVersionSwitcher` | 侧边栏 OS 版本切换（`src/components/docs/`；站点 chrome，非 MDX block） | P1 ✅ |
| `FigmaJumpButton` | 文档页操作栏「跳转 Figma」（页级 frontmatter 或 `defaultFigmaUrl`） | P1 ✅ |
| `DocMeta` | 文档页元信息：更新时间（git）/ 维护人（frontmatter；可选飞书 AppLink） | P1 ✅ |

### 6.2 MDX 注册方式

```typescript
// src/components/mdx/index.tsx
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { FigmaEmbed } from './FigmaEmbed';
import { FigmaPrototypeEmbed } from './FigmaPrototypeEmbed';
import { IconGallery } from './IconGalleryServer';
import { TokenTable } from './TokenTable';
import { PlatformCodeBlock } from './PlatformCodeBlock';
import { PlatformTabs, PlatformTab } from './PlatformTabs';
import { StatusBadge } from './StatusBadge';
import { DosDonts } from './DosDonts';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    FigmaEmbed,
    FigmaPrototypeEmbed,
    IconGallery,
    PlatformTabs,
    PlatformTab,
    PlatformCodeBlock,
    TokenTable,
    StatusBadge,
    DosDonts,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;
```

### 6.3 FigmaEmbed 接口约定

```typescript
type FigmaEmbedProps = {
  fileKey?: string;
  nodeId?: string;
  type?: 'design' | 'proto';
  mode?: 'design' | 'dev';
  height?: number;
  theme?: 'light' | 'dark' | 'system';
};
```

- Embed host 固定为 `hyperos-ds`
- `mode="dev"` 时追加 `mode=dev` 查询参数，用于 Dev Mode 标注
- 默认 `loading="lazy"`
- 外层容器：圆角 + border，与 Fumadocs 卡片风格一致

---

## 7. 主题与品牌

V1 采用 Fumadocs 默认 **neutral** 主题（`fumadocs-ui/css/neutral.css`），不在 `global.css` 中覆盖 HyperOS 品牌色 `--color-fd-*`。

`src/app/global.css` 当前定制：

- 紧凑文档排版（正文 15px、标题层级、TOC 13px）
- Docs 布局 grid：sidebar 贴视窗左缘，主内容 + TOC 保持居中

Logo：`src/components/HyperOSLogo.tsx` + `public/logo/`（light / dark 自动切换）。

Design Token（业务 token）与 Fumadocs UI token（文档站 chrome）**分离**：业务 token 来自 `tokens/*.{light,dark}.json`，不混用 `--color-fd-*`。

---

## 8. 与客户端组件库的关系

```text
┌─────────────────────┐     ┌─────────────────────┐
│  客户端组件库仓库     │     │  本文档站仓库         │
│  Compose / SwiftUI  │     │  Fumadocs + CMS      │
│  单元测试 · 发包      │     │  规范 · Figma · Token │
└──────────┬──────────┘     └──────────┬──────────┘
           │                           │
           └─────────┬─────────────────┘
                     ▼
              figma/code-connect
              tokens/*.json (共享或同步)
```

- 文档站 **展示** 代码片段；片段来源可以是 CMS 手填，或 CI 从组件仓提取（V2 考虑自动化）。
- **不在文档站运行** 客户端组件；交互一律通过 Figma 原型或静态截图。

---

## 9. 非功能需求

| 维度 | V1 目标 |
|------|---------|
| 性能 | Lighthouse Performance ≥ 90；Figma iframe lazy load |
| 可访问性 | 文档站 WCAG 2.1 AA；代码块语义化 |
| SEO | Fumadocs 静态生成 + sitemap |
| 安全 | Figma 文件权限与文档站访问策略一致；CMS 走 Git PR review |
| 可维护性 | 内容即代码；frontmatter schema 校验（Zod） |

---

## 10. 风险与对策

| 风险 | 对策 |
|------|------|
| Figma embed 权限与内网访问 | 提前统一 Figma 文件 sharing 策略；内网部署需验证 embed 可达性 |
| Token 与 Figma Variables 漂移 | Tokens Studio + Git PR 为单一事实来源；禁止仅改 Figma Variables 不同步 |
| CMS 与 MDX schema 不一致 | frontmatter Zod 校验 + CI 构建失败即阻断 |
| Tina Cloud 依赖 | 保留 Keystatic 迁移路径；内容始终在 Git |
| 中文搜索质量 | 配置 FlexSearch CJK encoder |

---

## 11. 关键决策记录（ADR 摘要）

| ID | 决策 | 理由 |
|----|------|------|
| ADR-001 | 文档框架选 Fumadocs | Next.js 栈、MDX 扩展、现代 UI、非 Storybook 路线 |
| ADR-002 | 不做网站内交互组件 | 组件为移动端客户端实现，Web demo 无代表性与维护成本 |
| ADR-003 | CMS 首选 TinaCMS（Phase 2） | 设计师可视化编辑 + 自定义 MDX block；本地 `/admin` 已接入 |
| ADR-004 | Token 格式 W3C DTCG | 工具可替换、行业标准化 |
| ADR-005 | Figma 交互用原型 embed | 替代 Web playground，更贴近移动体验 |
| ADR-006 | 客户端组件代码独立仓库 | 关注点分离；文档站专注规范传播 |

---

## 相关文档

- [README.md](../README.md) — 快速上手
- [AGENTS.md](../AGENTS.md) — Agent 工作指引（精简权威）
- [CLAUDE.md](../CLAUDE.md) — Claude 入口，指向 AGENTS.md
- [docs/index.md](./index.md) — 工程设计文档索引
- [部署指南：MiFlow / Matrix](./deployment.md) — 分支环境、发布与卡点
- [站点信息架构](./information-architecture.md)
- [实施路线图](./roadmap.md)

## 12. 参考链接

- Fumadocs：https://www.fumadocs.dev
- Figma Embed：https://developers.figma.com/docs/embeds/embed-figma-file/
- Figma Code Connect：https://developers.figma.com/docs/code-connect/
- Tokens Studio：https://tokens.studio
- Style Dictionary：https://styledictionary.com
- W3C DTCG：https://design-tokens.github.io/community-group/format/
