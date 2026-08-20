# 字体图标库（TTF / Variable Font）设计

日期：2026-08-20  
状态：待实现  
范围：`/docs/os4/resources/icons` 的 `<IconGallery />` 从 SVG 预览改为可变字体图标预览；OS5 图标页共用同一套

## 目标

文档站图标库以 **HyperOS Symbols 可变 TTF 为真源**（5 字重套件），在页面上渲染字体 glyph，并展示 / 复制 **语义名称、Unicode、Glyph Index**。全局可调 **颜色、粗细（`wght`）、字号**；可按 **套件** 筛选，并按名称 / Unicode / Glyph Index **搜索**。不再从 Figma 导出 SVG 再导入。

## 非目标（本轮不做）

- 从 Figma 拉 SVG、`icons:import`、按语义猜分类（操作/人/时间等）
- 「10 字重」UI 版 TTF（`*UIVF.ttf`）；轴范围相同，本轮只收 5 字重
- 按 Token 上色（semantic color 绑定）
- 浏览器运行时解析 TTF
- 手写 JSON 对照表作为名称/码点真源
- 复制 SVG、下载单图标、Android / iOS 代码片段、字体文件下载页
- 为 Tina `IconGallery` block 改 schema（`categories` 忽略即可）
- OS5 独立字体；独立路由或新的 `/resources` 子站
- 为 COLR 图层做独立调色（主套 `HyperOSSymbolsVF` 含 COLR/CPAL；全局 `color` 仍作用于非彩色轮廓）

## 约束与前提

| 项 | 约定 |
|----|------|
| 真源 | `icons/font/` 下 **5 份** 可变 TTF，均含 `wght` 轴（150–700） |
| 元数据 | Unicode、语义名称、Glyph Index **只从字体表读取**（`cmap` / glyph name / GID） |
| 粗细 | 全局 `wght` 滑杆；5 份字体共用同一轴范围 |
| 套件 | 工具条：全部 + 5 个字体；默认「全部」 |
| 颜色 | 黑 / 白 / 品牌色预设 + 自定义 hex |
| 复制 Unicode | `U+` + 大写十六进制，至少 4 位（实际码点为 `U+F0000` 起） |
| Glyph Index | 展示并复制十进制数字；GID **按字体分别计数**，跨套件会重复 |
| 页面 URL | 仍为 `/docs/os4/resources/icons`；OS5 页挂同一组件 |
| 构建 | 生产 Docker 仍只跑 `npx next build`；manifest 与 web 字体必须提交进仓库 |

实测：5 份字体码点 **互不重叠**，合计约 **947** 个图标（不含 space / nbsp）。

## 方案选型

采用 **构建时解析全部 TTF → JSON 清单 + 站点为每个套件注册 `@font-face`**。

- 解析：Node 脚本用 `fontkit`（或 `fonttools`）读每份字体的 `cmap`、glyph name、GID、`fvar.wght`
- 渲染：清单中的码点作为文本节点，套对应套件的 `font-family`
- Web 字体：sync 时每份产出 WOFF2 到 `public/fonts/`；转换失败则回退拷贝该份 TTF
- 弃用：客户端解包 TTF；手写 sidecar JSON；`next/font/local`

## 页面结构

工具条（全局状态）：

| 控件 | 行为 |
|------|------|
| 套件 | `全部` + 下表 5 项；默认 `全部`；与搜索同时生效（先套件后搜索） |
| 搜索 | 在当前套件结果里过滤名称、Unicode、Glyph Index |
| 颜色 | 预设 `#111111` / `#FFFFFF` / `#FF6900`，加 hex 输入；非法 hex 保持上一合法值 |
| 粗细 | 滑杆 150–700（取各字体 `wght` 的并集；当前均为 150–700）；默认 330 |
| 字号 | 滑杆 16–64px，默认 32px |

套件与文件对应（标签固定，不在 UI 里写文件名）：

| id | 标签 | 文件 |
|----|------|------|
| `symbols` | Symbols | `HyperOSSymbolsVF.ttf` |
| `content-regular` | Content Regular | `HyperOSSymbols-Content-RegularVF.ttf` |
| `content-secondary` | Content Secondary | `HyperOSSymbols-Content-SecondaryVF.ttf` |
| `small` | Small | `HyperOSSymbols-SmallVF.ttf` |
| `small-dualtone` | Small Dualtone | `HyperOSSymbols-Small-DualtoneVF.ttf` |

卡片网格：

| 区域 | 行为 |
|------|------|
| 预览区 | 用 **该图标所属套件** 的字体渲染；点击复制字符本身（`String.fromCodePoint`） |
| 套件名 | 「全部」时展示套件标签；单套件视图下省略 |
| 语义名称 | 只展示，不复制 |
| Unicode | 展示并复制 `U+F0000` 形式 |
| Glyph Index | 展示十进制 GID；点击复制数字字符串 |
| 反馈 | 被点中的项约 1.5s 显示「已复制」；失败显示「复制失败」 |

预览区背景按当前颜色相对亮度自动切换深/浅底。不做独立背景开关。

无匹配：空态「没有匹配的图标」。清单或字体缺失：明确提示，不空白死页。

`/resources` 图标入口文案从「复制名称与 SVG」改为字体图标预览。MDX 既有 `figmaFileKey` 可保留，不再作为 SVG 真源。

## 资产与清单

```text
icons/font/HyperOSSymbolsVF.ttf
icons/font/HyperOSSymbols-Content-RegularVF.ttf
icons/font/HyperOSSymbols-Content-SecondaryVF.ttf
icons/font/HyperOSSymbols-SmallVF.ttf
icons/font/HyperOSSymbols-Small-DualtoneVF.ttf
icons/manifest.json
public/fonts/<stem>.woff2     # 每份一文件；失败时可为 .ttf
public/icons/manifest.json
```

`npm run icons:sync` 解析 `icons/font/*.ttf` → 写两份 manifest + 同步全部 web 字体。
删除 `icons:import`、`icons/svg/` 与 `public/icons/` 下按分类存放的 SVG。

清单只收录有 Unicode 映射的 glyph；排除 `.notdef`、`U+0020`、`U+00A0`。

```json
{
  "version": 2,
  "fonts": [
    {
      "id": "symbols",
      "label": "Symbols",
      "family": "HyperOS Symbols VF",
      "path": "/fonts/HyperOSSymbolsVF.woff2",
      "weight": { "min": 150, "max": 700, "default": 330 }
    }
  ],
  "icons": [
    {
      "id": "symbols.reset",
      "fontId": "symbols",
      "name": "reset",
      "unicode": "F0000",
      "glyphIndex": 1
    }
  ]
}
```

- `fonts[].family` / `weight` / `path` 从字体与 sync 输出决定
- `id` 为 `{fontId}.{glyphName}`；glyph name 缺失或为 `uXXXX` 时仍用该 name，空则 `gid-<glyphIndex>`
- `unicode` 存无前缀大写十六进制；展示层格式化为 `U+F0000`（不足 4 位补零，超过 4 位不截断）
- 每条 icon 必须有 `fontId`，预览与 GID 都相对该字体

## 数据流

1. TTF 已在 `icons/font/`；执行 `npm run icons:sync`
2. `IconGalleryServer` 读 `icons/manifest.json`，交给客户端
3. 客户端为 `fonts[]` 各注册一次 `@font-face`（`font-weight: 150 700`）
4. 预览节点使用该 icon 的 `font.family` + 全局 `wght` / 字号 / 颜色
5. Tina / 无 SSR 时仍 fetch `/icons/manifest.json`

搜索规则（纯函数，可单测）：

- 先按 `fontId` 过滤（`all` 不过滤）
- 查询 trim，大小写不敏感
- 名称：子串匹配 `name` / `id`
- Unicode：去掉 `U+`、`u+`、`\u`、`0x` 后，按十六进制子串匹配 `unicode`
- Glyph Index：去掉非数字后，若仍有数字，则与 `String(glyphIndex)` 做子串匹配（「全部」下同一 GID 可命中多套件）

## 组件边界

| 单元 | 职责 | 位置 |
|------|------|------|
| sync 脚本 | 多 TTF → manifest + web 字体；不再处理 SVG | `scripts/generate-icon-manifest.mjs` |
| 清单类型与读取 | 类型、`getIconManifest()` | `src/lib/icons.ts` |
| 套件过滤 / 搜索 / Unicode 格式化 / 码点→字符 | 纯函数 | `src/lib/icon-query.ts` |
| Server 包装 | 读清单、禁止缓存 | `src/components/mdx/IconGalleryServer.tsx` |
| 画廊 UI | 套件切换、工具条、网格、复制、`@font-face` | `src/components/mdx/IconGallery.tsx` |

Tina `categories` 忽略。不改 `tina/schema`。实现阶段更新 `icons/README.md`、`AGENTS.md`；**不**把本 spec 写进 `content/docs/`。

## 错误处理

| 失败 | 行为 |
|------|------|
| `icons/font/` 无 TTF / 某文件非可变字体 / 无 `wght` | `icons:sync` 非零退出并打印文件名与原因 |
| 清单缺失或 JSON 非法 | 画廊提示无法加载清单 |
| 某个 `font.path` 404 | 该套件卡片预览占位，字段仍可复制；其他套件正常 |
| Clipboard API 失败 | 该项「复制失败」，其余卡片可用 |

## 验收

自动化（`node --test "src/**/*.test.mjs"`）：

- 套件过滤：`all` 返回全部；指定 `fontId` 只返回该套件
- 搜索命中名称、`U+F0000`、`f0000`、Glyph Index；大小写与首尾空格不影响
- Unicode 复制格式恒为 `U+` + 至少 4 位大写十六进制（五位码点保持五位）
- 码点 → 单个字符
- 清单过滤：无 `.notdef`、无 space/nbsp、无 Unicode 的 glyph 不出现

构建与回归：

- `npm run icons:sync` 写出含 `fonts[]` 的 manifest 与 `public/fonts/` 下全部 web 字体
- `npm run build` 通过
- 旧 SVG 导入不再作为流程

手工：

1. 切换套件（含全部），网格内容与卡片字体对应
2. 调颜色 / 粗细 / 字号，当前可见字形同步变化
3. 点预览复制字符；点 Unicode 复制 `U+F0000` 形式；点 Glyph Index 复制数字
4. 选白色时预览区为深底，字形可见
5. 「全部」下卡片能看出所属套件；单套件下不重复显示套件名
6. 搜索三类字段均能过滤；无匹配有空态
7. 缺字体或清单时有提示，不是空白页

## 决策记录

- 真源：5 份 5 字重可变 TTF（非 10 字重 UI 版、非浏览器解析、非 sidecar JSON）
- 套件组织：工具条 5 个字体 +「全部」，默认全部（B）
- 粗细：`wght` 连续滑杆 150–700，默认 330（A）；不按 named instance 步进
- 颜色：预设黑 / 白 / 品牌橙 + hex（B）；品牌预设 `#FF6900`
- Glyph Index：展示且可复制数字（B）；跨套件 GID 可重复
- 搜索：名称 + Unicode + Glyph Index（C）；作用在当前套件上
- 字号：全局滑杆 16–64px，默认 32（A）
- Unicode 复制：`U+` 前缀大写十六进制（A）；码点实为 SMP PUA `U+F0000+`
- 名称：只展示不复制
- 预览底：按颜色亮度自动深/浅
- 语义分类、SVG 管线：本轮不做
