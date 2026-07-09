# Page Topology — build.delphi.ai

Source: https://build.delphi.ai/ (captured 2026-07-09)

## Overall

Single-viewport dark landing. No page scroll on home (`h-dvh`). Content is vertically + horizontally centered.

| Layer | Position | Role |
|-------|----------|------|
| Body | `#1e1e1d` | Dark sand surface |
| Floating Pill Nav | `fixed top-4 z-40` centered | Primary navigation |
| Main | `min-h-dvh grid place-items-center` | Hero stage |
| HalftoneBloom canvas | `absolute inset-x-0 bottom-0 h-[60vh]` | Orange dot glow |
| Hero content | `relative z-10` | Logo + sentence |

## Sections (top → bottom)

1. **PillNav** — fixed overlay, not in document flow
2. **Hero** — logo (80×80 SVG) + 24px medium sentence with inline icon-links
3. **HalftoneBloom** — canvas decorative layer (pointer-reactive)

## Interaction model

| Section | Model |
|---------|-------|
| PillNav | click-driven (route links); hover opacity/color |
| Hero links | click-driven; hover → brand accent color |
| HalftoneBloom | pointer-driven (dots push away from cursor) |
| Reveal text | time-driven on mount (`reveal` keyframes, stagger 60ms) |

## HyperOS adaptation note

Clone visual system (layout, nav chrome, bloom, typography rhythm) with HyperOS brand assets and Chinese copy. Do not ship Delphi logo/wordmark.
