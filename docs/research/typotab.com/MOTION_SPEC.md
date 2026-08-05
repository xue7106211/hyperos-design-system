# TypoTab Motion Spec (for HyperOS clone)

Extracted 2026-08-05 from live typotab.com (Framer JS motion).

## Observed behaviors

1. **Hero letter stagger** — H1 split into per-character `inline-block` spans (appear on load with will-change).
2. **Hero ambient float** — `cloud` / `shape` continuous translateY (~±8px) + slight rotate/scale matrices; different phases per layer.
3. **CTA shine** — skewed white bar, soft-light + blur, sweeps across button.
4. **Hero media** — enter with soft perspective (`matrix3d` / depth) + large blue glow already in CSS.
5. **Value-prop icons** — continuous micro bob / scale on floating logos.
6. **Shortcuts** — key / recording pill micro scale pulse (time-driven state cycle).
7. **Apps** — dual rings rotate continuously (outer ~60s, inner reverse slower).
8. **Section enter (Framer Appear)** — typical Framer pattern: fade + rise on viewport enter (opacity 0→1, y 24→0), often stagger children. Hard to catch mid-scroll once settled at opacity 1; implement as `whileInView` once.

## Implementation plan (motion/react)

| Effect | Approach |
|--------|----------|
| Scroll enter | `TypoReveal` wrapper: `initial` / `whileInView` / `viewport={{ once: true, margin: '-10%' }}` |
| Stagger groups | parent `variants` + `staggerChildren: 0.08` |
| Hero letters | split text → `motion.span` stagger |
| Ambient float | CSS keyframes (GPU) keep for clouds/shapes/shine/spin |
| Hover | CTA / cards `whileHover={{ scale: 1.02 }}` |
| Reduced motion | `useReducedMotion` → skip transforms |

## Spring defaults (Framer-like)

```ts
transition: { type: 'spring', stiffness: 120, damping: 20, mass: 0.8 }
// or visualDuration style:
{ type: 'spring', visualDuration: 0.5, bounce: 0.15 }
```
