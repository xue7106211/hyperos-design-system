# ResourcesFeatureCard Specification

## Overview
- **Target file:** `src/components/resources/ResourcesFeatureCard.tsx`
- **Also:** `ResourcesFeatureCardGrid`（同文件；布局 `hero` | `stack`）
- **Used by:** `ResourcesFeatured`、`ResourcesTools`、`ResourcesTopics`
- **Screenshot reference:** aiforui project cards region（Sonner / Vaul）— 视觉参考，DOM/类名已 HyperOS 化
- **Interaction model:** 非整卡链接。标题行走 `FeatureCta`（键盘可聚焦）；预览区可选 `FeatureMediaLink`（`tabIndex={-1}`，避免重复 tab）。`href === '#'` 或空为待定态（「即将上线」，无链接）

## DOM Structure（概念）
```
article.resources-feature-card [--wide] [--media] [--pending]
  [.resources-feature-row-crosses]          # wide 卡底部分隔十字
  [.resources-feature-divider-crosses]      # stack 非首卡横线十字
  .resources-feature-preview
    [a.resources-feature-media-link] Image | .resources-feature-pill
  .resources-feature-meta
    a.resources-feature-cta | .resources-feature-cta--static
      .resources-feature-title
      [ArrowUpRight | .resources-feature-status]
    .resources-feature-desc                 # 可选中文本，非链接
```

## Props（实现为准）

| Prop | 用途 |
|------|------|
| `title` / `description` / `href` | 双行 meta + 链接目标 |
| `external` | 外链 |
| `image` (+ width/height) | 配图 |
| `pill` | 无图时占位文案 |
| `wide` | Components 通栏首卡 |
| `media` | 高度随图；宽卡默认倾向 media |
| `dividerCrosses` | 堆叠卡顶部分隔十字 |

## Styles（摘要）

- 容器类：`resources-feature-card`（样式在 `resources.css`）
- 描述色：`var(--color-gray-900)`（深色模式见同文件 token）
- Hover：标题 CTA 右上角 `ArrowUpRight`
- 宽卡：full-bleed 图 + 底部分隔行十字
- 非 media 半宽卡：固定预览高度（cover）
- 入场：`useResourcesScrollReveal`（与 Catalog 共用）

## Grid wrapper

- `ResourcesFeatureCardGrid`：`hero`（宽首卡 + 半宽行）或 `stack`（单列堆叠）
- 帧角十字由 grid / section 负责；stack 中部十字用高优先级规则隐藏，避免与 Catalog 冲突

## Responsive Behavior
- Desktop：hero 首行通栏，其后两列或 stack 单列（视 section）
- Mobile：单列堆叠
