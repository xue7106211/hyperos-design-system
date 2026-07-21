# HyperOS Design System — 工程设计文档索引

本目录存放 **仓库内的设计与规划文档**（非网站对外内容）。网站 MDX 内容见 [`content/docs/`](../content/docs/)。

## 按任务选读

| 任务 | 阅读 |
|------|------|
| 快速上手、本地运行 | [README.md](../README.md) |
| Agent / 协作者约定 | [AGENTS.md](../AGENTS.md)（[CLAUDE.md](../CLAUDE.md) 同指向） |
| CMS 后台录入规范 | `npm run dev` → [http://localhost:3000/admin](http://localhost:3000/admin) |
| 容器化 / MiFlow / Matrix 部署 | [deployment.md](./deployment.md) · 根目录 `Dockerfile` |
| 技术选型与架构边界 | [technical-design.md](./technical-design.md) |
| 站点目录与路由规划 | [information-architecture.md](./information-architecture.md) |
| 侧栏目录对照（全景图） | [sidebar-ia.md](./sidebar-ia.md) |
| 实施进度与后续 Phase | [roadmap.md](./roadmap.md) |
| 维护人飞书 open_id | [maintainers.md](./maintainers.md) |
| 图标 SVG 入库 / sync | [icons/README.md](../icons/README.md) · `npm run icons:sync` |
| Design Token 导入 | `npm run tokens:import -- /path/to/OS4Token` |

## 文档目录

| 文档 | 说明 |
|------|------|
| [deployment.md](./deployment.md) | MiFlow / Matrix：平台职责、分支环境、发布步骤、卡点排查 |
| [technical-design.md](./technical-design.md) | 架构、选型、内容模型、Figma / Token / 图标集成 |
| [information-architecture.md](./information-architecture.md) | Sidebar 结构、页面类型、MVP 页面集 |
| [sidebar-ia.md](./sidebar-ia.md) | 设计系统全景图侧栏对照（已落地） |
| [roadmap.md](./roadmap.md) | Phase 进度与后续计划 |
| [maintainers.md](./maintainers.md) | 文档页 `maintainerOpenId` 备忘 |
| [icons/README.md](../icons/README.md) | 图标 SVG 入库与 `icons:sync` 约定 |

## 路径对照

| 路径 | 用途 |
|------|------|
| `docs/` | 工程设计文档（本目录） |
| `content/docs/` | Fumadocs 网站 MDX（根级 `meta.json` 注册 `os4` / `os5`） |
| `content/docs/os4/` | HyperOS 4 规范（默认；一级：`general` / `components` / `interaction` / `system` / `multi-device` / `best-practices` / `resources`） |
| `content/docs/os4/resources/icons.mdx` | HyperOS 图标库预览（`<IconGallery />`；属「资源」一级目录） |
| `content/docs/os5/` | HyperOS 5 占位（侧栏可见，内容未发布） |
| `icons/` | 图标源 SVG + `manifest.json`（见 [icons/README.md](../icons/README.md)） |
| `tokens/` | Design Tokens：`reference|semantic|component` × `light|dark` |
| `public/icons/` | 图标静态访问（`icons:sync` 产物） |
| `scripts/` | 仓库脚本（含 `generate-icon-manifest.mjs`、`import-os4-tokens.mjs`） |
| `src/components/docs/` | `DocsVersionSwitcher`、`FigmaJumpButton`、`DocMeta` |
| `src/lib/git-file-mtime.ts` | 文档「更新时间」（git 最后提交日） |
| `src/lib/icons.ts` | 图标 manifest 读取 |
| `src/lib/shared.ts` | 站点常量、默认维护人、飞书 AppLink |
| `source.config.ts` | MDX frontmatter schema |
| `tina/` | TinaCMS schema 与已提交的 `__generated__/` |
| `Dockerfile` | 生产镜像（不跑 `tinacms build`；builder 保留 `.git`） |
| `AGENTS.md` / `CLAUDE.md` | Agent 工作指引 |

## 变更摘要

- **2026-07-21**：侧栏「资源」一级目录；图标页迁至 `/docs/os4/resources/icons`，更名为 HyperOS 图标库；修正旧 `resources/*` 通配重定向冲突。
- **2026-07-20**：OS4 Token 真源入库（`tokens/{reference,semantic,component}.{light,dark}.json`）；TokenTable 支持 Light / Dark。
- **2026-07-17**：图标预览（`IconGallery` + `icons/` 资产管线）；侧栏曾为 OS 一级入口 `/docs/os4/icons`。
- **2026-07-10**：取消无语义的 `docs/v1/`，工程文档扁平到 `docs/`；`sidebar-ia-draft` → `sidebar-ia`，`user-id` → `maintainers`。
- **2026-07-10**：文档页元信息（更新时间 / 维护人）；移除「通用设计总览」。
- **2026-07-10**：按全景图重构侧栏 IA；文档页「跳转 Figma」。
- **2026-07-09**：OS 版本分目录；部署指南；TinaCMS 本地 `/admin`。
