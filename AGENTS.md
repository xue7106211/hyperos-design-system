# AGENTS.md

本文件为 AI Agent 与协作者提供 **HyperOS Design System 文档站** 的工作指引。

## 项目是什么

这是一个 **移动端客户端组件库的设计系统文档网站**（非 Web 组件库本身）。

- **技术栈**：Fumadocs + Next.js App Router + MDX + Tailwind CSS 4
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

包管理器：**npm**（`package-lock.json`）

```bash
npm install          # 安装依赖（postinstall 会运行 fumadocs-mdx）
npm run dev          # 开发服务器 http://localhost:3000
npm run build        # 生产构建（提交前必须能通过）
npm run start        # 启动生产服务
npm run types:check  # MDX 生成 + TypeScript 检查
```

## 目录结构

```text
content/docs/           # 网站对外 MDX 文档（Fumadocs 内容源）
docs/                   # 工程设计文档（技术方案、IA、路线图）
docs/v1/                # V1 设计决策与规划
tokens/tokens.json      # W3C DTCG Design Tokens（TokenTable 读取）
src/
  app/                  # Next.js 路由与布局
  components/mdx/       # 自定义 MDX 组件（优先在此扩展）
  lib/                  # source loader、layout 配置
source.config.ts        # MDX frontmatter Zod schema
AGENTS.md               # 本文件
package-lock.json       # npm 锁文件
```

**生成目录（勿手改）**：`.source/`（`fumadocs-mdx` 生成）、`.next/`（Next.js 构建缓存）

**注意**：`docs/` ≠ `content/docs/`。前者是仓库内设计说明，后者是站点页面内容。

## 信息架构

站点导航由 `content/docs/**/meta.json` 控制，结构为：

```text
Foundations → Components → Patterns → Resources
```

新增页面时 **必须**：

1. 在对应目录创建 `.mdx` 文件
2. 更新同级或父级 `meta.json` 的 `pages` 数组
3. 运行 `npm run build` 验证无 404 / MDX 错误

完整 IA 见 [docs/v1/information-architecture.md](docs/v1/information-architecture.md)。

## 新增组件文档页

参考模板：[content/docs/components/actions/button.mdx](content/docs/components/actions/button.mdx)

推荐页面结构：

1. frontmatter（`title`、`description`、`status`、`platforms`、`tokenGroups`）
2. `<StatusBadge />` + 简介
3. `<FigmaEmbed fileKey="..." nodeId="..." />`
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
| `FigmaEmbed` | Figma 设计稿 iframe（`embed-host=hyperos-ds`） |
| `FigmaPrototypeEmbed` | Figma 原型 iframe |
| `TokenTable` | 从 `tokens/tokens.json` 按 group 渲染表格 |
| `PlatformTabs` / `PlatformTab` | Android / iOS 代码 Tab（Client Component） |
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

- UI chrome token：`src/app/global.css` 中的 `--color-fd-*`（Fumadocs 文档站皮肤）
- 业务 Design Token：`tokens/tokens.json`（HyperOS 设计规范）
- 站点名与 nav：[src/lib/shared.ts](src/lib/shared.ts)、[src/lib/layout.shared.tsx](src/lib/layout.shared.tsx)

两者不要混用。

## Figma 集成

- Embed API：https://developers.figma.com/docs/embeds/embed-figma-file/
- 无 `fileKey` 时组件显示占位提示（预期行为）
- 配置说明页：[content/docs/resources/figma-library.mdx](content/docs/resources/figma-library.mdx)
- Code Connect（Dev Mode）尚未在本仓实现，计划在 Phase 3 试点

## 代码风格

- TypeScript strict mode
- 使用 `@/` 路径别名（映射 `src/`）
- MDX 内容默认 **中文**；URL 不硬编码 locale 前缀
- 遵循现有 Fumadocs 约定，不引入与文档站无关的抽象层
- 注释仅解释非显而易见的业务或集成逻辑

## 验证清单

提交改动前：

- [ ] `npm run build` 成功
- [ ] 新页面已在 `meta.json` 注册
- [ ] 未破坏 `docs/v1/` 工程设计文档
- [ ] 未添加 Storybook / Web 组件 playground
- [ ] Figma embed 使用占位或有效 `fileKey`

## 路线图（Agent 勿提前实现）

以下属于后续 Phase，除非用户明确要求，否则不要主动实现：

- **Phase 2**：TinaCMS `/admin` 可视化编辑
- **Phase 3**：Tokens Studio + Style Dictionary CI、Figma Code Connect

当前状态见 [docs/v1/roadmap.md](docs/v1/roadmap.md)。

## 相关文档

- [README.md](README.md) — 快速上手
- [docs/index.md](docs/index.md) — 工程设计文档索引
- [docs/v1/technical-design.md](docs/v1/technical-design.md) — V1 技术方案
- [docs/v1/information-architecture.md](docs/v1/information-architecture.md) — 站点 IA
- [docs/v1/roadmap.md](docs/v1/roadmap.md) — 实施进度
- [Fumadocs 官方文档](https://www.fumadocs.dev)
