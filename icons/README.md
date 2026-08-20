# HyperOS 图标资产

本目录存放 **HyperOS Symbols 可变字体**（5 字重）与由 sync 生成的清单。

## 结构

    icons/font/*.ttf          # 真源（提交）
    icons/manifest.json       # icons:sync 生成（提交）
    public/fonts/             # web 字体（提交）
    public/icons/manifest.json

## 套件

| id | 标签 | 文件 |
|----|------|------|
| symbols | Symbols | HyperOSSymbolsVF.ttf |
| content-regular | Content Regular | HyperOSSymbols-Content-RegularVF.ttf |
| content-secondary | Content Secondary | HyperOSSymbols-Content-SecondaryVF.ttf |
| small | Small | HyperOSSymbols-SmallVF.ttf |
| small-dualtone | Small Dualtone | HyperOSSymbols-Small-DualtoneVF.ttf |

更换或升级字体：覆盖 `icons/font/` 对应文件后执行 `npm run icons:sync`。不要放入「10 字重」`*UIVF.ttf`。

## 命令

    npm run icons:sync

## 文档站预览

- 页面：`/docs/os4/resources/icons`
- 组件：`<IconGallery />`
