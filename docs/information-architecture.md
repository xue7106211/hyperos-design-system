# HyperOS Design System 文档站 — V1 信息架构

> **版本**：V1.3  
> **日期**：2026-07-10  
> **关联**：[技术设计方案](./technical-design.md) · [侧栏对照](./sidebar-ia.md)

---

## 1. 导航原则

- **通用设计优先**：先建立理念 / 原则 / Token 共识，再进入组件细节。
- **按用途分类组件**：导航搜索、菜单和操作、选择和输入、容器类、展示类。
- **系统能力独立**：搜索、编辑、加载等系统特性与原子组件分离。
- **人机交互独立**：硬件、手势、键鼠等输入方式单独成章。
- **OS 版本分层**：HyperOS 4 / 5 作为顶层 Tab；各版本下复用同一套一级目录。
- **一级目录必有 Index**：每个一级模块以 `index` 作为总览页。

---

## 2. 站点地图

```text
/  (Landing)
└── /docs                    # → 重定向 /docs/os4
    ├── os4/                 # HyperOS 4（当前默认）
    │   ├── index            # HyperOS 4 Design System
    │   ├── general/         # 通用设计标准
    │   ├── components/      # 控件与组件
    │   ├── interaction/     # 人机交互标准
    │   ├── system/          # 系统特性与能力标准
    │   ├── multi-device/     # 多端设备标准
    │   └── best-practices/  # 应用最佳实践标准
    └── os5/                 # HyperOS 5（占位；侧栏可见，/docs/os5 暂重定向 os4）
        └── （结构同 os4）
```

`os4` 详细结构：

```text
/docs/os4
    ├── index                              # HyperOS 4 Design System
    │
    ├── general/                           # 通用设计标准
    │   ├── index
    │   ├── philosophy                     # 设计理念
    │   ├── principles                     # 设计原则
    │   ├── design-token                   # Design Token
    │   ├── icons                          # 图标预览
    │   ├── layout                         # 布局
    │   ├── motion                         # 动效
    │   ├── copywriting                    # 文案指南
    │   └── inclusive/                     # 包容性设计
    │       ├── accessibility
    │       └── i18n
    │
    ├── components/                        # 控件与组件
    │   ├── index
    │   ├── navigation/                    # 导航搜索
    │   ├── actions/                       # 菜单和操作
    │   ├── inputs/                        # 选择和输入
    │   ├── containers/                    # 容器类
    │   └── display/                       # 展示类
    │
    ├── interaction/                       # 人机交互标准
    ├── system/                            # 系统特性与能力标准
    ├── multi-device/                       # 多端设备标准（暂仅 index）
    └── best-practices/                    # 应用最佳实践标准（暂仅 index）
```

完整叶子页清单见 [sidebar-ia.md](./sidebar-ia.md)。

---

## 3. 路由与文件映射

Fumadocs MDX 按文件路径生成 URL。根级 `content/docs/meta.json` 注册 OS 版本 Tab：

```json
{ "title": "文档", "pages": ["os4", "os5"] }
```

| 文件路径 | URL |
|----------|-----|
| `content/docs/os4/index.mdx` | `/docs/os4` |
| `content/docs/os4/general/design-token.mdx` | `/docs/os4/general/design-token` |
| `content/docs/os4/general/icons.mdx` | `/docs/os4/general/icons` |
| `content/docs/os4/components/actions/button.mdx` | `/docs/os4/components/actions/button` |

**重定向**（`next.config.mjs`）：

| 请求路径 | 目标 |
|----------|------|
| `/docs` | `/docs/os4`（临时） |
| `/docs/os5`、`/docs/os5/*` | `/docs/os4`（临时，待 OS5 发布） |
| `/docs/foundations/*` 等旧无前缀路径 | 映射到新 `os4` 对应页（永久 301） |
| `/docs/os4/foundations/*`、`patterns/*`、`resources/*` | 映射到 `general` / `system` / `best-practices` 等 |

Sidebar 通过各目录 `meta.json` 控制顺序与分组。

---

## 4. 页面类型规范

### 4.1 Landing（`/docs/os4`）

| 区块 | 内容 |
|------|------|
| Hero | HyperOS DS 一句话定位 + CTA |
| 快速入口 | Design Token · Button · 通用设计 · 控件与组件 |
| 最近更新 | Changelog 摘要（V1 可静态） |

侧边栏顶部 **DocsVersionSwitcher** 切换 HyperOS 4 / 5（OS5 当前禁用）。

文档页标题下方操作栏：`Copy Markdown` · `Open` · **跳转 Figma**（`FigmaJumpButton`；页级 frontmatter 优先，否则 `defaultFigmaUrl`）。

### 4.2 通用设计页

| 区块 | MDX 组件 |
|------|----------|
| 说明正文 | 默认 MDX |
| Token 可视化 | `<TokenTable groups={[...]} />` |
| 图标预览 | `<IconGallery />`（见 `/docs/os4/general/icons`） |
| 可选 Figma 参考 | `<FigmaEmbed />` |

### 4.3 组件页

| 区块 | 来源 |
|------|------|
| Meta（status、platforms） | frontmatter |
| 设计稿 | `<FigmaEmbed fileKey nodeId />` |
| 交互演示（可选） | `<FigmaPrototypeEmbed url />` |
| Token | `<TokenTable groups={frontmatter.tokenGroups} />` |
| 平台代码 | `<PlatformTabs>` |
| Do / Don't | `<DosDonts />` |

### 4.4 模块 Index

每个一级目录的 `index.mdx` 提供该模块总览与子章节链接。

---

## 5. 旧路径对照（节选）

| 旧路径 | 新路径 |
|--------|--------|
| `/docs/os4/foundations/colors` | `/docs/os4/general/design-token` |
| `/docs/os4/foundations/iconography` | `/docs/os4/general/icons` |
| `/docs/foundations/iconography` | `/docs/os4/general/icons` |
| `/docs/os4/foundations/principles` | `/docs/os4/general/principles` |
| `/docs/os4/components/feedback/dialog` | `/docs/os4/components/containers/dialog` |
| `/docs/os4/components/navigation/bottom-nav` | `/docs/os4/components/navigation/bottom-navigation` |
| `/docs/os4/patterns/empty-states` | `/docs/os4/components/display/empty-state` |
| `/docs/os4/resources/design-tokens` | `/docs/os4/general/design-token` |
| `/docs/os4/resources/*` | `/docs/os4/best-practices` |
| `/docs/os4/general/overview` | `/docs/os4/general`（已移除「通用设计总览」） |

---

## 6. V1 MVP 最小页面集

| # | 路径 | 验收点 |
|---|------|--------|
| 1 | `/docs/os4` | 站点 Index 与快速入口 |
| 2 | `/docs/os4/general/design-token` | 验证 TokenTable |
| 3 | `/docs/os4/general/icons` | 验证 IconGallery |
| 4 | `/docs/os4/components/actions/button` | 验证完整组件页模板 |
| 5 | `/docs/os4/general` | 一级模块 Index |
| 6 | `/docs/os4/components` | 组件总览 |
