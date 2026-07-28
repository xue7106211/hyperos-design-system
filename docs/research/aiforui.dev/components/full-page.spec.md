# Resources page (aiforui 1:1 shell) Specification

> **注意**：本文记录的是调研对象 [aiforui.dev](https://aiforui.dev/) 的壳层与组件清单，**不是** HyperOS 当前 `/resources` 实现。已落地映射见 [ADAPTATION.md](../ADAPTATION.md)；实现入口为 `src/app/resources/page.tsx`（含 `ResourcesCodexNav`，不含 Buy / FAQ / FixedBar）。

## Overview
- **Target (调研参考截图):** `docs/design-references/aiforui.dev/clone-resources-v2-desktop.png`
- **HyperOS 实现:** `src/app/resources/page.tsx` + `resources.css` + `src/components/resources/*`
- **Interaction model (aiforui 源站):** mixed — static long-form + click FAQ accordion + link CTAs

## Verified computed styles (local clone @ 1440)

| Element | Property | Value (matches aiforui) |
|---------|----------|-------------------------|
| shell bg | backgroundColor | rgb(253, 253, 252) |
| layout | maxWidth | 732px |
| H1 | fontSize / weight / marginTop | 48px / 575 / 264px |
| buy-button-small | height / radius | 32px / 8px |
| buy-button | gradient | 65,164,255 → 0,130,251 |
| skills card | radius / shadow | 12px / inset-like soft shadow |
| feature card | height | 300px |
| buy card | radius / bg / maxWidth | 40px / #F7F7F7 / 620px |
| text-gradient | background-clip | text |

## Components
1. ResourcesFixedBar
2. ResourceHero
3. ResourcesIntro (+ text-gradient)
4. ResourcesQuote
5. ResourcesCatalog (skills card)
6. ResourcesFeatured (project cards)
7. ResourcesBuyCard
8. ResourcesFaq (client accordion)
9. ResourcesFooter
