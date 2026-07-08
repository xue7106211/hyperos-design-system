# HyperOS Design System

HyperOS 移动端客户端组件库的设计系统文档站，基于 [Fumadocs](https://www.fumadocs.dev) + Next.js 构建。

## 特性

- 移动端组件规范文档（无 Web 交互 demo）
- Figma 设计稿 / 原型 iframe 嵌入
- Design Token 表格展示（W3C DTCG）
- Android / iOS 静态代码参考（Compose / SwiftUI）

## 开发

包管理器：**npm**（锁文件：`package-lock.json`）

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 构建与检查

```bash
npm run build        # 生产构建
npm run start        # 启动生产服务
npm run types:check  # MDX 生成 + TypeScript 检查
```

## 目录结构

```text
content/docs/        # 网站 MDX 文档（对外）
docs/                # 工程设计文档（对内，见 docs/index.md）
tokens/tokens.json   # Design Tokens（W3C DTCG）
src/
  app/               # Next.js 路由与布局
  components/mdx/    # 自定义 MDX 组件
  lib/               # source loader、layout 配置
source.config.ts     # MDX frontmatter schema
AGENTS.md            # Agent / 协作者指引
```

## 新增组件文档

1. 在 `content/docs/components/` 下创建 `.mdx` 文件
2. 在对应目录的 `meta.json` 中注册页面
3. 使用 `<FigmaEmbed />`、`<TokenTable />`、`<PlatformTabs />` 等组件

参考模板：[content/docs/components/actions/button.mdx](content/docs/components/actions/button.mdx)

### Figma Embed 示例

```mdx
<FigmaEmbed fileKey="YOUR_FILE_KEY" nodeId="1234:5678" height={480} />
```

### Token 表示例

```mdx
<TokenTable groups={["color.action", "spacing.button"]} />
```

## 文档

| 文档 | 说明 |
|------|------|
| [AGENTS.md](AGENTS.md) | Agent 工作约定与验证清单 |
| [docs/index.md](docs/index.md) | 工程设计文档索引 |
| [docs/v1/technical-design.md](docs/v1/technical-design.md) | V1 技术方案 |
| [docs/v1/information-architecture.md](docs/v1/information-architecture.md) | 站点 IA |
| [docs/v1/roadmap.md](docs/v1/roadmap.md) | 实施进度 |
