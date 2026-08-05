# TypoTab Homepage — Page Topology

Source: https://www.typotab.com/  
Extraction date: 2026-08-05  
Viewport reference: Desktop 1440×900, Mobile 390×844  
Total scroll height (~desktop): **8843px**

## Project adaptations (HyperOS DS)

| Original | Our clone |
|----------|-----------|
| Fixed Framer nav | **Keep existing `PillNav`** — do not clone TypoTab nav |
| Footer | **Out of scope** — skip for now |
| Content copy | Temporary TypoTab copy for **form** fidelity; HyperOS content comes later |
| Scope | Styles scoped under `.home-shell` / TypoTab clone components — do not replace docs chrome tokens |

## Page layout overview

- Framer site; white page background (`rgb(255,255,255)`)
- No Lenis / Locomotive; native scroll (`scroll-behavior: auto`)
- Content max-width band: **1000px** centered
- Fixed header present on original (ignored in our build)
- Sections are Framer named frames (`data-framer-name`), not semantic `<section>`

## Sections (top → bottom)

| # | Framer name | ID / anchor | Approx top | Height | Interaction model | In scope? |
|---|-------------|-------------|------------|--------|-------------------|-----------|
| 0 | (nav) | — | 0 fixed | 80→55 | scroll-shrink height | **No** — keep PillNav |
| 1 | `hero` | `#home` | 0 | ~1154 | mostly static + parallaxy floating shapes / cloud drift / CTA shine | **Yes** |
| 2 | `value-prop` | — | ~1154 | ~1428 | static grid + floating app-icon animation in “Works everywhere” card | **Yes** |
| 3 | `shortcuts` | — | ~2582 | ~853 | time-driven shortcut recorder UI + keyboard visual | **Yes** |
| 4 | `use-cases` | — | ~3435 | ~1482 | click-to-play videos on 3 colored split cards | **Yes** |
| 5 | `app-agnostic` | — | ~4917 | ~1430 | rotating logo ring (time) + centered action menu mock | **Yes** |
| 6 | `pricing` | `#pricing` | ~6347 | ~1262 | static 2-column cards; CTA links out | **Yes** |
| 7 | FAQ | — | ~7600 | ~varies | click accordion | **Yes** |
| 8 | Footer | — | bottom | — | static links | **No** |

## Z-index / stacking

1. Fixed nav (original) — ignored
2. Hero `bg-container` / `bg` (z=0) — sky gradient
3. Hero `content` (z=1) — badge, headlines, CTA
4. Absolute `cloud` layers near hero bottom
5. `hero-video-container` product shot with deep blue glow shadow
6. Remaining sections flow document order on white

## Dependencies

- PillNav overlays everything (`z-40` in our codebase) — hero top padding must clear it (~80px+ already on TypoTab)
- Cloud PNGs and hero demo image are layered compositions — download to `public/typotab/`
- Three use-case videos (Dropbox) + posters

## Assembly blueprint (our `page.tsx`)

```tsx
<>
  <PillNav />           // existing — do not replace
  <TypoHero />
  <TypoValueProp />
  <TypoShortcuts />
  <TypoUseCases />
  <TypoApps />
  <TypoPricing />
  <TypoFaq />
  {/* footer later */}
</>
```
