# ResourceHero Specification

## Overview
- **Target file:** `src/components/resources/ResourceHero.tsx`
- **Data:** `resourcesPage`（`src/lib/resources.ts`）
- **Screenshot:** `docs/design-references/aiforui.dev/desktop-1440-viewport.png`
- **Interaction model:** 静态文案 + 可选维护团队链接；标题按词 `resources-reveal-item` 入场
- **Source pattern:** aiforui H1 + subtitle（文案与结构已 HyperOS 化）

## DOM Structure
```
header.resources-hero
  h1.resources-h1 — resourcesPage.title（按词 wrap + reveal）
  p.resources-hero-sub — resourcesPage.description
  .resources-taught-by
    .resources-taught-by-pill [--static]
      .resources-taught-by-label
      Link | .resources-taught-by-name
```

## Computed Styles (exact from aiforui H1 / subtitle)

### h1
- fontSize: 48px (md) / 40px (base)
- lineHeight: 52px / 44px
- fontWeight: 575
- letterSpacing: -1.2px
- color: rgb(0, 0, 0)
- textAlign: center
- marginTop: ~80–120px under PillNav (adapted; aiforui used 264px without fixed nav)

### subtitle
- fontSize: 20px (md) / 18px
- lineHeight: 28px
- fontWeight: 400
- color: rgb(64, 64, 64)
- textAlign: center
- maxWidth: 540px
- margin: 24px auto 0

## Text Content (HyperOS，以 `resources.ts` 为准)

- Title: `HyperOS Design Resources`
- Subtitle: `使用 HyperOS 官方设计模板、图标制作模板、色彩指南以及其他资源，快速精准地设计 App。`
- Taught-by: 标签 `维护团队` · 名称 `HyperOS 设计系统` · `taughtByHref` 为空时胶囊不可点（`--static`）

## Responsive Behavior
- Desktop: 48/52 title
- Mobile: 40/44 title, full-width subtitle
