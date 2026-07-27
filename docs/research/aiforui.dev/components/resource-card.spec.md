# ResourceCard Specification

## Overview
- **Target file:** `src/components/resources/ResourceCard.tsx`
- **Screenshot:** project cards region on aiforui (Sonner / Vaul)
- **Interaction model:** click-driven (whole card or CTA is a link)
- **Source pattern:** aiforui white `rounded-xl` project card + soft shadow

## DOM Structure
```
a.resource-card (external or internal)
  div.resource-card-body
    p.resource-card-eyebrow (optional group/version)
    h3.resource-card-title
    p.resource-card-desc
  div.resource-card-footer
    span.resource-card-cta-label (打开 Figma / Git / 下载…)
```

## Computed Styles (from aiforui project card)

### Card container
- display: flex
- flexDirection: column
- justifyContent: space-between
- backgroundColor: rgb(255, 255, 255)
- borderRadius: 12px
- padding: 24px (adapt; aiforui had asymmetric pt for demos)
- minHeight: 180px (adapted; source demos were 300px for interactive preview)
- boxShadow: 0 0 0 1px rgba(0,0,0,0.08), 0 2px 2px 0 rgba(0,0,0,0.04)
- width: 100%
- textDecoration: none
- color: inherit
- transition: transform 0.2s ease, box-shadow 0.2s ease

### Title
- fontSize: 16px–18px
- fontWeight: 575
- color: rgb(0, 0, 0)
- letterSpacing: -0.02em

### Description
- fontSize: 14px
- lineHeight: 22px
- color: rgb(64, 64, 64)
- marginTop: 8px

### CTA
- fontSize: 14px
- fontWeight: 500
- color: rgb(0, 130, 251) (accent from aiforui CTA blue)

## States & Behaviors

### Hover
- **Trigger:** pointer hover on card
- **State A:** default shadow
- **State B:** slightly stronger shadow; optional translateY(-1px)
- **Transition:** 0.2s ease

## Grid wrapper
- classes pattern: `mt-6 flex w-full flex-col gap-8 md:grid md:grid-cols-2`
- gap: 32px

## Responsive Behavior
- Desktop: 2 columns, ~334px card width in 700px content
- Mobile: single column stack, gap 32px
