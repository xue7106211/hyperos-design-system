# TypoHero Specification

## Overview
- **Target file:** `src/components/home/typotab/TypoHero.tsx`
- **Screenshot:** `docs/design-references/typotab.com/desktop-1440-viewport.png`
- **Interaction model:** time-driven (floating shapes, cloud drift, CTA shine) + static layout

## DOM Structure
```
section.typo-hero
  .typo-hero__bg (absolute gradient)
  .typo-hero__clouds (decorative imgs, absolute)
  .typo-hero__content (max 1000px, column, center, gap 36px)
    a.typo-badge (white pill)
    .typo-hero__text (gap 20px)
      h1 (2 lines)
      p.subtitle
    a.typo-cta (black pill + Apple icon + shine)
  .typo-hero__media (max 1000px)
    .typo-hero__frame (radius 12px, blue glow shadow)
      img hero-demo
```

## Computed Styles (exact)

### Section
- paddingTop: 80px
- display: flex; flex-direction: column; align-items: center; gap: 40px
- position: relative; overflow: visible
- min-height ~1154px desktop

### Background `.typo-hero__bg`
- position: absolute; inset: 0; z-index: 0; overflow: hidden
- background: linear-gradient(rgb(71, 114, 255) 0%, rgb(0, 172, 255) 50%, rgb(255, 255, 255) 85%)

### Content
- max-width: 1000px; width: 100%
- padding: 80px 20px 20px
- display: flex; flex-direction: column; align-items: center; gap: 36px
- z-index: 1

### Badge
- background: #fff; border-radius: 300px
- padding: 4px 12px 4px 4px; height ~30px
- display: flex; align-items: center; gap: 14px
- Text: "New Spring Update 🎉" + chevron; blue-ish label text (use #2B6BFF)

### H1
- font-family: Nunito variable
- font-size: 70px; line-height: 63px; letter-spacing: -2.8px
- color: #fff
- font-variation-settings: "wght" 1000
- text-align: center
- Two lines: "Write 10x Faster." / "Instantly, Anywhere."

### Subtitle
- Nunito; 22px / 33px; letter-spacing -0.88px; color #fff; max-width 480px; center
- font-variation-settings: "wght" ~660 (match section body)

### CTA
- background: #000; border-radius: 100px; padding: 18px 24px
- height ~58px; gap: 12px; color #fff
- label: SF Pro Rounded Medium / system-ui fallback, 18px / 21.6px
- shine: absolute white bar, mix-blend-mode soft-light, blur(5px), skewed — animate translateX

### Media frame
- max-width: 1000px; border-radius: 12px; overflow: hidden
- box-shadow: rgba(0, 56, 140, 0.46) 0px 21px 300px 0px
- image: `/typotab/images/hero-demo.png`

## States & Behaviors
- Floating decorative shapes: CSS keyframes translateY ±8px, rotate slight, 4–8s ease-in-out infinite
- Clouds: slow vertical drift
- CTA shine: 2.5s loop translate across button
- Hover CTA: scale(1.02), transition 200ms

## Assets
- `/typotab/images/hero-demo.png`
- `/typotab/images/clouds-decor.png` (optional layered)
- Apple glyph: inline SVG

## Text Content (verbatim)
- Badge: New Spring Update 🎉
- H1: Write 10x Faster. / Instantly, Anywhere.
- Sub: Your AI companion that transforms your text into compelling, error-free writing.
- CTA: Download for macOS

## Responsive
- Desktop 1440: as above
- Mobile 390: h1 ~40–48px; content padding reduced; media full width with 16px side padding; stack unchanged
