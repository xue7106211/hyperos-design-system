# aiforui.dev — Page Topology

**Source:** https://aiforui.dev/  
**Captured:** 2026-07-27  
**References:** `docs/design-references/aiforui.dev/`

## Overall layout

- Single-column marketing page
- Content root: `.layout-root` — `max-width: 732px`, centered, `padding-inline: 16px`
- Body background: `rgb(253, 253, 252)` (`#FDFDFC`)
- Font: Inter (variable), weights include 400 / 500 / 575
- No Lenis / Locomotive; native scroll
- Theme class on `<html>`: `light` (supports dark)

## Sections (top → bottom)

| # | Name | Interaction model | Notes |
|---|------|-------------------|-------|
| 0 | Fixed enroll bar | static + link | `fixed top-4 right-4`; countdown + “Enroll Now” |
| 1 | Hero | static | H1 48/52, centered; subtitle; avatar + “Taught by” |
| 2 | Problem narrative | static | Large paragraphs (`18px/28.8`), generous top margin |
| 3 | Thesis (“AI is only as good…”) | static | H2 + body; gradient emphasis on key phrase |
| 4 | Testimonial (shadcn) | static | Quote + avatar |
| 5 | What you’ll learn | static | Intro copy + **Skills card** (white `rounded-xl`, 2-col Design/Engineering lists) |
| 6 | About Emil | static + click demos | Bio + **Project demo cards** (Sonner / Vaul), 2-col grid |
| 7 | Social proof quote | static | Pranathi Peri |
| 8 | animations.dev callout | static | Image + copy |
| 9 | Buy card | click (external) | Large pill card `#F7F7F7`, `rounded-[40px]`, blue CTA |
| 10 | Logo wall | static | “Trusted by…” + monochrome logos |
| 11 | FAQ accordion | click-driven | Categories Course / Purchasing / Help; `aria-expanded` |
| 12 | Footer | static | “aiforui.dev by Emil Kowalski” |

## Fixed / sticky overlays

- Enroll bar only (`position: fixed`). Does not change style on scroll.

## HyperOS adaptation target

For `/resources` we reuse:

1. Page shell (bg, max-width, type scale)
2. Centered hero title + subtitle
3. Section H2 rhythm (`mt-20`, 22–26px medium)
4. White `rounded-xl` cards with soft shadow (project-card language)
5. 2-column responsive grid (`flex-col` → `md:grid-cols-2`, gap 32px)

We **do not** port: enroll bar, buy card, FAQ, toast/drawer demos, logo wall.
