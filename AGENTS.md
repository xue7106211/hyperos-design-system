# AGENTS.md

本文件为 AI Agent 与协作者提供 **HyperOS Design System 文档站** 的工作指引。

## 项目是什么

这是一个 **移动端客户端组件库的设计系统文档网站**（非 Web 组件库本身）。

- **技术栈**：Fumadocs + Next.js App Router + MDX + Tailwind CSS 4 + TinaCMS（本地模式）
- **目标用户**：设计、文档、客户端工程（Android / iOS）
- **核心能力**：Guidelines 文档、Figma embed、Design Token 展示、Compose / SwiftUI 静态代码参考

客户端组件 **源码在独立仓库** 维护；本仓只负责规范传播与 Figma / Token 连接。

## 必读约束

修改前请遵守以下边界（详见 [docs/v1/technical-design.md](docs/v1/technical-design.md)）：

| 要做 | 不要做 |
|------|--------|
| 在 MDX 中写文档、嵌 Figma、展示 Token | 添加 Storybook 或 Web 可交互组件 demo |
| 用 `FigmaEmbed` / `FigmaPrototypeEmbed` 展示设计 | 引入 runnable React 组件库到文档页 |
| 用 `PlatformTabs` 展示 Android / iOS **静态**代码 | 在本仓实现 Compose / SwiftUI 组件运行时 |
| 编辑 `content/docs/` 与 `tokens/tokens.json` | 把工程设计文档写到 `content/docs/`（工程设计在 `docs/`） |
| 保持改动最小、符合现有 IA | 擅自重构 Fumadocs 脚手架或引入无关依赖 |

## 常用命令

包管理器：**npm**（`package-lock.json`；`.npmrc` 启用 `legacy-peer-deps`）

```bash
npm install          # 安装依赖（postinstall 会运行 fumadocs-mdx）
npm run dev          # TinaCMS + Next.js 开发（/admin → CMS 后台）
npm run build        # 本地全量构建（tinacms build + next build），改 tina schema 后必跑
npm run tina:build   # 只跑 tinacms build（刷新 tina/__generated__/）
npm run start        # 启动生产服务
npm run types:check  # MDX 生成 + TypeScript 检查
```

> **生产 Docker 构建只跑 `npx next build`**，不跑 `tinacms build`。详见"容器化部署"节。

## Git 远程与同步

本仓库配置了两个远程，**以 GitLab 为主开发**，GitHub 为镜像同步：

| 远程 | 地址 | 角色 |
|------|------|------|
| **`gitlab`** | `git@git.n.xiaomi.com:xueyifei1/hyperos-design-system.git` | **主远程**（`main` 跟踪 `gitlab/main`；Matrix 部署、内网协作） |
| `origin` | `https://github.com/xue7106211/hyperos-design-system.git` | 镜像远程（对外备份 / GitHub 协作） |

### 拉取（只从一个远程）

统一从 **`gitlab`** 拉取，避免在两个远程之间交替 pull 导致历史分叉：

```bash
git pull gitlab main
```

不要同时对 `gitlab` 和 `origin` 做 rebase / merge 后再交叉推送。

### 推送（必须双远程同步）

每次 push **`main`** 时，**同时推送到 GitLab 和 GitHub**，不要只推一个仓库：

```bash
git push gitlab main
git push origin main
```

推送后可用下面命令确认两边文件树一致（应无 diff）：

```bash
git fetch gitlab main && git fetch origin main
git diff gitlab/main origin/main --stat
```

### 注意

- GitLab `main` 为**受保护分支**，禁止 force push。
- 若一边推送失败，先解决冲突或 rebase，再补推另一边；不要长期只维护一个远程。
- 两边 commit hash 可能因 merge 方式不同而略有差异，但**代码内容应保持一致**。

### TinaCMS 后台

- 本地开发：复制 `.env.example` 为 `.env`，运行 `npm run dev`
- 访问 [http://localhost:3000/admin](http://localhost:3000/admin) 编辑 `content/docs/os4/`、`content/docs/os5/` 下的 MDX 规范
- **Visual Editing**：在 `/admin` 打开文档后，左侧表单会绑定页面 title / description / body；iframe 内点击字段即可编辑
- 正文可插入自定义 block：`FigmaEmbed`、`TokenTable`、`DosDonts`、`PlatformCodeBlock` 等
- 配置：`tina/config.ts` · block 模板：`tina/schema/blocks.ts`
- Collections 按 **OS 版本**（`os4` / `os5`）× 站点分组（Foundations / Components / …）展开；组件子目录使用 `**/*` glob 递归索引

### TinaCMS schema 变更（重要）

`tina/__generated__/` 是 `tinacms build` 的产物，**已提交到仓库**。生产 Docker 构建只跑 `npx next build`，直接读这份产物，不再重跑 tinacms build。

**改到以下文件时必须同步更新 `tina/__generated__/`**：

- `tina/config.ts`
- `tina/schema/**/*`

**同步方式**（二选一）：

```bash
npm run tina:build     # 只跑 tinacms build，最快
# 或
npm run dev            # dev server 会自动重新生成
```

然后 `git add tina/__generated__/` 一起提交。**忘记同步会导致 Matrix CI 类型检查失败或运行时行为异常**。

只是新增 `content/docs/**` 下的 MDX 文档、改 UI 组件、动 Tailwind 等，不需要重新生成。

## 容器化部署

生产走 Docker + Matrix 平台。关键决策：

- **基础镜像**：`micr.cloud.mioffice.cn/devx-build-image/nodejs:22-openeuler2403-base`（Node 22 LTS + openEuler 24.03 / glibc 2.38，兼容 Node.js 生态所有主流原生模块 prebuilt binary）
- **npm 源**：`https://pkgs.d.xiaomi.net/artifactory/api/npm/mi-npm/`
- **多阶段**：deps → builder → runner（runner 只保留 Next.js standalone 运行时）
- **不跑 `tinacms build`**：省 3~4GB 内存 + 更快构建；`tina/__generated__/` 直接从仓库读
- **不打 `/admin`**：生产环境 `/admin` 无鉴权、且 filesystem datalayer 不可写，本就不该暴露（Phase 2 前）
- **构建资源**：Matrix 构建 Pod 内存 **1~2GB** 即可
- **暴露端口**：`3000`；启动命令用镜像里的 `CMD`（`node server.js`）

> **历史坑**：早期用过 `nodejs:22-centos7.9-base`，glibc 2.17 过老，`better-sqlite3` / `next/og` (`@resvg/resvg-js`) / `sharp` 等原生模块 prebuilt binary 需要 glibc ≥ 2.28，SSG 阶段 SIGSEGV。openEuler 24.03 / glibc 2.38 彻底解决。

Dockerfile 详见仓库根目录同名文件；部署分支约定使用 `staging`。

## 目录结构

```text
content/docs/           # 网站对外 MDX 文档（Fumadocs 内容源）
  meta.json             # 根级：os4 / os5 版本 Tab
  os4/                  # HyperOS 4（当前默认内容）
  os5/                  # HyperOS 5（占位，侧栏禁用跳转）
docs/                   # 工程设计文档（技术方案、IA、路线图）
docs/v1/                # V1 设计决策与规划
tokens/tokens.json      # W3C DTCG Design Tokens（TokenTable 读取）
tina/
  config.ts             # TinaCMS schema（按 os4/os5 × 分组 collections）
  schema/blocks.ts      # FigmaEmbed、TokenTable 等 MDX block
  database.ts           # 本地 filesystem datalayer
  __generated__/        # tinacms build 产物（**已提交仓库**，供生产 next build 使用）
.env.example            # TinaCMS 本地模式环境变量模板
public/
  logo/                 # HyperOS Logo 静态资源
  home/                 # Landing 页静态图
  uploads/              # TinaCMS 媒体上传（本地模式）
src/
  app/                  # Next.js 路由（docs、admin、api/tina、search、llms、og）
  components/
    docs/               # DocsVersionSwitcher（OS 版本切换）
    mdx/                # 自定义 MDX 组件（优先在此扩展）
    tina/               # Tina Visual Editing（useTina + TinaMarkdown）
    HyperOSLogo.tsx     # 站点 Logo（light / dark）
  lib/                  # source、layout、tina-docs、docs-version-tabs、shared、cn
source.config.ts        # MDX frontmatter Zod schema
next.config.mjs         # Next.js + fumadocs-mdx；/docs 重定向与旧路径兼容
proxy.ts                # Markdown 内容协商（.md / Accept 重写）
Dockerfile              # Matrix 生产镜像（deps → builder → runner）
.npmrc                  # legacy-peer-deps（TinaCMS 依赖兼容）
AGENTS.md               # 本文件（Agent 指引权威来源）
CLAUDE.md               # 指向本文件
package-lock.json       # npm 锁文件
```

**生成目录**：
- `.source/`（`fumadocs-mdx` 生成）、`.next/`（Next.js 构建缓存）— gitignore，勿手改
- `tina/__generated__/`（`tinacms build` 生成）— **已提交仓库**，改 `tina/config.ts` 或 `tina/schema/**` 后需一并更新（详见上面「TinaCMS schema 变更」节）；子目录 `.cache/` 仍 gitignore

**注意**：`docs/` ≠ `content/docs/`。前者是仓库内设计说明，后者是站点页面内容。

## 信息架构

站点导航由 `content/docs/**/meta.json` 控制。根级 `content/docs/meta.json` 注册 **OS 版本**（`os4` / `os5`）；各版本下为：

```text
Foundations → Components → Patterns → Resources
```

- **默认版本**：`/docs` → `/docs/os4`（`next.config.mjs` 重定向）
- **版本切换**：侧边栏 `DocsVersionSwitcher`（`src/components/docs/`）；配置见 `src/lib/shared.ts`（`docsVersions`）与 `src/lib/docs-version-tabs.ts`
- **旧路径兼容**：`/docs/foundations/...` 等永久重定向到 `/docs/os4/...`
- **OS5**：侧栏可见但禁用；`/docs/os5` 暂重定向到 OS4，待内容发布后移除

新增页面时 **必须**：

1. 在对应 OS 版本目录（如 `content/docs/os4/...`）创建 `.mdx` 文件
2. 更新同级或父级 `meta.json` 的 `pages` 数组
3. 运行 `npm run build` 验证无 404 / MDX 错误

完整 IA 见 [docs/v1/information-architecture.md](docs/v1/information-architecture.md)。

## 新增组件文档页

参考模板：[content/docs/os4/components/actions/button.mdx](content/docs/os4/components/actions/button.mdx)

推荐页面结构：

1. frontmatter（`title`、`description`、`status`、`platforms`、`tokenGroups`）
2. `<StatusBadge />` + 简介
3. `<FigmaEmbed fileKey="..." nodeId="..." />`（Dev Mode 标注：加 `mode="dev"`）
4. （可选）`<FigmaPrototypeEmbed />` 用于移动端交互演示
5. `<TokenTable groups={[...]} />`
6. `<PlatformTabs>` + `<PlatformTab platform="android|ios">` 静态代码
7. `<DosDonts />` 用法说明

### Frontmatter 字段

定义于 [source.config.ts](source.config.ts)：

- `status`: `stable` | `beta` | `deprecated`
- `platforms`: `android` | `ios` | `pad`
- `figmaFileKey`, `figmaNodeId`, `figmaPrototypeUrl`
- `tokenGroups`: TokenTable 过滤前缀，如 `["color.action"]`

## 自定义 MDX 组件

注册入口：[src/components/mdx/index.tsx](src/components/mdx/index.tsx)

| 组件 | 用途 |
|------|------|
| `FigmaEmbed` | Figma 设计稿 iframe（`embed-host=hyperos-ds`；可选 `mode="dev"` 查看 Dev Mode 标注） |
| `FigmaPrototypeEmbed` | Figma 原型 iframe |
| `TokenTable` | 从 `tokens/tokens.json` 按 group 渲染表格 |
| `PlatformTabs` / `PlatformTab` | Android / iOS 代码 Tab（Client Component） |
| `PlatformCodeBlock` | Tina CMS 友好的平台代码 block（扁平 android/ios 字段） |
| `StatusBadge` | stable / beta / deprecated 标签 |
| `DosDonts` | Do / Don't 双栏 |

新增 MDX 组件时：在 `src/components/mdx/` 实现并在 `index.tsx` 注册；Server / Client 边界与现有组件保持一致。

## Design Tokens

- 格式：**W3C DTCG** JSON，路径 `tokens/tokens.json`
- 命名：`{category}.{semantic-group}.{property}`（如 `color.action.primary-bg`）
- 解析逻辑：[src/components/mdx/token-utils.ts](src/components/mdx/token-utils.ts)
- 后续计划：Tokens Studio → GitHub PR → 自动更新（Phase 3，尚未接入）

不要硬编码色值到 MDX；文档中优先引用 Token 名或通过 `TokenTable` 展示。

## 主题与品牌

- 文档站 UI：Fumadocs 默认 `neutral.css` 主题（`src/app/global.css` 未覆盖 `--color-fd-*` 品牌色）
- 排版与布局：`global.css` 中紧凑 typography、sidebar 贴左 + 内容居中 grid
- Logo：`src/components/HyperOSLogo.tsx` + `public/logo/`
- 业务 Design Token：`tokens/tokens.json`（HyperOS 设计规范）
- 站点名、版本与 nav：[src/lib/shared.ts](src/lib/shared.ts)（`docsVersions`、`defaultDocsRoute`）、[src/lib/layout.shared.tsx](src/lib/layout.shared.tsx)

文档站 chrome token 与业务 Design Token **不要混用**。

## 搜索与 AI 导出

- 全文搜索：Orama（[src/app/api/search/route.ts](src/app/api/search/route.ts)）
- LLM 导出：`/llms.txt`（索引）、`/llms-full.txt`（全文）、`/llms.mdx/docs/*`（单页 Markdown）

## Figma 集成

- Embed API：https://developers.figma.com/docs/embeds/embed-figma-file/
- 无 `fileKey` 时组件显示占位提示（预期行为）
- 配置说明页：[content/docs/os4/resources/figma-library.mdx](content/docs/os4/resources/figma-library.mdx)
- Code Connect（Dev Mode）尚未在本仓实现，计划在 Phase 3 试点

## 代码风格

- TypeScript strict mode
- 使用 `@/` 路径别名（映射 `src/`）
- MDX 内容默认 **中文**；URL 不硬编码 locale 前缀
- 遵循现有 Fumadocs 约定，不引入与文档站无关的抽象层
- 注释仅解释非显而易见的业务或集成逻辑

## 验证清单

提交改动前：

- [ ] `npm run build` 成功（含 `tinacms build`）
- [ ] 新页面已在 `meta.json` 注册
- [ ] 未破坏 `docs/v1/` 工程设计文档
- [ ] 未添加 Storybook / Web 组件 playground
- [ ] Figma embed 使用占位或有效 `fileKey`
- [ ] 若改了 `tina/config.ts` 或 `tina/schema/**`，`tina/__generated__/` 已同步更新并 `git add`

## 路线图（Agent 勿提前实现）

以下属于后续 Phase，除非用户明确要求，否则不要主动实现：

- **Phase 2（进行中）**：TinaCMS `/admin` 已接入本地模式；待补 TinaCloud / 自托管鉴权与生产 Git 同步
- **Phase 3**：Tokens Studio + Style Dictionary CI、Figma Code Connect

当前状态见 [docs/v1/roadmap.md](docs/v1/roadmap.md)。

## 相关文档

- [README.md](README.md) — 快速上手
- [CLAUDE.md](CLAUDE.md) — Claude 入口（指向本文件）
- [docs/index.md](docs/index.md) — 工程设计文档索引
- [docs/v1/technical-design.md](docs/v1/technical-design.md) — V1 技术方案
- [docs/v1/information-architecture.md](docs/v1/information-architecture.md) — 站点 IA
- [docs/v1/roadmap.md](docs/v1/roadmap.md) — 实施进度
- [Fumadocs 官方文档](https://www.fumadocs.dev)
