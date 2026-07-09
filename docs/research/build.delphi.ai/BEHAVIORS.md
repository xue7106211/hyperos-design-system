# Behaviors — build.delphi.ai home

## Scroll

- Home is single viewport; no meaningful scroll.
- No Lenis / Locomotive.

## Pill Nav

- Container: `rounded-full`, `p-1.5`, `backdrop-blur-sm` (8px), bg `sand-4/60` in dark.
- Inset highlight shadow (dark):
  `rgba(255,255,255,0.1) 0 -1px 1px inset, rgba(255,255,255,0.15) 0 1px 1px inset, rgba(0,0,0,0.5) 0 2px 4px`
- Logo button: `size-9`, hover `opacity: 0.7`, transition `opacity 0.15s`
- Text links: `h-9 px-3 text-sm font-medium`, color mid `#b5b3ad` → high `#eeeeec` on hover

## Hero reveal

```css
@keyframes reveal {
  0% { opacity: 0; transform: translateY(100%); }
  100% { opacity: 1; transform: translateY(0); }
}
.reveal-item {
  display: inline-block;
  animation: reveal 1.3s cubic-bezier(0.19, 1, 0.22, 1) backwards;
  animation-delay: calc(var(--index) * 60ms);
}
```

## HalftoneBloom (canvas)

Defaults: `spacing=10`, `maxRadius=5.2`, `pushRadius=140`, `pushStrength=30`

- Dot grid over bottom 60vh; elliptical falloff from bottom-center
- Fill color = `currentColor` (`brand-accent` ≈ `oklch(0.74 0.2 42)`)
- Pointer move pushes nearby dots outward (quadratic falloff); spring back with lerp 0.18
- Respects `prefers-reduced-motion` (still draws static; skips continuous RAF when idle)
- Resize + `html.class` MutationObserver rebuilds dots (theme changes)

## Hover — hero links

- Default: `rgb(238, 238, 236)`
- Hover: `text-brand-accent` / `oklch(0.74 0.2 42)`
- Transition: color 0.15s

## Responsive

- Desktop 1440: sentence ~512px max, 24px / 32px, tracking 0.6px
- Mobile 390: same structure; text wraps; nav stays top-center pill; bloom still bottom 60vh
