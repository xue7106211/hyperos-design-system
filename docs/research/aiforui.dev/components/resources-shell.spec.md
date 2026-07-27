# ResourcesShell Specification

## Overview
- **Target file:** scoped via `.resources-shell` in `src/app/global.css` + `src/app/resources/layout.tsx`
- **Screenshot:** `docs/design-references/aiforui.dev/desktop-1440-viewport.png`
- **Interaction model:** static
- **Adaptation:** aiforui page shell for HyperOS `/resources` (not a full site clone)

## DOM Structure
```
div.resources-shell.min-h-dvh
  PillNav (existing HyperOS)
  main.resources-root
    …sections
```

## Computed Styles (from aiforui)

### Body / shell
- backgroundColor: rgb(253, 253, 252)
- color: rgb(33, 32, 28)
- fontFamily: inter
- fontSize: 16px
- lineHeight: 24px

### Content root (`.resources-root`)
- maxWidth: 732px
- width: 100%
- margin: 80px auto 48px (md); smaller top on mobile
- padding: 0 16px
- display: block

## States & Behaviors
N/A (static shell). Dark mode: invert to near `#0E0E0C` card / `#1e1e1d` page to match HyperOS home dark, keep structure.

## Responsive Behavior
- Desktop 1440: centered 732px column
- Mobile 390: full width minus 16px pad; reduce top margin
