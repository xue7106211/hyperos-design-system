# aiforui.dev — Behaviors

## Scroll sweep

- Header/enroll bar: fixed; no shrink / no style change on scroll
- No scroll-snap
- No parallax / scroll-driven section switching
- No Lenis (`.lenis` absent)
- Content is static long-form; sections do not animate into view on scroll (no IO reveal observed)

## Click sweep

| Control | Result |
|---------|--------|
| Enroll Now / Start learning now | External Polar checkout |
| FAQ questions | Accordion: `aria-expanded` toggles; answer text appears below |
| Render a toast | Live Sonner demo (toast notification region) |
| Open Drawer | Vaul drawer dialog (`haspopup="dialog"`) |
| Skill names / Sonner / Vaul / animations.dev / social links | External navigation |

**INTERACTION MODEL for FAQ:** click-driven accordion (not scroll-driven).

## Hover sweep

| Element | Change |
|---------|--------|
| Buy button | `transition: filter 0.2s` (brightness/filter) |
| Pill demo buttons | `hover:bg-gray-200`, `transition-colors` |
| Text links | subtle underline / color (foreground links) |
| FAQ row | cursor pointer; chevron affordance |

## Responsive

| Viewport | Layout |
|----------|--------|
| 1440 | Single 732px column; skill grid 2-col; project cards 2-col; logos flex row |
| 768 | Same column pattern; grids remain 2-col via `md:` |
| 390 | Stacks: project cards `flex-col gap-8`; skill grid `grid-cols-1`; enroll small button visible; H1 ~40/44 |

Breakpoint for card grid: Tailwind `md` (~768px).
