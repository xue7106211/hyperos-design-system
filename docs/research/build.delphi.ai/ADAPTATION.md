# HyperOS adaptation of Delphi home

Reference: https://build.delphi.ai/

## Kept (visual system)

- Dark surface `#1e1e1d`
- Floating pill nav (blur + inset highlight shadow)
- Centered hero, single viewport
- HalftoneBloom canvas (spacing / radius / pointer push) — ported from Delphi `HalftoneBloom`
- Accent `oklch(0.74 0.2 42)` (tangerine)
- Word reveal animation (1.3s, stagger 60ms)
- Mid / high foreground `#b5b3ad` / `#eeeeec`

## Replaced (brand)

| Delphi | HyperOS |
|--------|---------|
| Delphi logo SVG | HyperOS wordmark + “H” monogram in nav |
| Brand / Notes / System | 文档 / 色彩 / 组件 / Figma |
| English sentence | Chinese copy with docs links |
| Font Awesome drafting icons | Lucide `Palette` / `BookOpen` |

## Theme

Home follows site `next-themes` (`html.dark` / light). Tokens live on `.home-shell` / `.dark .home-shell`. Pill nav includes Fumadocs `ThemeSwitch` (`light-dark`).

## Out of scope

- Delphi Brand / Notes / System inner pages
- Command palette
- Exact Delphi logo geometry
