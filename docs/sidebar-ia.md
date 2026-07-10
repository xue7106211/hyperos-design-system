# Docs 侧边栏目录对照（基于设计系统全景图）

> **状态**：已落地到 `content/docs/`（2026-07-10）；本文件为侧栏对照源  
> **日期**：2026-07-10  
> **来源**：HyperOS 设计系统全景图（经人工优化）  
> **约束**：
> - 保留现有站点 Index「HyperOS 4 Design System」
> - **每个一级目录**（通用设计标准 / 控件与组件 / …）下必须有 `index` 作为该模块总览
> - 侧栏已按本列表落地；后续改动请同步 `content/docs/os4/**/meta.json`

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
│   │   ├── 标题栏 Top App Bar
│   │   ├── 分段按钮 Segmented Button
│   │   ├── 子页签 Tabs
│   │   ├── 搜索栏 Search Bar
│   │   ├── 侧边导航栏 Side Navigation
│   │   ├── 底部导航栏 Bottom Navigation
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
│   │   ├── 抽屉/浮窗 Drawer / Floating Panel
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
├── 多端设备标准
│   └── Index                    # 模块总览（暂无下级页）
└── 应用最佳实践标准
    └── Index                    # 模块总览（暂无下级页）
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
    - 标题栏 Top App Bar
    - 分段按钮 Segmented Button
    - 子页签 Tabs
    - 搜索栏 Search Bar
    - 侧边导航栏 Side Navigation
    - 底部导航栏 Bottom Navigation
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
    - 抽屉/浮窗 Drawer / Floating Panel
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
- 应用最佳实践标准
  - Index（模块总览）

---

## 与旧侧栏对照（迁移记录）

| 旧结构（os4） | 新结构（已落地） | 备注 |
|-------------|-----------------|------|
| Index：HyperOS 4 Design System | 保留 | 不改 title / 路由 |
| Foundations | 通用设计标准（`general/`） | 总览 / 理念 / 原则 / Token / 布局 / 动效 / 文案 / 包容性 |
| Components（actions / inputs / …） | 控件与组件（导航搜索 / 菜单和操作 / 选择和输入 / 容器类 / 展示类） | 分组与叶子页按本列表重划；中英对照见上 |
| Patterns | 系统特性与能力标准 / 展示类空状态等 | 旧路径 301 到 `system` 或对应组件页 |
| Resources | 应用最佳实践标准（`best-practices/`） | Figma 库等旧页暂重定向至模块 Index |
| （无） | 人机交互标准 | 新增一级 |
| （无） | 多端设备标准 | 新增一级，暂仅 Index |

---

## 英文命名备注（可改）

以下英文名按现有文档 + 常见 DS 命名拟定，若与 HyperOS 官方英文不一致请直接改缩进列表：

| 中文 | 英文（草案） | 依据 |
|------|-------------|------|
| 标题栏 | Top App Bar | 现有 `top-app-bar.mdx` |
| 行动操作按钮 | Floating Action Button | 现有 `floating-action-button.mdx` |
| 近手菜单 | Near-hand Menu | 暂无现页，可改为 Contextual Menu 等 |
| 抽屉/浮窗 | Drawer / Floating Panel | 双形态并列，落地时可拆页 |
| 提示条 | Snackbar | 现有 `snackbar.mdx`；若含 Banner 可再拆 |
| 索引 | Index Bar | 通讯录式字母索引常见名 |
| 滑动选择器 | Slider | 现有 `slider.mdx`；若指 Picker 滚轮可改为 Number Picker |

确认后的版本已用于：

1. 更新 `content/docs/os4/**/meta.json` 与目录（已落地）
2. 同步 `docs/information-architecture.md`
3. 处理旧路径重定向与 Tina collections

后续改侧栏请同步本文件与 `content/docs/os4/**/meta.json`。
