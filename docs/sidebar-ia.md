# Docs 侧边栏目录对照（基于设计系统全景图）

> **状态**：已落地到 `content/docs/`；docs 侧栏不含「资源」一级（图标库在 `/icons`）；本文件为侧栏对照源  
> **日期**：2026-08-13  
> **来源**：HyperOS 设计系统全景图（经人工优化）  
> **约束**：
> - 保留现有站点 Index「HyperOS 4 Design System」
> - **每个一级目录**（通用设计标准 / 控件与组件 / … / 多端设备标准）下必须有 `index` 作为该模块总览
> - 侧栏已按本列表落地；后续改动请同步 `content/docs/os4/**/meta.json`
> - Landing「设计资源」入口 `/resources` **不属于** docs 侧栏；见 [information-architecture.md](./information-architecture.md)
> - 「抽屉浮窗」的 Code 侧正文 `containers/drawer-code.mdx` **故意不进侧栏 / `meta.json`**（Design / Code 双模 pilot；机制见 [technical-design.md §5.4](./technical-design.md)），本对照表中不体现

---

## 目标侧栏结构

```text
HyperOS 4 Design System          # 站点 Index（保留现有 /docs/os4）
├── 通用设计标准
│   ├── Index                    # 模块总览
│   ├── 设计理念
│   ├── 设计原则
│   ├── Design Token
│   ├── 布局
│   ├── 动效
│   ├── 文案指南
│   └── 包容性设计
│       ├── 无障碍设计
│       └── 国际化设计
├── 控件与组件
│   ├── Index                    # 模块总览
│   ├── 导航搜索
│   │   ├── 标题栏 Action Bar
│   │   ├── 分段按钮 Segmented Button
│   │   ├── 子页签 Tabs
│   │   ├── 搜索栏 Search Bar
│   │   ├── 侧边导航栏 Sidebar Navigation
│   │   ├── 导航栏 Navigation
│   │   ├── 底部工具栏 Bottom Toolbar
│   │   ├── 页面指示器 Page Indicator
│   │   ├── 索引 Index Bar
│   │   └── 滚动条 Scrollbar
│   ├── 菜单和操作
│   │   ├── 按钮 Button
│   │   ├── 行动操作按钮 Floating Action Button
│   │   ├── 菜单 Menu
│   │   └── 近手菜单 Near-hand Menu
│   ├── 选择和输入
│   │   ├── 开关 Switch
│   │   ├── 单选 Radio
│   │   ├── 多选 Checkbox
│   │   ├── 输入框 Text Field
│   │   ├── 日期/时间选择器 Date/Time Picker
│   │   ├── 滑动选择器 Slider
│   │   └── 图片选择器 Image Picker
│   ├── 容器类
│   │   ├── 对话框 Dialog
│   │   ├── 抽屉浮窗 Bottom Sheet
│   │   └── 提示条 Snackbar
│   └── 展示类
│       ├── 列表 List
│       ├── 卡片 Card
│       ├── 徽标 Badge
│       └── 空状态 Empty State
├── 人机交互标准
│   ├── Index                    # 模块总览
│   ├── 硬件按钮
│   ├── 触控手势
│   ├── 空间手势
│   ├── 走焦与选择（用于遥控或无障碍）
│   ├── 光标交互
│   ├── 键盘设备
│   ├── 鼠标设备
│   ├── 触控板设备
│   ├── 手写笔
│   ├── 表冠
│   └── 交互归一
├── 设计模式
│   ├── Index                    # 模块总览
│   ├── 页面模式
│   ├── 加载与刷新
│   ├── 下载
│   ├── 状态提示
│   ├── 启动
│   ├── 引导
│   ├── 资源选择
│   ├── 系统分享
│   ├── 自升级
│   ├── 系统能力衔接
│   └── 数据图表化
├── 系统特性与能力标准
│   ├── Index                    # 模块总览
│   ├── 搜索
│   ├── 新建（增）
│   ├── 编辑模式（选删改）
│   ├── 滚动视图
│   ├── 选择 picker（选）
│   ├── 系统分享
│   ├── 加载刷新
│   ├── 信息提示
│   ├── 系统体验
│   ├── 信息展示
│   ├── 权限申请
│   ├── 应用自升级（检查更新）
│   └── 框选反馈
└── 多端设备标准
    ├── Index                    # 模块总览
    ├── 设备特性发挥
    ├── 设备互通 / 跨设备协同
    └── 应用最佳实践
```

---

## 缩进列表（便于直接编辑）

- HyperOS 4 Design System（站点 Index，保留）
- 通用设计标准
  - Index（模块总览）
  - 设计理念
  - 设计原则
  - Design Token
  - 布局
  - 动效
  - 文案指南
  - 包容性设计
    - 无障碍设计
    - 国际化设计
- 控件与组件
  - Index（模块总览）
  - 导航搜索
    - 标题栏 Action Bar
    - 分段按钮 Segmented Button
    - 子页签 Tabs
    - 搜索栏 Search Bar
    - 侧边导航栏 Sidebar Navigation
    - 导航栏 Navigation
    - 底部工具栏 Bottom Toolbar
    - 页面指示器 Page Indicator
    - 索引 Index Bar
    - 滚动条 Scrollbar
  - 菜单和操作
    - 按钮 Button
    - 行动操作按钮 Floating Action Button
    - 菜单 Menu
    - 近手菜单 Near-hand Menu
  - 选择和输入
    - 开关 Switch
    - 单选 Radio
    - 多选 Checkbox
    - 输入框 Text Field
    - 日期/时间选择器 Date/Time Picker
    - 滑动选择器 Slider
    - 图片选择器 Image Picker
  - 容器类
    - 对话框 Dialog
    - 抽屉浮窗 Bottom Sheet
    - 提示条 Snackbar
  - 展示类
    - 列表 List
    - 卡片 Card
    - 徽标 Badge
    - 空状态 Empty State
- 人机交互标准
  - Index（模块总览）
  - 硬件按钮
  - 触控手势
  - 空间手势
  - 走焦与选择（用于遥控或无障碍）
  - 光标交互
  - 键盘设备
  - 鼠标设备
  - 触控板设备
  - 手写笔
  - 表冠
  - 交互归一
- 设计模式
  - Index（模块总览）
  - 页面模式
  - 加载与刷新
  - 下载
  - 状态提示
  - 启动
  - 引导
  - 资源选择
  - 系统分享
  - 自升级
  - 系统能力衔接
  - 数据图表化
- 系统特性与能力标准
  - Index（模块总览）
  - 搜索
  - 新建（增）
  - 编辑模式（选删改）
  - 滚动视图
  - 选择 picker（选）
  - 系统分享
  - 加载刷新
  - 信息提示
  - 系统体验
  - 信息展示
  - 权限申请
  - 应用自升级（检查更新）
  - 框选反馈
- 多端设备标准
  - Index（模块总览）
  - 设备特性发挥
  - 设备互通 / 跨设备协同
  - 应用最佳实践

---

## 与旧侧栏对照（迁移记录）

| 旧结构（os4） | 新结构（已落地） | 备注 |
|-------------|-----------------|------|
| Index：HyperOS 4 Design System | 保留 | 不改 title / 路由 |
| Foundations | 通用设计标准（`general/`） | 总览 / 理念 / 原则 / Token / 布局 / 动效 / 文案 / 包容性 |
| Icons | HyperOS 图标库（`/icons`，不在侧栏） | 独立页；入口改走 `/resources` |
| Components（actions / inputs / …） | 控件与组件（导航搜索 / 菜单和操作 / 选择和输入 / 容器类 / 展示类） | 分组与叶子页按本列表重划；中英对照见上 |
| Patterns | 系统特性与能力标准 / 展示类空状态等 | 旧路径 301 到 `system` 或对应组件页 |
| Resources | 设计模式（`best-practices/`） | 旧 Resources 页暂重定向至 best-practices；图标库不在侧栏一级 |
| （无） | 人机交互标准 | 新增一级 |
| （无） | 多端设备标准 | 新增一级；二级：设备特性发挥 / 设备互通与跨设备协同 / 应用最佳实践 |
| （无） | （已移出侧栏）资源 | 图标库页 `/icons`；设计资产入口为 `/resources` |
---

## 英文命名备注（可改）

以下英文名按现有文档 + 常见 DS 命名拟定，若与 HyperOS 官方英文不一致请直接改缩进列表：

| 中文 | 英文（草案） | 依据 |
|------|-------------|------|
| 标题栏 | Action Bar | 现有 `top-app-bar.mdx` |
| 行动操作按钮 | Floating Action Button | 现有 `floating-action-button.mdx` |
| 近手菜单 | Near-hand Menu | 暂无现页，可改为 Contextual Menu 等 |
| 抽屉浮窗 | Bottom Sheet | 含抽屉、浮窗、近手浮窗；落地页 `containers/drawer` |
| 提示条 | Snackbar | 现有 `snackbar.mdx`；若含 Banner 可再拆 |
| 索引 | Index Bar | 通讯录式字母索引常见名 |
| 滑动选择器 | Slider | 现有 `slider.mdx`；若指 Picker 滚轮可改为 Number Picker |

确认后的版本已用于：

1. 更新 `content/docs/os4/**/meta.json` 与目录（已落地）
2. 同步 `docs/information-architecture.md`
3. 处理旧路径重定向与 Tina collections

后续改侧栏请同步本文件与 `content/docs/os4/**/meta.json`。
