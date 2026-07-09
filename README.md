# HyperOS Design System

HyperOS 移动端客户端组件库的设计系统文档站，基于 [Fumadocs](https://www.fumadocs.dev) + Next.js 构建。

## 特性

- 移动端组件规范文档（无 Web 交互 demo）
- Figma 设计稿 / Dev Mode / 原型 iframe 嵌入
- Design Token 表格展示（W3C DTCG）
- Android / iOS 静态代码参考（Compose / SwiftUI）
- 全文搜索、明暗主题切换
- LLM 友好导出（`/llms.txt`、`/llms-full.txt`）
- TinaCMS 后台（`/admin`）录入规范，支持 Figma / Token / 代码 block

## 开发

包管理器：**npm**（锁文件：`package-lock.json`；`.npmrc` 启用 `legacy-peer-deps`）

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) · CMS 后台 [http://localhost:3000/admin](http://localhost:3000/admin)

复制 `.env.example` 为 `.env` 后启动（TinaCMS 本地模式需要 `TINA_PUBLIC_IS_LOCAL=true`）。

## 构建与检查

```bash
npm run build        # tinacms build + 生产构建
npm run start        # 启动生产服务
npm run types:check  # MDX 生成 + TypeScript 检查
```

## 目录结构

```text
content/docs/        # 网站 MDX 文档（对外）
docs/                # 工程设计文档（对内，见 docs/index.md）
tokens/tokens.json   # Design Tokens（W3C DTCG）
tina/                # TinaCMS schema 与 block 模板
.env.example         # TinaCMS 本地模式环境变量模板
src/
  app/               # Next.js 路由（docs、admin、api/tina、search、llms、og）
  components/
    mdx/             # 自定义 MDX 组件
    tina/            # Tina Visual Editing
    HyperOSLogo.tsx  # 站点 Logo
  lib/               # source、layout、tina-docs、cn
public/
  logo/              # HyperOS Logo 静态资源
  uploads/           # TinaCMS 媒体上传（本地模式）
source.config.ts     # MDX frontmatter schema
next.config.mjs      # Next.js + fumadocs-mdx 配置
proxy.ts             # Markdown 内容协商
AGENTS.md            # Agent / 协作者指引（权威）
CLAUDE.md            # 指向 AGENTS.md
```

## 新增组件文档

1. 在 `content/docs/components/` 下创建 `.mdx` 文件
2. 在对应目录的 `meta.json` 中注册页面
3. 使用 `<FigmaEmbed />`、`<TokenTable />`、`<PlatformTabs />`、`<PlatformCodeBlock />` 等组件（亦可通过 `/admin` 插入 block）

参考模板：[content/docs/components/actions/button.mdx](content/docs/components/actions/button.mdx)

### Figma Embed 示例

```mdx
<FigmaEmbed fileKey="YOUR_FILE_KEY" nodeId="1234:5678" height={480} />
<FigmaEmbed fileKey="YOUR_FILE_KEY" nodeId="1234:5678" mode="dev" height={480} />
```

### Token 表示例

```mdx
<TokenTable groups={["color.action", "spacing.button"]} />
```

## 文档

| 文档 | 说明 |
|------|------|
| [AGENTS.md](AGENTS.md) | Agent 工作约定与验证清单（权威） |
| [CLAUDE.md](CLAUDE.md) | Claude 入口，指向 AGENTS.md |
| [docs/index.md](docs/index.md) | 工程设计文档索引 |
| [docs/v1/technical-design.md](docs/v1/technical-design.md) | V1 技术方案 |
| [docs/v1/information-architecture.md](docs/v1/information-architecture.md) | 站点 IA |
| [docs/v1/roadmap.md](docs/v1/roadmap.md) | 实施进度 |
