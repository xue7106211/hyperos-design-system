# aiforui.dev — Design Tokens (extracted)

Values from `getComputedStyle` / DOM inspection, 1440×900, light mode.

## Color

| Token | Value | Usage |
|-------|-------|-------|
| page-bg | `#FDFDFC` / `rgb(253, 253, 252)` | `body` |
| foreground-100 | `#000000` / near-black | H1, H2, strong titles |
| gray-1200 / text | `rgb(33, 32, 28)` | body on layout-root |
| foreground-200 | `rgb(64, 64, 64)` | subtitles, paragraphs |
| muted | `rgb(141, 141, 134)` | “Trusted by…” |
| card-bg | `#FFFFFF` | skill panel, project cards |
| buy-card-bg | `#F7F7F7` | pricing shell |
| gray-200/300 borders | `#F9F9F8` / `#F1F0EF` | dividers |
| accent blue top | `rgb(65, 164, 255)` | CTA gradient start |
| accent blue bottom | `rgb(0, 130, 251)` | CTA gradient end |
| accent ring | `rgb(30, 147, 253)` | CTA outer ring |

CTA shadow stack:
`inset 0 0 1px 1px rgba(255,255,255,0.18), 0 0 0 1px rgba(0,0,0,0.08), 0 2px 2px 0 rgba(0,0,0,0.04), 0 0 0 1px rgb(30,147,253)`

Card shadow:
`0 0 0 1px rgba(0,0,0,0.08), 0 2px 2px 0 rgba(0,0,0,0.04)`

## Typography

| Role | Size / line / weight / tracking |
|------|----------------------------------|
| H1 (md) | 48px / 52px / 575 / -1.2px |
| H1 (sm) | 40px / 44px / 575 / tight |
| H2 section | 26px / 32px / 500 / -0.65px (22/32 below md) |
| Hero subtitle | 20px / 28px / 400 · color foreground-200 |
| Body large | 18px / 28.8px / 400 / -0.18px |
| Skill group label | 14px / 575 |
| Card link title | 14px / 500 |

Font family: `inter, "inter Fallback"`

## Layout

| Token | Value |
|-------|-------|
| content-max | 732px |
| content-pad-x | 16px |
| section-h2-mt | 80px (`mt-20`) |
| card-radius | 12px (`rounded-xl`) |
| buy-radius | 40px |
| project-card-h | 300px |
| project-grid-gap | 32px |
| md-top-margin | ~80px (`md:mt-20`) |

## Motion

- Buy CTA: `filter 0.2s`
- Demo pills: `transition-colors`
- No page-level scroll animation library
