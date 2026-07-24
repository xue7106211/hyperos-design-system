# HyperOS Design System

HyperOS 移动端客户端组件库的设计系统文档站，基于 [Fumadocs](https://www.fumadocs.dev) + Next.js 构建。

## 特性

- 移动端组件规范文档（无 Web 交互 demo）
- Figma 设计稿 / Dev Mode / 原型 iframe 嵌入
- Design Token 表格展示（OS4 Reference / Semantic / Component × Light / Dark）
- 图标库预览（分类 / 搜索 / 深浅色 / 复制名称与 SVG）
- 文档配图页内画廊（Fancybox；同页前后切换）
- Android / iOS 静态代码参考（Compose / SwiftUI）
- 全文搜索、明暗主题切换
- LLM 友好导出（`/llms.txt`、`/llms-full.txt`）
- TinaCMS 后台（`/admin`）录入规范，支持 Figma / Token / 图标 / 代码 block
- OS 版本切换（HyperOS 4 / 5；侧边栏 `DocsVersionSwitcher`，当前默认 OS4）

## 开发

包管理器：**npm**（锁文件：`package-lock.json`；`.npmrc` 启用 `legacy-peer-deps`）

```bash
npm install
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) · CMS 后台 [http://localhost:3000/admin](http://localhost:3000/admin)

`npm run dev` 已设置 TinaCMS 本地模式所需的 `TINA_PUBLIC_IS_LOCAL=true`；`.env.example` 仅供自定义启动命令时参考。

## 构建与检查

```bash
npm run build        # tinacms build + 生产构建
npm run tina:build   # 只跑 tinacms build（改 tina schema 后刷新 __generated__）
npm run start        # 启动生产服务
npm run types:check  # MDX 生成 + TypeScript 检查
npm run icons:sync   # 扫描 icons/svg → manifest + public/icons
npm run icons:import -- /path/to/svgs  # 扁平 SVG 导入并 sync
npm run tokens:import -- /path/to/OS4Token  # Figma Variables 导出 → tokens/*.{light,dark}.json
```

生产 Docker 构建只跑 `npx next build`（不跑 `tinacms build`）。部署流程（MiFlow / Matrix、分支与环境）见 [docs/deployment.md](docs/deployment.md)；镜像定义见根目录 `Dockerfile`。

## 目录结构

```text
content/docs/        # 网站 MDX 文档（对外）
  os4/               # HyperOS 4 规范（当前默认，/docs → /docs/os4）
    general/         # 通用设计标准
    components/      # 控件与组件
    interaction/     # 人机交互标准
    system/          # 系统特性与能力标准
    multi-device/     # 多端设备标准
    best-practices/  # 应用最佳实践标准
    resources/       # 资源（HyperOS 图标库等）
  os5/               # HyperOS 5 占位（侧栏可见，内容未发布；结构同 os4）
docs/                # 工程设计文档（对内，见 docs/index.md）
  index.md
  deployment.md
  technical-design.md
  information-architecture.md
  sidebar-ia.md
  roadmap.md
  maintainers.md
icons/               # 图标源 SVG + manifest（见 icons/README.md）
  svg/{category}/
  manifest.json
scripts/             # 仓库脚本（generate-icon-manifest.mjs、import-os4-tokens.mjs）
tokens/              # Design Tokens（reference / semantic / component × light / dark）
tina/                # TinaCMS schema 与 block 模板
  __generated__/     # tinacms build 产物（已提交仓库，供生产 next build）
.env.example         # TinaCMS 本地模式环境变量模板
src/
  app/               # Next.js 路由（docs、admin、api/tina、search、llms、og）
  components/
    docs/            # DocsVersionSwitcher、FigmaJumpButton、DocMeta
    home/            # Landing：HomeHero、PillNav、HalftoneBloom
    mdx/             # 自定义 MDX 组件（DocsImage、DocFancybox、SpecImageGrid、IconGallery 等）
    tina/            # Tina Visual Editing
    HyperOSLogo.tsx  # 站点 Logo
  lib/               # source、layout、shared、icons、tina-docs、docs-version-tabs、git-file-mtime、cn
public/
  logo/              # HyperOS Logo 静态资源
  home/              # Landing 页静态图
  icons/             # 图标静态访问（由 icons:sync 生成，含 manifest.json）
  media/             # 规范配图（已提交；MDX 用 /media/...）
  uploads/           # TinaCMS 媒体上传（本地模式；gitignore）
source.config.ts     # MDX frontmatter schema
next.config.mjs      # Next.js + fumadocs-mdx；/docs 重定向与旧路径兼容
proxy.ts             # Markdown 内容协商
.npmrc               # legacy-peer-deps（TinaCMS 依赖兼容）
Dockerfile           # 生产镜像（MiFlow 构建 / Matrix 运行；builder 保留 .git）
package-lock.json    # npm 锁文件
AGENTS.md            # Agent / 协作者指引（权威，保持精简）
CLAUDE.md            # 指向 AGENTS.md
```

## 新增组件文档

1. 在 `content/docs/os4/components/`（或对应 OS 版本目录）下创建 `.mdx` 文件
2. 在对应目录的 `meta.json` 中注册页面
3. 使用 `<FigmaEmbed />`、`<TokenTable />`、`<IconGallery />`、`<SpecImageGrid />`、`<PlatformTabs />`、`<PlatformCodeBlock />` 等组件（亦可通过 `/admin` 插入已支持的 block）
4. 规范配图放入 `public/media/...`，MDX 写 `![说明](/media/...)`（自动进入 Fancybox 画廊；勿用 `public/uploads/` 或 `public/docs/`）

参考模板：[content/docs/os4/components/actions/button.mdx](content/docs/os4/components/actions/button.mdx) · 含多图示例：[containers/drawer.mdx](content/docs/os4/components/containers/drawer.mdx)

> `/docs` 默认进入 OS4；旧路径（如 `/docs/foundations/...`、`/docs/os4/foundations/...`）会 301 到新 IA（见 `next.config.mjs`）。图标页：`/docs/os4/resources/icons`（旧路径 `icons`、`foundations/iconography`、`general/icons` 会重定向至此）。

### Figma Embed 示例

```mdx
<FigmaEmbed fileKey="YOUR_FILE_KEY" nodeId="1234:5678" height={480} />
<FigmaEmbed fileKey="YOUR_FILE_KEY" nodeId="1234:5678" mode="dev" height={480} />
```

### Token 表示例

```mdx
<TokenTable groups={["semantic.fill.brand", "component.navigation"]} />
```

### 图标预览示例

```mdx
<IconGallery />
<IconGallery categories={["navigation", "action"]} />
```

图标入库约定见 [icons/README.md](icons/README.md)；预览页：[`/docs/os4/resources/icons`](content/docs/os4/resources/icons.mdx)。

## 文档

| 文档 | 说明 |
|------|------|
| [AGENTS.md](AGENTS.md) | Agent 工作约定与验证清单（权威，精简） |
| [CLAUDE.md](CLAUDE.md) | Claude 入口，指向 AGENTS.md |
| [docs/index.md](docs/index.md) | 工程设计文档索引 |
| [docs/deployment.md](docs/deployment.md) | MiFlow / Matrix 部署与卡点 |
| [docs/technical-design.md](docs/technical-design.md) | 技术方案 |
| [docs/information-architecture.md](docs/information-architecture.md) | 站点 IA |
| [docs/sidebar-ia.md](docs/sidebar-ia.md) | 侧栏目录对照（全景图） |
| [docs/roadmap.md](docs/roadmap.md) | 实施进度 |
| [docs/maintainers.md](docs/maintainers.md) | 维护人飞书 open_id 备忘 |
| [icons/README.md](icons/README.md) | 图标 SVG 入库与 `icons:sync` 约定 |
