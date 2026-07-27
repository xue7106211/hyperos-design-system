# ResourceHero Specification

## Overview
- **Target file:** `src/components/resources/ResourceHero.tsx`
- **Screenshot:** `docs/design-references/aiforui.dev/desktop-1440-viewport.png`
- **Interaction model:** static
- **Source pattern:** aiforui H1 + subtitle

## DOM Structure
```
header
  h1 — page title
  p — short supporting line
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

## Text Content (HyperOS)
- Title: 设计资源
- Subtitle: HyperOS 设计与工程可复用资产入口——组件库、工具、Token、图标等

## Responsive Behavior
- Desktop: 48/52 title
- Mobile: 40/44 title, full-width subtitle
