# MatrixRain Specification

## Overview
- **Target file:** `src/components/resources/MatrixRain.tsx`
- **Source:** aiforui.dev exported `MatrixRain` (chunk `a5558b3bbe33f862.js`)
- **Screenshot:** `docs/design-references/aiforui.dev/clone-matrix-rain.png`
- **Interaction model:** time-driven + pointer glow

## DOM Structure
```
div.resources-matrix-wrap[aria-hidden]
  canvas.resources-matrix-canvas (1200×400 CSS, 2× DPR backing store)
```

## Key parameters (from source)
- Charset: `AISDPEL01<>=+*-#$`
- Font: `12px` mono, color `rgb(94, 177, 239)` (`text-blue-800`)
- Opacity: `0.6` light / `0.5` dark
- Column width: `1.7 * measureText("0")`
- Rows: `25`, row height `16px`
- Frame throttle: ~90ms
- Glow color: `--color-blue-900` (`#0090ff`)
- Mask: bottom fade + horizontal soft edges (`mask-composite: intersect`)
- Pointer glow radius: 44px
- `prefers-reduced-motion: reduce` → static draw only
