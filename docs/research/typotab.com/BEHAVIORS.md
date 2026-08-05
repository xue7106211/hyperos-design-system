# TypoTab Homepage — Behaviors Bible

Source: https://www.typotab.com/  
Extraction: Chrome DevTools MCP, 2026-08-05

## Global

| Behavior | Finding |
|----------|---------|
| Smooth scroll library | **None** (no `.lenis` / Locomotive) |
| `scroll-behavior` | `auto` |
| Sticky elements | None found |
| Page theme | Light only (white page); no dark-to-light section theme switch |
| Fixed nav height | ~80px at scrollY=0 → ~55px after scroll (ignored — we keep PillNav) |

## Scroll sweep

### Hero (`hero`)
- Floating decorative `shape` elements continuously transform (gentle bob / rotate) — **time-driven**, not scroll
- Cloud layers drift vertically (`translateY` animating)
- Background clouds layer at opacity ~0.3 with slight scale
- CTA `shine` overlay: absolute white bar, `mix-blend-mode: soft-light`, `blur(5px)`, skewed — likely continuous shine sweep

### Value prop (`value-prop`)
- “Works everywhere” card: floating app icons (Chrome, Safari, Notion, Finder, etc.) with small transform oscillations — **time-driven**
- Other three cards: largely static imagery

### Shortcuts (`shortcuts`)
- Shortcut recorder pill cycles typed keys / “Recording…” states — **time-driven**
- Keyboard image static with soft perspective (`matrix3d` on container)

### Use cases (`use-cases`)
- Three video cards with Play/Pause overlays
- **INTERACTION MODEL: click-to-play** (videos `autoplay:false`, `loop:true`, `muted:true`)
- Colors: blue `rgb(0, 161, 255)`, purple `rgb(173, 109, 255)`, orange `rgb(255, 115, 0)`

### Apps (`app-agnostic`)
- Concentric logo rings continuously rotate — **time-driven**
- Center action menu mock is static UI chrome

### Pricing (`pricing`)
- Static two cards; pound glyphs have slight opacity/transform idle animation
- External Lemon Squeezy checkout links

### FAQ
- Accordion pattern (heading + expand control)
- Click via synthetic MouseEvent did not expand in automation — Framer may require real pointer; treat as **click-driven accordion** with height expand + answer text reveal
- Questions observed:
  1. What is TypoTab and how does it work?
  2. Does TypoTab collect or store my data?
  3. How much can I use TypoTab?
  4. What should I do if TypoTab isn’t working properly?

## Hover sweep (manual expectations)

| Element | Expected |
|---------|----------|
| Primary CTA (black pill) | Slight scale / shine intensify; cursor pointer |
| Pricing “Get started” | White pill on colored card — slight lift/opacity |
| FAQ rows | Cursor pointer; + rotates to × when open |
| Badge | Cursor pointer (links to What’s new) |
| Use-case Play | Opacity / scale on hover |

## Responsive

| Viewport | Notes |
|----------|-------|
| 1440 | Content max 1000px; 2×2 value-prop grid; pricing 2-col; use-case cards horizontal split |
| 768 | Expect value-prop → single column; pricing stack; hero headline scales down |
| 390 | Stacked single column; hero headline smaller; demo image full-bleed within padding; pricing cards stack |

Exact mobile computed styles: see `mobile-390-full.png` and per-component specs.

## Implementation notes for builders

1. Prefer CSS `@keyframes` for continuous float/rotate/shine; avoid scroll-linked libraries unless extracted later.
2. Videos: local files under `/typotab/videos/` with posters; play on click, show Pause when playing.
3. Do not implement TypoTab nav shrink behavior.
4. Fonts: **Nunito** (headings / body marketing) + Inter appears in UI chrome; SF Pro Rounded on some badges — map Nunito via `next/font/google`, scope to clone wrapper.

## Motion clone (2026-08-05)

已用 `motion` 补齐形式动效（见 `MOTION_SPEC.md`）：

- Hero：逐字进场、装饰星漂浮、云层/媒体滚动视差、CTA shine + hover
- 各区块：`TypoReveal` / `TypoStagger` 视口进场（fade + rise + 轻 blur）
- Shortcuts：状态切换 AnimatePresence；Apps：双环旋转；FAQ：弹簧 + 高度展开
- `prefers-reduced-motion` 时降级为静态
