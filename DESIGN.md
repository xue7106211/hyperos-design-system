---
version: alpha
name: HyperOS Design System 文档站
description: >-
  HyperOS 设计规范文档站自身的站点 UI（导航、页面外壳、工具页、Ask AI 面板）。
  不是 HyperOS 客户端组件规范；客户端规范在 content/docs/，业务 Token 在 tokens/。
  暗色值用 -dark 后缀；各页面外壳专属的颜色用 docs- / home- / resources- / tools- 前缀。
colors:
  # 全站共用
  primary: "#0082fb"
  primary-dark: "#4194ff"
  on-surface: "#0a0a0a"
  on-surface-muted: "#737373"
  on-surface-dark: "#ebebeb"
  on-surface-muted-dark: "#b3b3b3"
  # 文档页（Fumadocs neutral，未覆盖品牌色）
  docs-background: "#f5f5f5"
  docs-background-dark: "#121212"
  # Landing / 图标页
  home-bg: "#fdfdfc"
  home-bg-dark: "#111110"
  home-fg-high: "#21201c"
  home-fg-high-dark: "#ffffff"
  home-fg-mid: "#43423d"
  home-fg-mid-dark: "#b5b3ad"
  # 资源页（按 aiforui.dev 还原）
  resources-fg-high: "#000000"
  resources-fg-mid: "#404040"
  # 工具页
  tools-page: "rgb(248 248 250)"
  tools-page-dark: "#111110"
  tools-panel: "#ffffff"
  tools-panel-dark: "#1a1a19"
  tools-hyperos-ink: "#0a66c8"
  tools-hyperos-ink-dark: "#6aa9ff"
  tools-hyperos-solid: "#0a6fdc"
  tools-hyperos-solid-hover: "#075fbf"
  tools-hyperos-solid-dark: "#1f6fe0"
  tools-hyperos-solid-hover-dark: "#2b7cf0"
  tools-legacy: "oklch(0.7 0.13 70)"
  tools-legacy-dark: "oklch(0.76 0.12 75)"
  tools-unbound: "oklch(0.6 0.19 27)"
  tools-unbound-dark: "oklch(0.7 0.17 25)"
  tools-danger: "oklch(0.55 0.2 27)"
  tools-danger-dark: "oklch(0.75 0.15 25)"
typography:
  docs-h1:
    fontFamily: Inter
    fontSize: 1.375rem
    fontWeight: 600
  docs-h2:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 600
  docs-h3:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 600
  docs-h4:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: 600
  docs-body:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.625
  docs-toc-title:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 500
  docs-toc-item:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: 400
  tools-display:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: -0.01em
  tools-headline:
    fontFamily: Inter
    fontSize: 1.375rem
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: -0.01em
  tools-body:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  tools-label:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.5
  mono:
    fontFamily: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
    fontSize: 0.75rem
    fontWeight: 400
rounded:
  none: 0px
  control: 8px
  panel: 12px
  surface: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  nav-offset: 5.25rem
  ask-ai-dock-min: 22rem
  ask-ai-dock-max: 28rem
components:
  button-primary:
    backgroundColor: "{colors.on-surface}"
    textColor: "{colors.tools-page}"
    rounded: "{rounded.control}"
    height: 2.25rem
    padding: 16px
    typography: "{typography.tools-body}"
  button-secondary:
    backgroundColor: "{colors.tools-panel}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.control}"
    height: 2.25rem
    padding: 16px
  tools-panel:
    backgroundColor: "{colors.tools-panel}"
    rounded: "{rounded.panel}"
    padding: 24px
  tools-coverage-hyperos:
    backgroundColor: "{colors.tools-hyperos-solid}"
  tools-coverage-legacy:
    backgroundColor: "{colors.tools-legacy}"
  tools-coverage-unbound:
    backgroundColor: "{colors.tools-unbound}"
  docs-image:
    rounded: "{rounded.none}"
---

# DESIGN.md

本文件按 [Google DESIGN.md 规范](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md)（alpha）编写：front matter 是机器可读的 Token，正文是使用说明。Token 是规范值，正文解释怎么用。校验：`npx -y @google/design.md lint DESIGN.md`。

工程边界、命令与目录见 [AGENTS.md](AGENTS.md)；技术方案见 [docs/technical-design.md](docs/technical-design.md)。

## Overview

这是 HyperOS 移动端设计规范的文档站，读者是设计师、文档作者和 Android / iOS 工程师。站点 chrome 要安静、精确，把注意力留给规范内容本身。整体以中性色为主，全站唯一的强调色是 HyperOS 蓝。

本文件只管网站自身的 UI。HyperOS 客户端组件的设计规范写在 `content/docs/`，业务 Design Token 在 `tokens/`。站点样式不要引用 `tokens/*.json` 里的 `miuix_*` 值，反过来也一样。

站点按路由分成几种外壳。每种外壳有自己的作用域类名和 CSS 变量，改样式前先确认自己在哪个外壳里，变量不要跨外壳借用：

| 路由 | 外壳 | 样式来源 | 基调 |
|------|------|----------|------|
| `/docs/**` | Fumadocs `#nd-docs-layout` | `src/app/global.css`（Fumadocs `neutral.css` + 紧凑排版覆盖） | 中性灰，信息密度接近 ui.shadcn.com/docs |
| `/`（Landing） | `.home-shell` | `global.css` 的 `--home-*` + `src/components/home/` | 暖白底、大字号、入场揭示（参考 typotab.com） |
| `/resources` | `.resources-shell` | `src/app/resources/resources.css` | 按 aiforui.dev 1:1 还原的暖灰色阶、细线网格 |
| `/icons` | `.home-shell`（固定视口高度，页内滚动） | `global.css` + `IconGallery` | 与 Landing 共用导航和底色 |
| `/tools/*` | `.home-shell.tools-shell` + 正文 `.tc-arc` | `src/app/tools/tools.css`、`arc-theme.css` | 校对报告：浅灰页面底、白色面板、细线分组 |
| 全站浮层 | Ask AI 面板 | shadcn（`src/components/ui/`）+ AI Elements | shadcn 默认中性主题 |

调研与还原依据：[docs/research/](docs/research/)、[docs/design-references/](docs/design-references/)。

## Colors

Token 名到 CSS 变量的对应：`primary` → `--home-accent` / `--tc-hyperos`；`tools-hyperos-ink` → `--tc-hyperos-ink`；`tools-danger` → `--tc-danger`；`on-surface` → `--color-fd-foreground`；`home-*` → `--home-*`；`tools-*` → `--tc-*`（定义在 `tools.css`）。

- **Primary（HyperOS 蓝 `#0082fb`）**：全站唯一的强调色，用于链接 hover 和选中态。暗色下的 `--home-accent` 是 `#4194ff` 与 `#6f6d66` 按 80% 混合，不是纯 `primary-dark`。
- **On-surface（中性前景）**：主文字和边框都从它派生。边框和分隔线用前景色按比例混入透明，例如 `color-mix(in oklab, var(--color-fd-foreground) 8%, transparent)`，不写死灰值，这样深浅色切换时自动成立。
- **工具页覆盖率数字（`tools-hyperos-ink`）**：比 `primary` 深一级，保证正文字号下的对比度达到 4.5:1。覆盖率数字不要直接用 `primary`（`#0082fb` 在白底上约 3.9:1）。
- **工具页实色蓝（`tools-hyperos-solid`）**：只用于覆盖率比例条的 HyperOS 段，以及 Arc 的 `--accent` / `--control-on` / `--control-fill`。
- **工具页状态色**：赭石色 `tools-legacy` 表示旧版 Kit 变量（需要迁移），红色 `tools-unbound` 表示未绑定（比例条上叠斜纹），中性灰表示非 HyperOS 库。`tools-danger` 只用于工具页的报错。状态色只表达状态，不拿来装饰。
- **资源页文字**：主文字 `#000`、次要文字 `#404040`，和 Landing 的 `#21201c` / `#43423d` 不同，这是为还原 aiforui.dev 留下的差异。
- **文档页**：直接用 Fumadocs `neutral` 的 `--color-fd-*`，没有覆盖品牌色。

## Typography

- 根布局（`src/app/layout.tsx`）在 `<html>` 上同时挂了 Inter（`next/font` 的 className）和 Geist（`--font-sans` + `font-sans`）。Token 里写的是 Inter，但实际生效哪一个尚未在浏览器核实，见 [docs/roadmap.md](docs/roadmap.md)。
- 等宽字体统一用系统栈，不加载 web 等宽字体。工具页只在节点 ID 和色值上用等宽。
- 文档页正文 15px、行高 1.625；标题 h1 到 h4 字重都是 600。
- 工具页字号阶梯是 0.75 / 0.875 / 1 / 1.125 / 1.375 / 1.75 / 2.25rem（`--text-xs` 到 `--text-3xl`），正文行高 1.5，大标题行高 1.15、字距 -0.01em。层级靠字号和颜色区分，字重最多到 500。
- 全站 `h1`–`h3` 用 `text-wrap: balance`，`p` 用 `text-wrap: pretty`。
- 文案默认中文，中文与英文、数字之间留空格。

## Layout

- `PillNav` 是 fixed 导航，Landing、资源页、图标页、工具页共用。页面顶部留 `nav-offset`（5.25rem）占位。
- 文档页侧栏贴视口左边，正文和 TOC 仍按 Fumadocs 默认居中（`#nd-docs-layout` 的 grid 多出一列 spacer）。
- 视口宽度 ≥ 80rem 时，Ask AI 可停靠在右侧，宽度 `clamp(22rem, 30vw, 28rem)`。停靠时文档正文让出宽度，TOC 隐藏。
- 右下角归 Ask AI 入口。首页不挂「返回顶部」；`/resources` 挂了，两者同角共存，改其中一个都要一起看。
- 隐藏页（`src/lib/hidden-nav-pages.ts`）连侧栏外壳一起隐藏，不是只显示空导航树。
- 工具页宽屏是「正文 + 右侧固定边栏」，窄屏边栏收到正文上方。问题清单的悬停详情卡在宽屏放到列表右外侧，窄屏贴列表左边缘。
- 间距按 4px 网格；工具页面板内 24px，大区块之间 64px，同组内 24px。

## Elevation & Depth

- 层级优先靠「比下面一层亮一级」加细线边框来表达，不靠阴影堆叠。工具页的面板就是页面底上的一块白色面板。
- 工具页阴影分三级：resting / raised / floating（见 `arc-theme.css`）。深色模式下取消 resting，只给浮层保留阴影。
- 文档侧栏选中项：popover 底色、1px 细边框、`0 1px 2px rgb(0 0 0 / 0.06)` 阴影，读起来比侧栏面板高一层。
- 导航和悬浮按钮（`PillNav`、返回顶部）用半透明底、`backdrop-filter: blur(10px)` 和内描边阴影（`--home-nav-bg`、`--home-nav-shadow`）。

## Shapes

- 工具页：控件圆角 8px，面板 12px，大容器 16px。只有确实是胶囊的元素才用 `full`，不要把所有东西做成胶囊。嵌套时内圆角等于外圆角减去间距。
- 文档配图保持直角（`rounded-none`，由 `DocsImage` 统一处理），让规范图原样显示。
- 画板式的整屏截图不加圆角装饰。

## Components

同一种控件在同一区域只用一套实现：

| 区域 | 用什么 | 不要做 |
|------|--------|--------|
| 文档页 chrome（侧栏、TOC、搜索、主题切换） | Fumadocs 自带组件 | 在文档页引入 Arc 或 shadcn 控件 |
| 文档正文 | `src/components/mdx/` 中注册的 MDX 组件 | 放可交互的 Web 组件 demo（见 AGENTS「必读约束」） |
| Landing / 资源页 / 图标页 | `src/components/home/`、`resources/` 内的专用组件；导航统一用 `PillNav` | 每页再写一套导航 |
| 工具页 | Arc 组件（`src/components/arc/`） | 手写按钮、输入框、分段控件、折叠面板 |
| Ask AI | shadcn + AI Elements | 把 shadcn 组件用到文档正文 |

- **主按钮（`button-primary`）**：Arc Button 的 `primary` 用前景色，浅色模式黑底白字，深色模式白底黑字。不要改成蓝色，蓝色只留给覆盖率数字（`tools-hyperos-ink`）和 HyperOS 段（`tools-hyperos-solid`）。
- **工具页面板（`tools-panel`）**：白底、细线边框、12px 圆角。面板里不再套卡片，小分组用细线、表格或浅底小标题。
- **覆盖率比例条**：四档颜色见 `tools-coverage-*`，未绑定段叠红色斜纹，保证不靠色相也能区分。
- **悬停详情卡**：Arc Hover Card，只读内容；操作放在触发器一侧。一句话提示用 Arc Tooltip。
- 工具页引入 Arc 组件的规则（不新增依赖、不引 `foundation.css`、本地化改动直接改源码）见 AGENTS「Token 绑定检查」一节。

## Do's and Don'ts

- Do 改样式前先确认所在外壳，只用该外壳的变量
- Do 边框和分隔线用前景色按比例混入透明，不写死灰值
- Do 键盘焦点环用中性前景色，只在 `:focus-visible` 时显示 2px 外框，偏移 2–3px
- Do 状态之外再给一种区分方式（文字、形状或位置），不只靠色相
- Do 只有图标的按钮加 `aria-label`
- Don't 在站点样式里引用 `tokens/*.json` 的 `miuix_*` 值
- Don't 在工具页手写按钮、输入框、分段控件、折叠面板（例外：页底「校对说明」小字里的 `.tc-fine-link` 文字链接）
- Don't 把主按钮改成 HyperOS 蓝
- Don't 在文档正文放可交互的 Web 组件 demo
- Don't 给 hover 写在 `@media (hover: hover) and (pointer: fine)` 之外，避免触屏卡住 hover 态

## Motion

动效用来交代状态变化，不是装饰。每处动效都要在 `prefers-reduced-motion: reduce` 下关闭，或退化为无位移。

| 场景 | 参数 | 位置 |
|------|------|------|
| Landing 文字入场 | 1.3s，`cubic-bezier(0.19, 1, 0.22, 1)`，每项错开 60ms | `.home-reveal-item` |
| 资源页 hover / 入场 / Hero | 150ms / 680ms / 1200ms，`cubic-bezier(0.32, 0.72, 0, 1)`，错开 140ms（Hero 200ms） | `--resources-*` |
| 工具页 | 120 / 160 / 240 / 480ms 四档，另有 400ms 弹簧档（Accordion 鼠标展开）；入场 `cubic-bezier(0.16, 1, 0.3, 1)` | `arc-theme.css`；弹簧由 `src/components/arc/motion-tokens.ts` 的 `spring.smooth`（`visualDuration: 0.4`）驱动 |
| 导航链接、返回顶部 | 150ms 颜色 / 透明度，按下 `scale: 0.96` | `global.css` |
| Ask AI 停靠栏推开正文 | 220ms，`cubic-bezier(0.32, 0.72, 0, 1)` | `global.css` |

- 键盘逐条浏览这类高频操作不播放展开动画（工具页 Accordion 支持 `instant`）。
- 只动 `transform`、`opacity`、颜色，不拿宽高或 `margin` 做动画。已知例外：Ask AI 停靠栏推开正文用的是 `margin-inline-end` 过渡。

## Accessibility

以下规则已生效，新组件不要覆盖掉。

全站（`global.css`）：

- 触屏设备上 `input` / `textarea` / `select` 字号不低于 16px，防止 iOS Safari 自动放大。
- 可点击元素 `touch-action: manipulation`；按钮禁止文字选中。
- 「跳到正文」链接（`SkipLink`）：文档页跳 `#nd-page`，其他页跳 `#main`。新外壳必须提供对应的 `id`。

工具页（`.tc-arc` 范围内）：

- 文本框靠边框和光标表示焦点，不画外框（`arc-theme.css`）。
- 点击热区桌面端不小于 40px、触屏不小于 44px，小控件用伪元素扩展，相邻热区不重叠（`tools.css`）。
