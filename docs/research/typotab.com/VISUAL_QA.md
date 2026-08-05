# TypoTab form clone — Visual QA notes

Date: 2026-08-05  
Branch: `feat/home-redesign`  
Local: http://localhost:3000/

## Compared

| Section | Status | Notes |
|---------|--------|-------|
| Nav | Kept PillNav | As requested |
| Hero | Good | Gradient, Nunito black, CTA shine, demo glow; clouds approximate |
| Value prop | Good | 2×2 cards, floating logos on “Works everywhere” |
| Shortcuts | Good | Phase cycle + keyboard asset |
| Use cases | Good | Colors match; click-to-play videos |
| Apps | Acceptable | Rotating rings + center menu (Framer ring density not pixel-identical) |
| Pricing | Good | Blue/green cards, feature lists |
| FAQ | Good | Accordion + verbatim answers |
| Footer | Skipped | As requested |

## Known gaps (form polish later)

1. Hero floating + / star shapes not fully replicated (minor decor)
2. App logo orbits are CSS approximations of Framer motion paths
3. Shortcut recorder UI is simplified vs Framer component variants
4. Mobile breakpoints need dedicated pass after content swap
5. Dark theme forced light while `.typo-clone` present

## Assets

- Images/logos/videos under `public/typotab/` (40+ files)
- Research under `docs/research/typotab.com/`
- References under `docs/design-references/typotab.com/`
