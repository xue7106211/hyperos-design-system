# HalftoneBloom Specification

## Overview
- **Target file:** `src/components/home/HalftoneBloom.tsx`
- **Screenshot:** `docs/design-references/build.delphi.ai/desktop-viewport.png`
- **Interaction model:** pointer-driven (canvas)

## DOM
```
canvas.aria-hidden.text-brand-accent.pointer-events-none.absolute.inset-x-0.bottom-0.h-[60vh].w-full
```

## Algorithm (from Delphi `HalftoneBloom`)
See BEHAVIORS.md. Port 1:1 with props defaults.

## Color
- `currentColor` from class `text-[oklch(0.74_0.2_42)]` or CSS var `--home-accent`
