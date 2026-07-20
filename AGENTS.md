# AGENTS.md

本文件为 AI Agent 与协作者提供 **HyperOS Design System 文档站** 的工作指引。

## 项目是什么

这是一个 **移动端客户端组件库的设计系统文档网站**（非 Web 组件库本身）。

- **技术栈**：Fumadocs + Next.js App Router + MDX + Tailwind CSS 4 + TinaCMS（本地模式）
- **目标用户**：设计、文档、客户端工程（Android / iOS）
- **核心能力**：Guidelines 文档、Figma embed、Design Token 展示、图标库预览、Compose / SwiftUI 静态代码参考

客户端组件 **源码在独立仓库** 维护；本仓只负责规范传播与 Figma / Token / 图标资产连接。

## 必读约束

修改前请遵守以下边界（详见 [docs/technical-design.md](docs/technical-design.md)）：

| 要做 | 不要做 |
|------|--------|
| 在 MDX 中写文档、嵌 Figma、展示 Token / 图标 | 添加 Storybook 或 Web 可交互组件 demo |
| 用 `FigmaEmbed` / `FigmaPrototypeEmbed` 展示设计 | 引入 runnable React 组件库到文档页 |
| 用 `PlatformTabs` 展示 Android / iOS **静态**代码 | 在本仓实现 Compose / SwiftUI 组件运行时 |
| 编辑 `content/docs/`、`tokens/*.json`、`icons/` | 把工程设计文档写到 `content/docs/`（工程设计在 `docs/`） |
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
npm run icons:sync   # 扫描 icons/svg → manifest + public/icons
npm run icons:import -- /path/to/svgs  # 扁平 SVG 导入并 sync
```

> **生产 Docker 构建只跑 `npx next build`**，不跑 `tinacms build`。部署详解见 [docs/deployment.md](docs/deployment.md)。

## Git 与发布（Agent 必读）

| 远程 | 角色 |
|------|------|
| **`gitlab`** | 主远程（开发 + CI） |
| `origin`（GitHub） | 镜像；push `main` / `staging` 时双端同步 |

| 分支 | 环境 | Agent 判断 |
|------|------|------------|
| **`main`** | 正式（`…-prod`，tag `prod-*`） | push main → 只保证 **prod 镜像构建**；**当前流水线不自动发正式**，需 Matrix 手动发 `prod-*` |
| **`staging`** | 测试（`…-staging`，tag `staging-*`） | 测环境要一致：必须 `main` merge 进 `staging` 再 push |

- 拉取只用 `git pull gitlab main`，不要双远程交叉 rebase
- push：`git push gitlab <branch>` + `git push origin <branch>`
- **不要**把「流水线运行完成」当成站点已更新；以 Matrix 实例 Tag / Running 为准
- 完整流程、MiFlow/Matrix 职责、卡点排查 → [docs/deployment.md](docs/deployment.md)

### Commit 邮箱（Agent 必读）

- **不要**改全局 / 仓库 `git config user.email`；提交时用单次覆盖：`git -c user.email="..." commit ...`
- **GitLab**（主远程）：`xueyifei1@xiaomi.com`
- **GitHub**：`allenxue.design@gmail.com`
- 本仓双端 push 时同一 commit 只能有一个 author → **默认用 GitLab 邮箱** `xueyifei1@xiaomi.com`

### Commit 信息（Agent 必读）

- **一律使用中文**撰写 commit message（说明「为什么」改，而非罗列文件）
- 推荐 Conventional Commits 前缀 + 中文主题，例如：
  - `feat: 补充站点元数据与 favicon / OG 图`
  - `fix: 修复首页开发服务器 500 错误`
  - `docs: 更新 AGENTS 中的 Git 约定`
  - `chore: 同步 tina/__generated__`
- 类型前缀（`feat` / `fix` / `docs` / `chore` / `refactor` / `test` 等）可保留英文；**主题与正文必须用中文**
- 不要写纯英文 commit（专有名词、路径、命令可保留英文）

### TinaCMS 后台

- 本地开发：复制 `.env.example` 为 `.env`，运行 `npm run dev`
- 访问 [http://localhost:3000/admin](http://localhost:3000/admin) 编辑 `content/docs/os4/`、`content/docs/os5/` 下的 MDX 规范
- **Visual Editing**：在 `/admin` 打开文档后，左侧表单会绑定页面 title / description / body；iframe 内点击字段即可编辑
- 正文可插入自定义 block：`FigmaEmbed`、`TokenTable`、`IconGallery`、`DosDonts`、`PlatformCodeBlock` 等
- 配置：`tina/config.ts` · block 模板：`tina/schema/blocks.ts`
- Collections 按 **OS 版本**（`os4` / `os5`）× 站点分组（通用设计 / 控件与组件 / …）展开；组件子目录使用 `**/*` glob 递归索引

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

增删改 `icons/svg/**` 后须跑 `npm run icons:sync`，并将 `icons/manifest.json` 与 `public/icons/` 一并提交（约定见 [icons/README.md](icons/README.md)）。

### 图标资产（Agent 必读）

- 源文件：`icons/svg/{category}/{name}.svg`；索引：`icons/manifest.json`；站点静态：`public/icons/`
- 文档页：`/docs/os4/icons`（`<IconGallery />`）
- 旧路径：`/docs/os4/foundations/iconography`、`/docs/os4/general/icons` → `/docs/os4/icons`

## 容器化（Agent 必读）

- 生产镜像：根目录 `Dockerfile`；**只跑 `npx next build`**，读已提交的 `tina/__generated__/`
- 改 `tina/config.ts` / `tina/schema/**` 后必须同步 `tina/__generated__/` 再提交
- 用户问部署 / 环境不一致 / MiFlow·Matrix 时：读 [docs/deployment.md](docs/deployment.md)，不要在本文件展开长教程
- 用户要求「上正式」时：提醒 **push main ≠ 正式站已更新**；需 Matrix 发 `prod-*`（除非流水线已补「发布prod」）

## 目录结构

```text
content/docs/           # 网站对外 MDX 文档（Fumadocs 内容源）
  meta.json             # 根级：os4 / os5 版本 Tab
  os4/                  # HyperOS 4（当前默认内容）
    general/            # 通用设计标准
    components/         # 控件与组件（navigation / actions / inputs / containers / display）
    interaction/        # 人机交互标准
    system/             # 系统特性与能力标准
    multi-device/        # 多端设备标准
    best-practices/     # 应用最佳实践标准
  os5/                  # HyperOS 5（占位，侧栏禁用跳转；结构同 os4）
docs/                   # 工程设计文档（见 docs/index.md）
  index.md
  deployment.md
  technical-design.md
  information-architecture.md
  sidebar-ia.md
  roadmap.md
  maintainers.md
tokens/                 # Design Tokens（reference|semantic|component × light|dark）
icons/                  # 图标源 SVG + manifest（IconGallery；见 icons/README.md）
  svg/{category}/
  manifest.json
scripts/                # 仓库脚本（generate-icon-manifest.mjs、import-os4-tokens.mjs 等）
tina/
  config.ts             # TinaCMS schema（按 os4/os5 × 分组 collections）
  schema/blocks.ts      # FigmaEmbed、TokenTable、IconGallery 等 MDX block
  database.ts           # 本地 filesystem datalayer
  __generated__/        # tinacms build 产物（**已提交仓库**，供生产 next build 使用）
.env.example            # TinaCMS 本地模式环境变量模板
public/
  logo/                 # HyperOS Logo 静态资源
  home/                 # Landing 页静态图
  icons/                # 图标静态访问（icons:sync 产物，含 manifest.json）
  uploads/              # TinaCMS 媒体上传（本地模式）
src/
  app/                  # Next.js 路由（docs、admin、api/tina、search、llms、og）
  components/
    docs/               # DocsVersionSwitcher、FigmaJumpButton、DocMeta
    home/               # Landing：HomeHero、PillNav、HalftoneBloom
    mdx/                # 自定义 MDX 组件（优先在此扩展）
    tina/               # Tina Visual Editing（useTina + TinaMarkdown）
    HyperOSLogo.tsx     # 站点 Logo（light / dark）
  lib/                  # source、layout、shared、icons、tina-docs、docs-version-tabs、git-file-mtime、cn
source.config.ts        # MDX frontmatter Zod schema
next.config.mjs         # Next.js + fumadocs-mdx；/docs 重定向与旧路径兼容
proxy.ts                # Markdown 内容协商（.md / Accept 重写）
Dockerfile              # 生产镜像（deps → builder → runner；MiFlow 构建；builder 保留 .git）
.npmrc                  # legacy-peer-deps（TinaCMS 依赖兼容）
AGENTS.md               # 本文件（Agent 指引；部署细节见 docs/deployment.md）
CLAUDE.md               # 指向本文件
package-lock.json       # npm 锁文件
```

**生成目录**：
- `.source/`（`fumadocs-mdx` 生成）、`.next/`（Next.js 构建缓存）— gitignore，勿手改
- `tina/__generated__/`（`tinacms build` 生成）— **已提交仓库**，改 `tina/config.ts` 或 `tina/schema/**` 后需一并更新（详见上面「TinaCMS schema 变更」节）；子目录 `.cache/` 仍 gitignore
- `icons/manifest.json` 与 `public/icons/`（`icons:sync` 生成）— **已提交仓库**，改 `icons/svg/**` 后需一并更新

**注意**：`docs/` ≠ `content/docs/`。前者是仓库内设计说明，后者是站点页面内容。

## 信息架构

站点导航由 `content/docs/**/meta.json` 控制。根级 `content/docs/meta.json` 注册 **OS 版本**（`os4` / `os5`）；各版本下为：

各版本内一级目录：

```text
通用设计标准 → 控件与组件 → 人机交互标准 → 系统特性与能力标准 → 多端设备标准 → 应用最佳实践标准
```

（路径：`general` / `components` / `interaction` / `system` / `multi-device` / `best-practices`）

- **默认版本**：`/docs` → `/docs/os4`（`next.config.mjs` 重定向）
- **版本切换**：侧边栏 `DocsVersionSwitcher`（`src/components/docs/`）；配置见 `src/lib/shared.ts`（`docsVersions`）与 `src/lib/docs-version-tabs.ts`
- **旧路径兼容**：`/docs/foundations/...` 等永久重定向到新 IA（见 `next.config.mjs`）
- **OS5**：侧栏可见但禁用；`/docs/os5` 暂重定向到 OS4，待内容发布后移除

新增页面时 **必须**：

1. 在对应 OS 版本目录（如 `content/docs/os4/...`）创建 `.mdx` 文件
2. 更新同级或父级 `meta.json` 的 `pages` 数组
3. 运行 `npm run build` 验证无 404 / MDX 错误

完整 IA 见 [docs/information-architecture.md](docs/information-architecture.md)。

## 新增组件文档页

参考模板：[content/docs/os4/components/actions/button.mdx](content/docs/os4/components/actions/button.mdx)

推荐页面结构：

1. frontmatter（`title`、`description`、`status`、`platforms`、`tokenGroups`、`maintainer` 等）
2. `<StatusBadge />` + 简介
3. `<FigmaEmbed fileKey="..." nodeId="..." />`（Dev Mode 标注：加 `mode="dev"`）
4. （可选）`<FigmaPrototypeEmbed />` 用于移动端交互演示
5. `<TokenTable groups={[...]} />`
6. `<PlatformTabs>` + `<PlatformTab platform="android|ios">` 静态代码
7. `<DosDonts />` 用法说明

文档页顶栏（标题 / 描述下方操作区）由布局自动展示 **更新时间**（该 MDX 的 git 最后提交日）与 **维护人**（frontmatter；缺省「HyperOS 设计系统团队」）。有 `maintainerOpenId` 时可点击维护人，经飞书 AppLink 打开单聊。

### Frontmatter 字段

定义于 [source.config.ts](source.config.ts)：

- `status`: `stable` | `beta` | `deprecated`
- `platforms`: `android` | `ios` | `pad`
- `figmaFileKey`, `figmaNodeId`, `figmaPrototypeUrl`
- `tokenGroups`: TokenTable 过滤前缀，如 `["semantic.fill", "component.navigation"]`
- `maintainer`: 维护人显示名（可选）
- `maintainerOpenId`: 飞书 `open_id`（`ou_` 前缀；可选，有值则可点开会话）

## 自定义 MDX 组件

注册入口：[src/components/mdx/index.tsx](src/components/mdx/index.tsx)

| 组件 | 用途 |
|------|------|
| `FigmaEmbed` | Figma 设计稿 iframe（`embed-host=hyperos-ds`；可选 `mode="dev"` 查看 Dev Mode 标注） |
| `FigmaPrototypeEmbed` | Figma 原型 iframe |
| `TokenTable` | 从 `tokens/*.{light,dark}.json` 按 group 渲染；支持 Light / Dark 切换 |
| `IconGallery` | 图标库预览（分类 / 搜索 / 深浅色 / 复制名称与 SVG） |
| `PlatformTabs` / `PlatformTab` | Android / iOS 代码 Tab（Client Component） |
| `PlatformCodeBlock` | Tina CMS 友好的平台代码 block（扁平 android/ios 字段） |
| `StatusBadge` | stable / beta / deprecated 标签 |
| `DosDonts` | Do / Don't 双栏 |

新增 MDX 组件时：在 `src/components/mdx/` 实现并在 `index.tsx` 注册；Server / Client 边界与现有组件保持一致。

## Design Tokens

- 格式：W3C DTCG 风格 JSON；**按层 × 模式** 存放：
  - `tokens/reference.{light,dark}.json` — 色板与基础数值
  - `tokens/semantic.{light,dark}.json` — 语义色 / 间距 / 圆角
  - `tokens/component.{light,dark}.json` — 组件级 Token
- 命名：保留 Figma / MIUIX 原名（`miuix_*`，展示时不加层/分组前缀）；`TokenTable` 的 `groups`（如 `semantic.bg`）仅作筛选
- 解析逻辑：[src/components/mdx/token-utils.ts](src/components/mdx/token-utils.ts)
- 重新导入：`npm run tokens:import -- /path/to/OS4Token`（见 [scripts/import-os4-tokens.mjs](scripts/import-os4-tokens.mjs)）
- Typography 尚未入库；后续导出后补充
- 后续计划：Tokens Studio → GitHub PR → 自动更新（Phase 3，尚未接入）

不要硬编码色值到 MDX；文档中优先引用 Token 名或通过 `TokenTable` 展示。

## 主题与品牌

- 文档站 UI：Fumadocs 默认 `neutral.css` 主题（`src/app/global.css` 未覆盖 `--color-fd-*` 品牌色）
- 排版与布局：`global.css` 中紧凑 typography、sidebar 贴左 + 内容居中 grid
- Logo：`src/components/HyperOSLogo.tsx` + `public/logo/`
- 业务 Design Token：`tokens/*.{light,dark}.json`（HyperOS OS4；与文档站 chrome 分离）
- 站点名、版本与 nav：[src/lib/shared.ts](src/lib/shared.ts)（`docsVersions`、`defaultDocsRoute`、`defaultFigmaUrl`）、[src/lib/layout.shared.tsx](src/lib/layout.shared.tsx)
- 文档页操作栏「跳转 Figma」：[src/components/docs/FigmaJumpButton.tsx](src/components/docs/FigmaJumpButton.tsx)（优先页级 `figmaFileKey` / `figmaPrototypeUrl`，否则 `defaultFigmaUrl`）
- 文档页元信息（更新时间 / 维护人）：[src/components/docs/DocMeta.tsx](src/components/docs/DocMeta.tsx)；更新时间见 [src/lib/git-file-mtime.ts](src/lib/git-file-mtime.ts)

文档站 chrome token 与业务 Design Token **不要混用**。

## 搜索与 AI 导出

- 全文搜索：Orama（[src/app/api/search/route.ts](src/app/api/search/route.ts)）
- LLM 导出：`/llms.txt`（索引）、`/llms-full.txt`（全文）、`/llms.mdx/docs/*`（单页 Markdown）

## Figma 集成

- Embed API：https://developers.figma.com/docs/embeds/embed-figma-file/
- 无 `fileKey` 时组件显示占位提示（预期行为）
- 配置说明页：暂挂 [应用最佳实践标准](content/docs/os4/best-practices/index.mdx)（原 `resources/figma-library` 已重定向）
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
- [ ] 未破坏 `docs/` 工程设计文档
- [ ] 未添加 Storybook / Web 组件 playground
- [ ] Figma embed 使用占位或有效 `fileKey`
- [ ] 若改了 `tina/config.ts` 或 `tina/schema/**`，`tina/__generated__/` 已同步更新并 `git add`
- [ ] 若改了 `icons/svg/**`，已跑 `icons:sync` 并提交 `icons/manifest.json` 与 `public/icons/`
- [ ] 上测环境：`main` → `staging` 已 merge 并 push；Matrix staging 实例 Tag 已更新
- [ ] 上正式：`main` 已 push 且 prod 镜像已构建；**Matrix `…-prod` 已发对应 `prod-*`**（勿仅凭流水线绿判断）

## 路线图（Agent 勿提前实现）

以下属于后续 Phase，除非用户明确要求，否则不要主动实现：

- **Phase 2（进行中）**：TinaCMS `/admin` 已接入本地模式；待补 TinaCloud / 自托管鉴权与生产 Git 同步
- **Phase 3**：Tokens Studio + Style Dictionary CI、Figma Code Connect

当前状态见 [docs/roadmap.md](docs/roadmap.md)。

## 相关文档

- [README.md](README.md) — 快速上手
- [CLAUDE.md](CLAUDE.md) — Claude 入口（指向本文件）
- [docs/index.md](docs/index.md) — 工程设计文档索引
- [docs/deployment.md](docs/deployment.md) — MiFlow / Matrix 部署与卡点
- [docs/technical-design.md](docs/technical-design.md) — 技术方案
- [docs/information-architecture.md](docs/information-architecture.md) — 站点 IA
- [docs/sidebar-ia.md](docs/sidebar-ia.md) — 侧栏目录对照（全景图）
- [docs/roadmap.md](docs/roadmap.md) — 实施进度
- [docs/maintainers.md](docs/maintainers.md) — 维护人飞书 open_id 备忘
- [icons/README.md](icons/README.md) — 图标 SVG 入库与 sync 约定
- [Fumadocs 官方文档](https://www.fumadocs.dev)
