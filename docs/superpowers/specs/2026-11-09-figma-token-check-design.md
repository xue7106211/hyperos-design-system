# Figma Token 绑定检查 · 设计规格

> 状态：第一期（覆盖率）实现中 · 分支 `feat/figma-token-check` · 2026-11-09
> 共享类型：[`src/lib/token-check/types.ts`](../../../src/lib/token-check/types.ts)

## 1. 目标

设计师在站点工具页 `/tools/token-check` 贴入一个或多个 Figma 链接，得到一份检查报告：

- **覆盖率**：可绑定属性中，绑定到 HyperOS Design Token 库的比例，按类别拆分。
- **问题清单**：未绑定或绑定到非 HyperOS 库的属性，每条带图层路径、当前值和 Figma 跳转链接。默认「按修复」视图：同一类别、同一状态、同一取值归成一条（`src/lib/token-check/fix-groups.ts`），按影响面排序；「按图层」视图按检查目标和图层列出。
- **报告布局**：结论（覆盖率、四档数量、先改这几处）→ 问题清单 → 准确性检查 → 分布（按类别 / 按目标）→ 校对说明（统计口径、排除、待确认）；宽屏右侧页边栏放覆盖率小计、目录和导出。检查前页面只有输入框，出报告后输入收成一行。
- **准确性**（插件式）：第一期只有确定性的层级检查；作用域、值匹配、语义检查后续接入同一接口。
- 支持导出 Markdown。

不做：写回 Figma、自动替换。

### 1.1 复核（浏览器本地，`src/lib/token-check/review-state.ts` + `src/components/token-check/review-store.ts`）

- **收益**：每条修改标出「改完覆盖率 +x 个百分点」= 该组处数 ÷ 当前分母；「先改这几处」按此排序。
- **可点的比例条**：结论区未覆盖的三档（比例条与下方数量）可点，直接把问题清单筛到该档。
- **有意保留**：在「按修复」视图把整组标为有意保留，按「文件 + 节点 + 类别 + 字段」记在 localStorage（`tc-waivers:v1`）。被保留的属性移出问题清单和覆盖率分母（总体、类别、目标同步扣减），在校对说明「有意保留」里公开列出、可撤销，Markdown 导出单列一节，避免被用来刷高覆盖率。
- **与上次对比**：同一组检查目标（`fileKey:nodeId` 排序拼接）的上一次结果记在 `tc-history:v1`（最多 50 组），结论区显示待改处数和覆盖率百分点变化。对比用引擎原始口径，不受有意保留影响；同一份报告重复打开不会和自己比。
- **清零**：没有待改项时，结论区只留覆盖率和一句「每个值都有了出处」与检查时间。
- **键盘**：「按修复」视图 J / K 切换并展开，O 在 Figma 中打开当前组第一处；输入框内不触发。说明写在校对说明里，页面不显示键帽。

## 2. 第一期范围

| 做 | 后续 |
|----|------|
| 链接解析与节点类型校验 | L1 作用域检查（依赖库内 scopes 清理） |
| 排除：MIUIX 实例、插图 / 矢量、标注说明、隐藏图层 | L3 值匹配替换建议 |
| 6 类属性覆盖率 + 层级分布 | L4 语义检查（LLM + Ref 指南） |
| `reference-tier` 检查：直接绑定 Reference 层 | 前景 / 背景配对与对比度 |
| 报告 UI + Markdown 导出 | 检查历史、团队看板 |

## 3. 数据来源与架构

```
浏览器 /tools/token-check
  └─ POST /api/token-check { urls }
       ├─ Figma REST  GET /v1/files/:key/nodes?ids=…        节点树、boundVariables、styles、components
       ├─ Figma REST  GET /v1/files/:kitKey/components       MIUIX 已发布组件 key（内存缓存 1h）
       │              GET /v1/files/:kitKey/component_sets
       ├─ Token 库快照 tokens/figma/hyperos-design-token.snapshot.json（仓库内，离线导出）
       └─ 引擎（纯函数）→ TokenCheckReport
```

- **鉴权**：服务端环境变量 `FIGMA_ACCESS_TOKEN`（个人 PAT，需 `file_content:read`）。只能读该账号有权限的文件。
- **为什么要快照**：Variables REST API 需要 Enterprise 计划，小米是 Org 计划。所以变量定义（key、名称、scopes、描述、各模式值）通过 Figma MCP / Plugin API 离线导出进仓库。样式也一并放进快照，避免多一次请求。
- **MIUIX 识别**：实例节点的 `componentId` → 响应中 `components[id].key`（及 `componentSetId` → `componentSets[id].key`），与 UI Kit 已发布组件 key 比对。Kit 文件列表由 `TOKEN_CHECK_KIT_FILE_KEYS` 配置，默认 `7PVSm4yEbknNLFaqauI4EM`。
- **库绑定识别**：
  - 远程变量：`boundVariables.*.id` 形如 `VariableID:<key>/<localId>`，取 `/` 前的 key 查快照。
  - 本地变量：`VariableID:<n>:<m>`（无 `/`），记为 `other`。
  - 样式：`node.styles.{fill,stroke,text,effect}` → 响应 `styles[id].key` 查快照。

## 4. 输入校验

- 必须是 `figma.com/design/` 或 `/file/` 链接；`/branch/:branchKey/` 用 branchKey 作为 fileKey。
- 必须带 `node-id`（`1-2` 转 `1:2`）。
- 节点类型允许：`SECTION`、`FRAME`、`COMPONENT`、`COMPONENT_SET`、`GROUP`、`INSTANCE`。`CANVAS`（页面）与 `DOCUMENT` 拒绝，错误码 `unsupported-node-type`，提示“请在 Figma 中选中 Section 或 Frame，右键复制链接”。
- 单次最多 10 个链接；同一文件的多个节点合并成一次 `/nodes` 请求。
- 遍历节点上限 30,000，超出返回 `too-large`。

## 5. 排除规则

按顺序判定，命中即排除整棵子树（`hidden` 除外的子树也不再统计）：

1. **hidden**：`visible === false`。
2. **annotation**：
   - 名称命中 `/标注|说明|注释|备注|交互|annotation|redline|spec|note/i`；
   - 类型为 `STICKY`、`CONNECTOR`、`SHAPE_WITH_TEXT`、`WIDGET`、`EMBED`、`LINK_UNFURL`；
   - Section 的直接子级 `TEXT`（画板外的游离说明）。
3. **miuix-instance**：主组件 key 属于 MIUIX Kit。实例内部不统计，**但 `overrides` 中列出的 `fills` / `strokes` / `effects` / 文字样式 / 圆角 / 间距字段仍计入**，并标 `fromInstanceOverride`。
4. **illustration**：
   - 子树全部由矢量类节点组成（`VECTOR`、`BOOLEAN_OPERATION`、`STAR`、`LINE`、`ELLIPSE`、`REGULAR_POLYGON`、`POLYGON`、`RECTANGLE`），不含 `TEXT`，且至少 2 个矢量节点；同时路径类矢量（`VECTOR` / `BOOLEAN_OPERATION` / `STAR` / 多边形）占一半以上、子树内没有自动布局。矩形和圆拼出的控件（如滑条轨道）因此不会被误排除（2026-11-09 用 UI Kit Slider 实测修正）；
   - 或节点有 `IMAGE` 填充；
   - 或节点设置了 `exportSettings`；
   - 或名称命中 `/icon|illus|插图|插画|图标|logo|svg|img|image|pic/i`。
   - 只有单个矢量节点、名称无提示时不排除（多半是分割线或色块）。
5. **uncertain**（不排除，单列）：
   - `possible-illustration`：矢量节点占子树 ≥ 70% 但含文字；
   - `possible-detached-component`：非实例 FRAME 名称与 MIUIX 组件名完全一致。

非 MIUIX 的组件实例照常统计其内部节点。

## 6. 可绑定属性

| 类别 | 计入条件 | 视为已绑定 |
|------|----------|------------|
| `fill` | 非 TEXT 节点的可见 `SOLID` / `GRADIENT_*` 填充（逐个 paint） | `boundVariables.fills[i]` 或 `styles.fill` |
| `text-color` | TEXT 节点的可见填充 | 同上 |
| `stroke` | 可见描边且 `strokeWeight > 0` | `boundVariables.strokes[i]` 或 `styles.stroke` |
| `typography` | 每个 TEXT 节点 1 项 | `styles.text`，或 `fontSize` 等字体字段绑定变量 |
| `radius` | `cornerRadius > 0` 或任一 `rectangleCornerRadii > 0`，计 1 项；画板（Section 内的顶层 Frame，或父级未知的根 Frame）不计，它的圆角是设备屏幕外形；同时贴了外层目标时，内层根节点按它在外层里的真实父级判定 | `boundVariables` 中任一 `*Radius` |
| `spacing` | 自动布局容器：子级 ≥ 2 时的 `itemSpacing`，以及非 0 的四个 padding，各计 1 项 | `boundVariables.<field>` |

效果（阴影、模糊）不属于 Design Token 范围，不作为可绑定属性统计。

值为 0 的间距和圆角不计入。混合文字样式（`styleOverrideTable`）第一期按节点主样式计。

绑定状态分四档，优先级 `hyperos > legacy > other > unbound`：

| 状态 | 含义 |
|------|------|
| `hyperos` | 绑定到 HyperOS Design Token 库的变量或样式 |
| `legacy` | 绑定到 MIUIX UI Kit 的旧版变量（`1. feature token`、`2. color token`、`3.Radius token`、`4.Number Token`、`5.Types Token` 等），属于迁移问题 |
| `other` | 绑定了其他变量 / 样式（本地或第三方库） |
| `unbound` | 硬编码 |

覆盖率 = `hyperos / total`，`legacy`、`other`、`unbound` 都算未覆盖，但在报告中分开计数。

旧版 Kit 变量所在的集合已在 Kit 中删除，`getLocalVariablesAsync` 返回空，图层上的绑定仍有效。清单靠扫描 Kit 全部页面的绑定得到（2026-11-09：133 个），存于 `tokens/figma/miuix-kit-legacy-variables.json`；刷新见 `scripts/token-check/export-legacy-kit-variables.figma.js`。匹配规则：远程绑定按 key；检查 Kit 文件自身时按本地 id。旧版样式暂未识别。

## 7. 准确性检查接口

```ts
type AccuracyCheck = {
  id: string;
  run(props: BindableProperty[], ctx: CheckContext): Finding[] | Promise<Finding[]>;
};
```

`CheckContext` 提供快照索引、节点索引（父链、兄弟、文字内容）。检查器注册在 `src/lib/token-check/checks/index.ts`。

第一期：`reference-tier`，severity `warning`，对 `token.tier === 'reference'` 的属性提示“业务稿应绑定 Semantic 或 Component 层 Token”。若快照中有 Semantic Token 的 `aliasOf` 指向该 Reference Token，给出 `suggestion`。

后续语义检查（L4）的输入是该属性 + 节点上下文 + Ref 指南条目，输出 `Finding` 带 `confidence`；只依据 Ref 指南判断。

## 8. Token 库现状（2026-11-09 读取）

文件 `5gZYD8i6JqBvsaS7yvnO9c`，946 个变量，60 个文字样式，54 个颜色样式，26 个效果样式。

| 集合 | 数量 | 有描述 | 说明 |
|------|-----:|------:|------|
| Reference Token | 609 | 68 | 色板与基础数值，无别名；**全部对外发布** |
| Semantic Token | 156 | 121 | 描述质量高，含“用于 / 不要用于 / 与 X 二选一”，可直接作为 Ref 指南底稿 |
| Component Token | 181 | 59 | 描述多处复制错误（如 loading 的 text 描述写成“滑动条轨道底色”） |

对检查精度有影响的问题（需在 Figma 库侧修正）：

- 571 个 Reference、43 个 Semantic、174 个 Component 变量 scopes 为 `ALL_SCOPES`，L1 作用域检查暂时没有依据。
- Reference Token 未设 `hiddenFromPublishing`，设计师可以直接绑定色板。
- `codeSyntax` 为空。
- 库中命名为 `miuix_sys_*` / `miuix_comp_*`，与仓库 `tokens/*.json`（OS4 导出，`miuix_color_*`）不一致；检查器只认快照。

## 9. 配置

```bash
FIGMA_ACCESS_TOKEN="figd_..."               # 必填，服务端
TOKEN_CHECK_KIT_FILE_KEYS="7PVSm4yEbknNLFaqauI4EM"   # 逗号分隔
TOKEN_CHECK_ENABLED=true                    # false 时 API 返回 not-configured
```

## 10. 快照刷新

库更新后，在 Agent 中用 Figma MCP `use_figma` 运行 `scripts/token-check/export-library-snapshot.figma.js`（分段导出），合并写入 `tokens/figma/hyperos-design-token.snapshot.json` 并提交。步骤见脚本头部注释。

## 11. 验证

- `node --test "src/lib/token-check/**/*.test.mjs"`：链接解析、排除规则、属性提取、覆盖率、Markdown，用合成的 REST 响应 fixture。
- `npm run build`。
- 拿到 PAT 后用一个真实 Section 人工验收：抽查排除列表与 5 条问题链接。

## 值匹配（L3）与悬停详情卡

- 实现：`src/lib/token-check/nearest.ts`（纯函数，测试 `nearest.test.mjs`）。引擎在报告里写入 `suggestions`，key 为 `类别|取值`；演示页用同一函数现算。
- 候选池：已发布的 Semantic / Component 变量；Reference 层不推荐。颜色只和 Light 模式比较（默认业务稿按亮色绘制），叠到白底后算 OKLab 距离，透明度差另加 0.1 权重；上限 0.25。间距 / 圆角按作用域（GAP、CORNER_RADIUS 或 ALL_SCOPES）筛，差值上限 max(4, 25%)。
- 排序偏好：Token 名里的用途（`_color_text_` / `_color_fill_|_color_bg_` / `_color_stroke_`）和属性类别对不上 +0.03，日历 / 时钟 / 录音机专属分组 +0.01。只影响先后，界面会标「原用于文字」等。
- 无法比较的值（文字样式、渐变、四角不同的圆角）不写入 `suggestions`，卡片不显示这一段；写入空数组表示比较过但库里没有接近的值。
- 悬停卡（`DetailCards.tsx`）不下结论，按「出现在 / 库里最接近的值 / 切到暗色时」三段呈现；暗色对比用最接近的候选在两种主题底色上和写死值并排。
