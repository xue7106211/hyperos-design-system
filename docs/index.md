# HyperOS Design System — 工程设计文档索引

本目录存放 **仓库内的设计与规划文档**（非网站对外内容）。网站 MDX 内容见 [`content/docs/`](../content/docs/)。

## 按任务选读

| 任务 | 阅读 |
|------|------|
| 快速上手、本地运行 | [README.md](../README.md) |
| Agent / 协作者约定 | [AGENTS.md](../AGENTS.md)（[CLAUDE.md](../CLAUDE.md) 同指向） |
| CMS 后台录入规范 | `npm run dev` → [http://localhost:3000/admin](http://localhost:3000/admin) |
| 技术选型与架构边界 | [v1/technical-design.md](./v1/technical-design.md) |
| 站点目录与路由规划 | [v1/information-architecture.md](./v1/information-architecture.md) |
| 实施进度与后续 Phase | [v1/roadmap.md](./v1/roadmap.md) |

## 文档目录

| 文档 | 说明 |
|------|------|
| [V1 技术设计方案](./v1/technical-design.md) | 架构、选型、内容模型、Figma / Token 集成 |
| [V1 站点信息架构](./v1/information-architecture.md) | Sidebar 结构、页面类型、MVP 页面集 |
| [V1 实施路线图](./v1/roadmap.md) | Phase 0–1 完成、TinaCMS 本地模式与 Phase 2–3 计划 |

## 路径对照

| 路径 | 用途 |
|------|------|
| `docs/` | 工程设计文档（本目录） |
| `content/docs/` | Fumadocs 网站 MDX 内容 |
| `tokens/tokens.json` | W3C DTCG Design Tokens |
| `src/components/mdx/` | 网站自定义 MDX 组件 |
| `src/components/tina/` | Tina Visual Editing 组件 |
| `src/app/api/search/` | Orama 全文搜索 API |
| `public/logo/` | HyperOS Logo 静态资源 |
| `public/uploads/` | TinaCMS 媒体上传（本地模式） |
| `tina/` | TinaCMS schema 与 block 模板 |
| `.env.example` | TinaCMS 本地模式环境变量模板 |
| `proxy.ts` | Markdown 内容协商（`.md` URL 与 `Accept` 重写） |
| `source.config.ts` | MDX frontmatter Zod schema |
| `AGENTS.md` / `CLAUDE.md` | Agent 工作指引（CLAUDE 指向 AGENTS） |

## 版本

- **V1.0**（2026-07-08）：Fumadocs 文档站 Phase 0–1 已落地；TinaCMS 本地 `/admin` 已接入。
