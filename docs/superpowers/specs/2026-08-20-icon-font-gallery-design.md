# 字体图标库（TTF / Variable Font）设计

日期：2026-08-20  
状态：待实现  
范围：`/docs/os4/resources/icons` 的 `<IconGallery />` 从 SVG 预览改为可变字体图标预览；OS5 图标页共用同一套

## 目标

文档站图标库以 **可变 TTF 为真源**，在页面上渲染字体 glyph，并展示 / 复制 **语义名称、Unicode、Glyph Index**。全局可调 **颜色、粗细（`wght`）、字号**，可按名称 / Unicode / Glyph Index **搜索**。不再从 Figma 导出 SVG 再导入。

## 非目标（本轮不做）

- 从 Figma 拉 SVG、`icons:import`、分类浏览（TTF 无分类表）
- 多色图标、按 Token 上色（semantic color 绑定）
- 浏览器运行时解析 TTF
- 手写 JSON 对照表作为名称/码点真源
- 复制 SVG、下载单图标、Android / iOS 代码片段、字体文件下载页
- 为 Tina `IconGallery` block 改 schema（`categories` 忽略即可）
- OS5 独立字体；独立路由或新的 `/resources` 子站

## 约束与前提

| 项 | 约定 |
|----|------|
| 真源 | 用户交付的 **可变 TTF**（含 `wght` 轴）；放入 `icons/font/`，文件名以交付为准 |
| 元数据 | Unicode、语义名称、Glyph Index **只从字体表读取**（`cmap` / glyph name / GID），不另维护对照表 |
| 粗细 | 单一 variable font 的 `wght` 轴，页面用滑杆连续调节 |
| 颜色 | 黑 / 白 / 品牌色预设 + 自定义 hex |
| 复制 Unicode | 统一 `U+E001` 形式，不做格式切换 |
| Glyph Index | 展示；点击复制十进制数字 |
| 页面 URL | 仍为 `/docs/os4/resources/icons`；OS5 页挂同一组件 |
| 构建 | 生产 Docker 仍只跑 `npx next build`；manifest 与 web 字体必须提交进仓库 |

未交付生产 TTF 前，解析脚本可用最小 variable 夹具开发；交付后替换 `icons/font/` 并重跑 sync。

## 方案选型

采用 **构建时解析 TTF → JSON 清单 + 站点 `@font-face` 加载可变字体**。

- 解析：Node 脚本用 `fontkit` 读 `cmap`、glyph name、GID、`fvar.wght`
- 渲染：清单中的码点作为文本节点，套图标字体；`font-weight` / `font-variation-settings: "wght"` 驱动粗细
- Web 字体：sync 时产出 WOFF2 到 `public/fonts/`；转换失败则回退拷贝 TTF，保证画廊仍能加载
- 弃用：客户端 `opentype.js` 解包；手写 sidecar JSON；`next/font/local`（文件名随交付变化，不能写死）

## 页面结构

工具条（全局状态，作用于整表）：

| 控件 | 行为 |
|------|------|
| 搜索 | 过滤名称、Unicode、Glyph Index（见下） |
| 颜色 | 预设 `#111111` / `#FFFFFF` / `#FF6900`，加 hex 输入；非法 hex 保持上一合法值 |
| 粗细 | 滑杆；范围为清单 `font.weight.min–max`，缺省 100–900；默认 `font.weight.default` 或 400 |
| 字号 | 滑杆 16–64px，默认 32px |

卡片网格：

| 区域 | 行为 |
|------|------|
| 预览区 | 用图标字体渲染该字符；点击复制 **字符本身**（`String.fromCodePoint`） |
| 语义名称 | 只展示，不复制 |
| Unicode | 展示并复制 `U+E001`（大写，至少 4 位，不足补零） |
| Glyph Index | 展示十进制 GID；点击复制该数字字符串 |
| 反馈 | 被点中的项约 1.5s 显示「已复制」；失败显示「复制失败」 |

预览区背景按当前颜色相对亮度自动切换深/浅底，保证白图标可见。不做独立背景开关。

无匹配：空态「没有匹配的图标」。清单或字体缺失：明确提示，不空白死页。

`/resources` 图标入口文案从「复制名称与 SVG」改为字体图标预览（名称 / Unicode / Glyph Index）。MDX 页既有 `figmaFileKey` 可保留（跳转 Figma），不再作为 SVG 真源。

## 资产与清单

```text
icons/font/*.ttf              # 可变字体真源
icons/manifest.json           # sync 产物（提交）
public/fonts/<name>.woff2     # 站点 @font-face（提交；失败时可为 .ttf）
public/icons/manifest.json    # 清单一式副本，供 Tina / 客户端 fetch
```

`npm run icons:sync` 只做：解析 `icons/font/` → 写两份 manifest + 同步 web 字体。  
删除 `icons:import`、`icons/svg/` 与 `public/icons/` 下按分类存放的 SVG。不再把 SVG 当预览资源。

清单只收录 **有 Unicode 映射** 的 glyph，排除 `.notdef`。无 Unicode 的 GID 不进画廊。

```json
{
  "version": 2,
  "font": {
    "family": "HyperOS Symbol",
    "path": "/fonts/hyperos-symbol.woff2",
    "weight": { "min": 100, "max": 900, "default": 400 }
  },
  "icons": [
    { "id": "share", "name": "share", "unicode": "E001", "glyphIndex": 42 }
  ]
}
```

- `family` / `weight` / `path` 从字体与 sync 输出决定，不在组件里写死
- `id` 优先用 glyph name；无名则用 `gid-<glyphIndex>`
- `unicode` 存无前缀大写十六进制（如 `E001`），展示层再格式化为 `U+E001`

## 数据流

1. 将 TTF 放入 `icons/font/` 后执行 `npm run icons:sync`
2. Server Component（现有 `IconGalleryServer`）读 `icons/manifest.json`，交给客户端
3. 客户端用 `font.path` 注册一次 `@font-face`（`font-weight` 范围为 min–max，`font-style: normal`）
4. 预览节点：`font-family: <family>`、`font-weight` + `font-variation-settings: "wght" <n>`、`font-size`、`color`
5. Tina / 无 SSR manifest 时：仍 fetch `/icons/manifest.json`（与现逻辑兼容）

搜索规则（纯函数，可单测）：

- 查询先 trim，大小写不敏感
- 名称：子串匹配 `name` / `id`
- Unicode：去掉 `U+`、`u+`、`\u`、`0x` 后，按十六进制子串匹配 `unicode`
- Glyph Index：去掉非数字后，若仍有数字，则与 `String(glyphIndex)` 做子串匹配

## 组件边界

| 单元 | 职责 | 位置 |
|------|------|------|
| sync 脚本 | TTF → manifest + web 字体；不再处理 SVG | `scripts/generate-icon-manifest.mjs` |
| 清单类型与读取 | 类型、`getIconManifest()` | `src/lib/icons.ts` |
| 搜索 / Unicode 格式化 / 码点→字符 | 纯函数，供 UI 与单测 | `src/lib/icon-query.mjs`（与现有 `*.test.mjs` 同栈） |
| Server 包装 | 读清单、禁止缓存，hydrate 客户端 | `src/components/mdx/IconGalleryServer.tsx` |
| 画廊 UI | 工具条、网格、复制、`@font-face` | `src/components/mdx/IconGallery.tsx` |

Tina `categories` 忽略。不改 `tina/schema`。工程说明更新 `icons/README.md`、`AGENTS.md`（实现阶段）；**不**把本 spec 写进 `content/docs/`。

## 错误处理

| 失败 | 行为 |
|------|------|
| `icons/font/` 无 TTF / 非可变字体 / 无 `wght` | `icons:sync` 非零退出并打印原因 |
| 清单缺失或 JSON 非法 | 画廊提示无法加载清单 |
| `font.path` 404 | 预览区占位，字段仍可复制 |
| Clipboard API 失败 | 该项「复制失败」，其余卡片可用 |

## 验收

自动化（`node --test "src/**/*.test.mjs"`）：

- 搜索命中名称、`U+E001`、`e001`、Glyph Index；大小写与首尾空格不影响
- Unicode 复制格式恒为 `U+` + 至少 4 位大写十六进制
- 码点 → 单个字符
- 清单过滤：无 `.notdef`、无 Unicode 的 glyph 不出现

构建与回归：

- 有 TTF 时 `npm run icons:sync` 写出 manifest 与 `public/fonts/`
- `npm run build` 通过
- 旧 SVG 导入不再作为流程

手工：

1. 调颜色 / 粗细 / 字号，网格内字形同步变化
2. 点预览复制字符；点 Unicode 复制 `U+E001`；点 Glyph Index 复制数字；出现「已复制」
3. 选白色时预览区为深底，字形可见
4. 搜索三类字段均能过滤；无匹配有空态
5. 缺字体或清单时有提示，不是空白页

## 决策记录

- 真源：可变 TTF，构建时解析（非浏览器解析、非 sidecar JSON）
- 粗细：`wght` 连续滑杆（A）
- 颜色：预设黑 / 白 / 品牌橙 + hex（B）；品牌预设 `#FF6900`
- Glyph Index：展示且可复制数字（B）
- 搜索：名称 + Unicode + Glyph Index（C）
- 字号：全局滑杆 16–64px，默认 32（A）
- Unicode 复制：`U+E001`（A）
- 名称：只展示不复制
- 预览底：按颜色亮度自动深/浅，无背景开关
- 分类、SVG 管线、多色：本轮不做
