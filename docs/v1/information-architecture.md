# HyperOS Design System 文档站 — V1 信息架构

> **版本**：V1.1  
> **日期**：2026-07-09  
> **关联**：[技术设计方案](./technical-design.md)

---

## 1. 导航原则

- **Foundation 优先**：先建立 Token / 原则共识，再进入组件细节。
- **按用途分类组件**：Actions、Inputs、Feedback 等，而非按 Figma 文件结构平铺。
- **Patterns 独立**：页面级模式与原子组件分离，避免组件目录膨胀。
- **Resources 收口**：Figma 库、Changelog、迁移指南集中入口。
- **OS 版本分层**：HyperOS 4 / 5 作为顶层 Tab；各版本下复用 Foundations → Components → Patterns → Resources 结构。

---

## 2. 站点地图

```text
/  (Landing)
└── /docs                    # → 重定向 /docs/os4
    ├── os4/                 # HyperOS 4（当前默认）
    │   ├── index            # DS 首页：简介、快速链接、更新动态
    │   ├── foundations/
    │   ├── components/
    │   ├── patterns/
    │   └── resources/
    └── os5/                 # HyperOS 5（占位；侧栏可见，/docs/os5 暂重定向 os4）
        ├── index
        ├── foundations/
        ├── components/
        ├── patterns/
        └── resources/
```

各版本内 **Foundations → Components → Patterns → Resources** 子结构一致，示例（以 `os4` 为准）：

```text
/docs/os4
    ├── index
    │
    ├── foundations/                   # 基础
    │   ├── index
    │   ├── principles
    │   ├── colors
    │   ├── typography
    │   ├── spacing
    │   ├── elevation
    │   ├── motion
    │   ├── iconography
    │   └── accessibility
    │
    ├── components/                    # 组件
    │   ├── index
    │   ├── actions/                   # button, icon-button, floating-action-button
    │   ├── inputs/
    │   ├── navigation/
    │   ├── feedback/
    │   └── display/
    │
    ├── patterns/
    │   ├── index
    │   ├── settings-page
    │   ├── list-detail
    │   ├── onboarding
    │   └── empty-states
    │
    └── resources/
        ├── figma-library
        ├── design-tokens
        ├── changelog
        └── migration-guides
```

> **Phase 0–1 状态**：`os4` 完整 IA 骨架与占位页已创建；[§7 MVP 最小页面集](#7-v1-mvp-最小页面集) 以 OS4 路径验收。`os5` 目录骨架已建，内容待发布。

---

## 3. 路由与文件映射

Fumadocs MDX 按文件路径生成 URL。根级 `content/docs/meta.json` 注册 OS 版本 Tab：

```json
{ "title": "文档", "pages": ["os4", "os5"] }
```

| 文件路径 | URL |
|----------|-----|
| `content/docs/os4/index.mdx` | `/docs/os4` |
| `content/docs/os4/foundations/colors.mdx` | `/docs/os4/foundations/colors` |
| `content/docs/os4/components/actions/button.mdx` | `/docs/os4/components/actions/button` |

**重定向**（`next.config.mjs`）：

| 请求路径 | 目标 |
|----------|------|
| `/docs` | `/docs/os4`（临时） |
| `/docs/os5`、`/docs/os5/*` | `/docs/os4`（临时，待 OS5 发布） |
| `/docs/foundations/*` 等旧路径 | `/docs/os4/foundations/*`（永久 301） |

Sidebar 通过各目录 `meta.json` 控制顺序与分组：

```text
content/docs/os4/components/actions/
├── meta.json
├── button.mdx
└── icon-button.mdx
```

`meta.json` 示例：

```json
{
  "title": "Actions",
  "pages": ["button", "icon-button", "floating-action-button"]
}
```

---

## 4. 页面类型规范

### 4.1 Landing（`/docs/os4`）

| 区块 | 内容 |
|------|------|
| Hero | HyperOS DS 一句话定位 + CTA（进入 Foundations / Figma 库） |
| 快速入口 | Colors · Button · Figma Library |
| 最近更新 | Changelog 摘要（V1 可静态） |

侧边栏顶部 **DocsVersionSwitcher** 切换 HyperOS 4 / 5（OS5 当前禁用）。

### 4.2 Foundation 页

| 区块 | MDX 组件 |
|------|----------|
| 说明正文 | 默认 MDX |
| Token 可视化 | `<TokenTable groups={[...]} />` |
| 可选 Figma 参考 | `<FigmaEmbed />` |

### 4.3 Component 页

| 区块 | 来源 |
|------|------|
| Meta（status、platforms） | frontmatter |
| 设计稿 | `<FigmaEmbed fileKey nodeId />` |
| 交互演示（可选） | `<FigmaPrototypeEmbed url />` |
| Token | `<TokenTable groups={frontmatter.tokenGroups} />` |
| 平台代码 | `<PlatformTabs>` |
| 用法 / Do-Don't | MDX + `<DosDonts />`（亦可通过 `/admin` 插入 block） |

### 4.4 Pattern 页

| 区块 | 说明 |
|------|------|
| 场景描述 | 何时使用该模式 |
| Figma 整页 embed | 通常 embed 整帧或原型 |
| 关联组件 | 链接到用到的组件文档 |
| 变体 | 列表页 / 空状态等变体说明 |

### 4.5 Resource 页

| 页面 | 内容 |
|------|------|
| figma-library | 主库 embed + 分支库链接 + 使用说明 |
| design-tokens | Token 文件结构、命名约定、CI 说明 |
| changelog | 按版本列出 DS 变更 |
| migration-guides | 跨版本升级指南 |

---

## 5. 多语言（V1 预留）

| Locale | 路径前缀 | 说明 |
|--------|----------|------|
| `zh` | `/zh/docs/...` | 默认语言 |
| `en` | `/en/docs/...` | 英文 |

Fumadocs i18n 配置见 [技术设计方案 §3.6](./technical-design.md#36-搜索国际化部署)。

V1 可先 **仅中文**，目录结构与 i18n config 预留英文。

---

## 6. 搜索索引范围

| 纳入索引 | 不纳入 |
|----------|--------|
| 所有 `/docs` MDX 页面 title + description | `/admin`（TinaCMS 后台，不纳入文档搜索） |
| Foundation / Component / Pattern 正文 headings | 内部 draft（若 CI 排除） |

---

## 7. V1 MVP 最小页面集

用于第一期验收的最小集合：

| # | 页面 | 目的 |
|---|------|------|
| 1 | `/docs/os4` | 验证 Landing + 导航 + 版本切换器 |
| 2 | `/docs/os4/foundations/colors` | 验证 TokenTable |
| 3 | `/docs/os4/components/actions/button` | 验证完整组件页模板 |
| 4 | `/docs/os4/resources/figma-library` | 验证 Figma embed + 外链 |
| 5 | `/docs/os4/resources/changelog` | 验证 Changelog 页面与版本记录 |
