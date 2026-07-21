# HyperOS Design System 文档站 — V1 实施路线图

> **版本**：V1.0  
> **状态**：Phase 0–1 已完成；Phase 2 TinaCMS 本地模式已接入（2026-07-08）

## 已完成

- [x] Fumadocs + Next.js 脚手架（npm，`+next+fuma-docs-mdx` 模板）
- [x] HyperOS Logo 与 Landing 页
- [x] 自定义 MDX 组件（FigmaEmbed、FigmaPrototypeEmbed、TokenTable、PlatformTabs、StatusBadge、DosDonts）
- [x] FigmaEmbed Dev Mode（`mode="dev"`）与 Button 完整规范页
- [x] 完整 IA 骨架 + MVP 示范页
- [x] OS4 Design Tokens 真源入库（Reference / Semantic / Component × Light / Dark）+ TokenTable 模式切换
- [x] 紧凑排版、sidebar 贴左 + 内容居中布局
- [x] 全文搜索、明暗主题、LLM 导出（`llms.txt` / `llms-full.txt`）
- [x] `AGENTS.md`、`CLAUDE.md` 与工程设计文档索引
- [x] TinaCMS `/admin` 本地模式 + 自定义 MDX block（FigmaEmbed、TokenTable、DosDonts、PlatformCodeBlock）
- [x] OS 版本分目录（`content/docs/os4`、`os5`）+ 侧边栏 `DocsVersionSwitcher` + 旧路径重定向
- [x] Docker / MiFlow / Matrix 部署文档（[deployment.md](./deployment.md)；正式环境当前需 Matrix 手动发 `prod-*`）
- [x] 按设计系统全景图重构侧栏 IA（`general` / `components` / `interaction` / `system` / `multi-device` / `best-practices`；对照 [sidebar-ia.md](./sidebar-ia.md)）
- [x] 文档页操作栏「跳转 Figma」（`FigmaJumpButton`；默认库 URL 见 `src/lib/shared.ts`）
- [x] 侧栏「资源」一级目录；图标页 `/docs/os4/resources/icons`（HyperOS 图标库）
- [x] 图标预览页 + `IconGallery` + `icons/` 资产管线（`icons:sync` / `icons:import`）

## 下一步

- [ ] 发布 HyperOS 5 文档内容并解除 OS5 禁用 / 重定向
- [ ] 图标库全量入库（约 400+）与分类 / 命名规范化
- [ ] MiFlow `main` 流水线补「发布prod」（与 staging 对称），减少手动发布
- [ ] TinaCMS 生产鉴权（Auth.js / 内网 SSO）与 Git 同步
- [ ] Phase 2：TinaCloud 或自托管 datalayer 部署
- [ ] Phase 3：Tokens Studio → Git 自动同步；补充 Typography Token
- [ ] Figma Code Connect（Compose / SwiftUI）试点
- [ ] 已有规范文本批量导入

## 相关文档

- [部署指南：MiFlow / Matrix](./deployment.md)
- [技术设计方案](./technical-design.md)
- [站点信息架构](./information-architecture.md)
- [侧栏目录对照（全景图）](./sidebar-ia.md)
- [工程设计文档索引](./index.md)
- [图标资产约定](../icons/README.md)
- [AGENTS.md](../AGENTS.md) · [CLAUDE.md](../CLAUDE.md)
