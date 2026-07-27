# Adaptation notes — aiforui.dev → HyperOS `/resources`

## Scope

视觉与分区拓扑参考 [aiforui.dev](https://aiforui.dev/)，内容换成 HyperOS 设计资源；**不是**课程站 1:1 功能克隆。

实现入口：

- 路由：`src/app/resources/`
- 数据：`src/lib/resources.ts`
- 组件：`src/components/resources/`
- 样式：`src/app/resources/resources.css`
- 配图：`public/resources/`

## Section mapping（当前实现）

| aiforui section | HyperOS `/resources` |
|-----------------|----------------------|
| Hero H1 / subtitle | `ResourceHero` + 维护团队文案 |
| Long-form / thesis | `ResourcesRule`（质量标准高亮） |
| Skills card (Design / Engineering) | `ResourcesCatalog` 双栏；Design 条目 → 页内锚点 |
| Sonner / Vaul feature cards | `ResourcesFeatured` + `ResourcesFeatureCard`（OS4 / OS3 / AI） |
| Tools / topics clusters | `ResourcesTools`、`ResourcesTopics`（Token / Fonts / Icon / Brand 等） |
| Footer | `ResourcesFooter` |
| Fixed enroll bar / Buy card / FAQ | **未移植**（已明确不做） |

### Catalog → 页内锚点

| Catalog（Design） | Anchor |
|-------------------|--------|
| OS4 Figma Library | `#components` |
| Design Tools | `#design-tools` |
| Design Token | `#design-token` |
| Fonts | `#fonts` |
| ICON | `#icon` |
| Brand | `#brand` |

Engineering（MIUIX 等）仍为占位 `#`。分区使用 `ResourcesSplitSection`；`scroll-margin-top` 避开 PillNav。

## Effects implemented

- Page tokens（`gray-*` / `foreground-*`）与十字网格（`ResourcesGridCrosses`）
- Split layout（左文案 / 右面板）+ 内容区约 1000px
- Feature 卡：双行 meta、hover `ArrowUpRight`、宽卡 full-bleed 图、堆叠卡 divider 十字
- MatrixRain 背景、回到顶部（`ResourcesBackToTop`）
- PillNav「设计资源」→ `/resources`

## Not cloned（课程站专用）

- Polar checkout / 价格倒计时
- Live Sonner toast / Vaul drawer demos
- Company logo wall
- Enroll bar、Buy card、FAQ accordion
- aiforui 营销文案 / 头像

## Content source

[`src/lib/resources.ts`](../../../src/lib/resources.ts) — `href === '#'` 表示链接待补充（如 Device Assets、Engineering 目录项）。
