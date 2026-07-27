# Adaptation notes — aiforui.dev → HyperOS `/resources`

## Scope

**1:1 visual / interaction clone** of [aiforui.dev](https://aiforui.dev/) page architecture and effects, with HyperOS 设计资源 content slotted into the same section shells.

## Section mapping

| aiforui section | HyperOS `/resources` |
|-----------------|----------------------|
| Fixed enroll bar + blue CTA | Fixed bar + `buy-button-small` → OS4 Figma |
| Hero H1 / subtitle / taught-by | 设计资源 hero + 维护团队 |
| Long-form paragraphs | 资源中心引言 |
| Thesis + `.text-gradient` | 质量标准高亮句 |
| Testimonial quote | 团队引言 |
| Skills card (Design / Engineering) | 资源目录双栏列表 |
| Sonner / Vaul feature cards | OS4 + 图标库 featured cards |
| Buy card + checklist + CTA | 「从正确的资产开始设计」 |
| FAQ accordion | 资源 FAQ（click accordion） |
| Footer | HyperOS 页脚 |

## Effects implemented

- Page tokens (`gray-100`…`1200`, `foreground-*`)
- `.resources-buy-button` gradient + inset/outer shadow + brightness hover
- `.resources-text-gradient` clipped gradient text
- Skills card dividers / 2-col grid
- Feature cards `h-[300px]` + pill + soft shadow
- Buy card `rounded-[40px]` / inner `rounded-[32px]` / floating badge
- FAQ `aria-expanded` + plus rotate + grid-rows reveal
- Exact-ish hero top margin and paragraph lead spacing

## Not cloned (course-specific)

- Polar checkout / price countdown digit flips
- Live Sonner toast / Vaul drawer demos
- Company logo wall SVGs
- aiforui marketing copy / avatars (replaced with HyperOS)

## Content source

[`src/lib/resources.ts`](../../../src/lib/resources.ts) — href `#` = 链接待补充
