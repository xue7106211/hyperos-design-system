# HyperOS 图标资产

本目录存放文档站图标预览的 **源 SVG** 与索引。

## 结构

```text
icons/
  svg/{category}/{name}.svg   # 源文件（提交到仓库）
  manifest.json               # 由 icons:sync 生成（提交）
public/icons/                 # 同步产物，供站点静态访问（提交）
```

## 约定

- 文件路径：`icons/svg/{category}/{name}.svg`
- 稳定 ID：`{category}.{name}`（例如 `action.share`）
- 单色图标：优先 `fill="currentColor"` / `stroke="currentColor"`（sync 会把 `fill="black"` 规范化）
- 多色图标：保留原色；manifest 中标记 `multicolor: true`

## 命令

```bash
# 从扁平导出目录导入（按文件名启发式分类）并生成 manifest
npm run icons:import -- /path/to/exported-svgs

# 指定分类导入（例如「时间」「人」文件夹）
npm run icons:import -- /path/to/时间 --category time
npm run icons:import -- /path/to/人 --category people

# 仅根据 icons/svg 重新生成 manifest + public/icons
npm run icons:sync
```

> 仅支持 **SVG**。PNG 等栅格文件会被跳过，需先从 Figma 导出为 SVG。

人工补充的 `tags` / `label`（categories）会在再次 sync 时保留（按 icon `id` 合并）。

## 文档站预览

- 页面：[`/docs/os4/resources/icons`](../content/docs/os4/resources/icons.mdx)（侧栏「资源」→ HyperOS 图标库）
- 组件：`<IconGallery />`（可选 `categories` 过滤）
