# PillNav Specification

## Overview
- **Target file:** `src/components/home/PillNav.tsx`
- **Screenshot:** `docs/design-references/build.delphi.ai/desktop-viewport.png`
- **Interaction model:** click-driven + hover

## DOM Structure
```
div.fixed.inset-x-0.top-4.z-40.flex.justify-center.px-4.pointer-events-none
  nav[aria-label].pointer-events-auto.flex.items-center.gap-0.5.rounded-full.p-1.5
    a[Home logo] size-9 rounded-full
    a[link] h-9 px-3 text-sm font-medium × N
```

## Computed Styles
- Wrapper: top 16px, z-index 40, flex center, px 16px
- Nav: height 48px, padding 6px, gap 2px, border-radius full
- Nav bg (dark): oklab ~ sand-4 at 60% opacity + backdrop-blur 8px
- Link text: 14px / 20px, weight 500, color mid `#b5b3ad`
- Logo control: 36×36, icon 20×20

## States
- Logo hover: opacity 1 → 0.7, 150ms
- Link hover: color mid → high `#eeeeec`, 150ms

## HyperOS content
- Logo → HyperOS mark / home
- Links: 文档 · Foundations · Components · Figma
