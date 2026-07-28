# Adaptation notes — aiforui.dev → HyperOS `/resources`

## Scope

视觉与分区拓扑参考 [aiforui.dev](https://aiforui.dev/)，内容换成 HyperOS 设计资源；**不是**课程站 1:1 功能克隆。

实现入口：

- 路由：`src/app/resources/`（`page.tsx`、`resources.css`、`layout.tsx`）
- 数据：`src/lib/resources.ts`（`resourcesPage` / Catalog / Featured / Tools / Topics / `resourcesPageAnchors`）
- 组件：`src/components/resources/`
- 配图：`public/resources/`

## Section mapping（当前实现）

| aiforui section | HyperOS `/resources` |
|-----------------|----------------------|
| Hero H1 / subtitle | `ResourceHero`（标题词级 reveal）+ 维护团队胶囊（`taughtBy*`；`taughtByHref` 为空则不可点） |
| Long-form / thesis | `ResourcesRule`（质量标准高亮） |
| Skills card (Design / Engineering) | `ResourcesCatalog`（`id="catalog"`）双栏；Design 条目 → 页内锚点 |
| Sonner / Vaul feature cards | `ResourcesFeatured` + `ResourcesFeatureCard`（OS4 / OS3 / AI） |
| Tools / topics clusters | `ResourcesTools`、`ResourcesTopics`（Token / Fonts / Icon / Brand 等） |
| Footer | `ResourcesFooter` |
| Fixed enroll bar / Buy card / FAQ | **未移植**（已明确不做） |

### Catalog → 页内锚点

| Catalog（Design） | Anchor |
|-------------------|--------|
| （Catalog 分区自身） | `#catalog` |
| OS4 Figma Library | `#components` |
| Design Tools | `#design-tools` |
| Design Token | `#design-token` |
| Fonts | `#fonts` |
| ICON | `#icon` |
| Brand | `#brand` |

Engineering 栏（MIUIX Flutter / Java、`Auto_Design_Agent`、`AI Design System`）仍为 `href === '#'` 占位，列表展示「即将上线」。分区使用 `ResourcesSplitSection`；`scroll-margin-top` 避开 PillNav。

右侧固定 **Codex 锚点导航**（`ResourcesCodexNav`，≥1200px）：条目来自 `resourcesPageAnchors`（含 Catalog），滚动 spy + hover 预览。

## Effects implemented

- Page tokens（`gray-*` / `foreground-*`）与十字网格（`ResourcesGridCrosses`）
- Split layout（左文案 / 右面板）+ 内容区约 1000px
- Feature 卡：标题 CTA + 可选媒体热区（非整卡 `<a>`）；描述可选中；待定态「即将上线」；`useResourcesScrollReveal` 入场
- MatrixRain 背景、回到顶部（`ResourcesBackToTop`，含 safe-area）
- PillNav「设计资源」→ `/resources`；当前页短圆角底线选中态（`aria-current` / `.is-active`）

## Not cloned（课程站专用）

- Polar checkout / 价格倒计时
- Live Sonner toast / Vaul drawer demos
- Company logo wall
- Enroll bar、Buy card、FAQ accordion
- aiforui 营销文案 / 头像

## Content source

[`src/lib/resources.ts`](../../../src/lib/resources.ts)：

- Design Catalog / Device Assets / Fonts / Brand Guidelines 等已填真实外链或页内锚点
- `href === '#'`（常量 `TBD`）仅表示 **Engineering 目录项** 等仍待补充
- 维护团队落地页：`taughtByHref: ''` 暂禁用；有路径后即可恢复链接
