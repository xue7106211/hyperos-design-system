# HomeHero Specification

## Overview
- **Target file:** `src/components/home/HomeHero.tsx`
- **Screenshot:** `docs/design-references/build.delphi.ai/desktop-viewport.png`
- **Interaction model:** time-driven reveal + click links

## DOM
```
main.relative.grid.min-h-dvh.place-items-center.px-6
  HalftoneBloom
  div.relative.z-10.flex.flex-col.items-center.gap-6.text-center
    Logo (HyperOS wordmark, ~h-8–10)
    p.max-w-lg.text-2xl.font-medium.tracking-wide
      span.reveal-item × words / inline links
```

## Computed Styles
- Main: min-height 100dvh, padding-x 24px, grid center
- Content gap: 24px
- Paragraph: 24px / 32px, weight 500, letter-spacing 0.6px, color mid `#b5b3ad`, max-width 512px
- Inline links: color high `#eeeeec`, hover accent
- Inline icons in links: 24px, scale 0.85, margin-right 6px

## HyperOS copy (Chinese)
了解 HyperOS 设计规范，并探索我们的设计系统 — with linked phrases to docs routes.
