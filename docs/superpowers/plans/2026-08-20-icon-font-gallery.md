# 字体图标库画廊 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `/docs/os4/resources/icons` 的 `<IconGallery />` 从 SVG 预览改成 HyperOS Symbols 可变字体画廊：5 个套件 +「全部」、搜索、全局颜色/粗细/字号、复制字符 / `U+F0000` / Glyph Index。

**Architecture:** 构建时用 `fontkit` 解析 `icons/font/*.ttf`，写出 v2 `manifest.json`（`fonts[]` + 带 `fontId` 的 `icons[]`），并把 web 字体同步到 `public/fonts/`。页面用 `@font-face` 渲染文本 glyph；搜索、Unicode 格式化、套件过滤是 `src/lib/icon-query.ts` 里的纯函数。

**Tech Stack:** Next.js App Router · React 19 · `fontkit` · `ttf2woff2`（失败则拷贝 TTF）· Node `node:test` · 现有 Fumadocs `fd-*` token

**Spec:** [docs/superpowers/specs/2026-08-20-icon-font-gallery-design.md](../specs/2026-08-20-icon-font-gallery-design.md)

## Global Constraints

- 真源仅 `icons/font/` 下 5 份 5 字重 VF；不收「10 字重」`*UIVF.ttf`
- 元数据只从字体表读；不写 sidecar 对照表；不在浏览器解析 TTF
- Unicode 复制恒为 `U+` + 大写十六进制（至少 4 位，五位码点保持五位）
- 粗细滑杆 150–700，默认 330；字号 16–64px，默认 32
- 颜色预设 `#111111` / `#FFFFFF` / `#FF6900` + hex；非法 hex 保持上一合法值
- 名称只展示不复制；Glyph Index 复制十进制数字
- 默认套件 `all`；单套件视图不显示套件名，「全部」时卡片显示套件标签
- Tina `categories` 忽略；不改 `tina/schema`
- 生产 Docker 仍只跑 `npx next build`；manifest 与 web 字体必须提交
- 包管理器 npm；Commit 仅当用户要求：中文 Conventional Commits；`git -c user.email="xueyifei1@xiaomi.com"`

## File Structure

| 文件 | 职责 |
|------|------|
| `src/lib/icon-query.ts` | 套件过滤、搜索、Unicode 格式化、码点→字符、hex 校验、预览底对比色 |
| `src/lib/icon-query.test.mjs` | 上述纯函数单测 |
| `src/lib/icons.ts` | v2 清单类型 + `getIconManifest()` |
| `scripts/generate-icon-manifest.mjs` | 多 TTF → manifest + `public/fonts/` |
| `src/components/mdx/IconGallery.tsx` | 套件切换、工具条、网格、复制、`@font-face` |
| `src/components/mdx/IconGalleryServer.tsx` | 读清单 hydrate 客户端（忽略 `categories`） |
| `icons/font/*.ttf` | 已入库的 5 份真源（本计划不再复制） |
| `icons/manifest.json` / `public/icons/manifest.json` | sync 产物 |
| `public/fonts/*` | web 字体 |
| `icons/README.md`、`AGENTS.md`、`README.md`、`package.json` | 下线 SVG 管线说明 |
| `src/lib/resources.ts`、`content/docs/os4/resources/icons.mdx`、`content/docs/os5/resources/icons.mdx` | 文案 |

**依赖（Task 3 安装）：** `fontkit`（dependencies，sync 脚本用）、`ttf2woff2`（dependencies）

**删除：** `icons:import` script、`icons/svg/**`、`public/icons/` 下分类 SVG（保留新的 `manifest.json`）

---

### Task 1: 查询与格式化纯函数（TDD）

**Files:**
- Create: `src/lib/icon-query.ts`
- Create: `src/lib/icon-query.test.mjs`

**Interfaces:**
- Consumes: 无
- Produces:
  - `export const ALL_FONTS = 'all'`
  - `export const COLOR_PRESETS = [{ id, hex, label }]`
  - `export function formatUnicode(hex: string): string`
  - `export function codePointToChar(hex: string): string`
  - `export function parseHexColor(input: string, fallback: string): string`
  - `export function previewSurfaceHex(hex: string): string` — 相对亮度 > 0.6 返回 `#1A1A1A`，否则 `#F5F5F5`
  - `export function filterIcons(icons, { fontId, query }): icons`

- [ ] **Step 1: 写失败单测**

创建 `src/lib/icon-query.test.mjs`：

```js
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ALL_FONTS,
  codePointToChar,
  filterIcons,
  formatUnicode,
  parseHexColor,
  previewSurfaceHex,
} from './icon-query.ts';

const sample = [
  { id: 'symbols.reset', fontId: 'symbols', name: 'reset', unicode: 'F0000', glyphIndex: 1 },
  { id: 'symbols.play', fontId: 'symbols', name: 'play', unicode: 'F0002', glyphIndex: 3 },
  { id: 'small.uF02AA', fontId: 'small', name: 'uF02AA', unicode: 'F02AA', glyphIndex: 1 },
];

describe('formatUnicode', () => {
  it('pads to at least 4 uppercase hex digits with U+ prefix', () => {
    assert.equal(formatUnicode('E1'), 'U+00E1');
    assert.equal(formatUnicode('f0000'), 'U+F0000');
    assert.equal(formatUnicode('F0000'), 'U+F0000');
  });
});

describe('codePointToChar', () => {
  it('maps hex to a single character', () => {
    assert.equal(codePointToChar('F0000'), String.fromCodePoint(0xf0000));
  });
});

describe('parseHexColor', () => {
  it('accepts #rrggbb and rrggbb, keeps last valid on junk', () => {
    assert.equal(parseHexColor('#ff6900', '#111111'), '#FF6900');
    assert.equal(parseHexColor('111111', '#FF6900'), '#111111');
    assert.equal(parseHexColor('zzz', '#111111'), '#111111');
  });
});

describe('previewSurfaceHex', () => {
  it('uses a dark tile for light glyphs', () => {
    assert.equal(previewSurfaceHex('#FFFFFF'), '#1A1A1A');
    assert.equal(previewSurfaceHex('#111111'), '#F5F5F5');
  });
});

describe('filterIcons', () => {
  it('returns all when fontId is all and query is empty', () => {
    assert.equal(filterIcons(sample, { fontId: ALL_FONTS, query: '' }).length, 3);
  });

  it('filters by fontId', () => {
    const hits = filterIcons(sample, { fontId: 'small', query: '' });
    assert.deepEqual(hits.map((i) => i.id), ['small.uF02AA']);
  });

  it('matches name, U+F0000, f0000, and glyph index', () => {
    assert.equal(filterIcons(sample, { fontId: ALL_FONTS, query: 'RESET' })[0].name, 'reset');
    assert.equal(filterIcons(sample, { fontId: ALL_FONTS, query: 'U+F0000' })[0].name, 'reset');
    assert.equal(filterIcons(sample, { fontId: ALL_FONTS, query: ' f0000 ' })[0].name, 'reset');
    assert.equal(filterIcons(sample, { fontId: 'symbols', query: '3' })[0].name, 'play');
  });
});
```

- [ ] **Step 2: 跑测，确认失败**

Run:

```bash
node --test src/lib/icon-query.test.mjs
```

Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 `src/lib/icon-query.ts`**

```js
export const ALL_FONTS = 'all';

export const COLOR_PRESETS = [
  { id: 'black', hex: '#111111', label: '黑' },
  { id: 'white', hex: '#FFFFFF', label: '白' },
  { id: 'brand', hex: '#FF6900', label: '品牌' },
];

export function formatUnicode(hex) {
  const h = String(hex)
    .replace(/^U\+/i, '')
    .replace(/^0x/i, '')
    .toUpperCase();
  return `U+${h.padStart(4, '0')}`;
}

export function codePointToChar(hex) {
  return String.fromCodePoint(Number.parseInt(String(hex).replace(/^U\+/i, ''), 16));
}

export function parseHexColor(input, fallback) {
  const m = String(input)
    .trim()
    .match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return fallback;
  return `#${m[1].toUpperCase()}`;
}

export function previewSurfaceHex(hex) {
  const raw = parseHexColor(hex, '#111111').slice(1);
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.6 ? '#1A1A1A' : '#F5F5F5';
}

function normalizeHexQuery(query) {
  return query
    .trim()
    .toLowerCase()
    .replace(/^(u\+|\\u|0x)/, '')
    .replace(/[^0-9a-f]/g, '');
}

function digitQuery(query) {
  return query.replace(/\D/g, '');
}

export function filterIcons(icons, { fontId = ALL_FONTS, query = '' } = {}) {
  const suite =
    fontId && fontId !== ALL_FONTS
      ? icons.filter((icon) => icon.fontId === fontId)
      : icons;

  const q = query.trim().toLowerCase();
  if (!q) return suite;

  const hexQ = normalizeHexQuery(q);
  const digits = digitQuery(q);

  return suite.filter((icon) => {
    if (icon.name.toLowerCase().includes(q) || icon.id.toLowerCase().includes(q)) {
      return true;
    }
    if (hexQ && icon.unicode.toLowerCase().includes(hexQ)) return true;
    if (digits && String(icon.glyphIndex).includes(digits)) return true;
    return false;
  });
}
```

- [ ] **Step 4: 再跑测**

Run:

```bash
node --test src/lib/icon-query.test.mjs
```

Expected: PASS（全部 tests）

- [ ] **Step 5: Commit（仅用户要求时）**

```bash
git add src/lib/icon-query.ts src/lib/icon-query.test.mjs
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
test: 为字体图标搜索与 Unicode 格式化补纯函数单测

EOF
)"
```

---

### Task 2: 清单 TypeScript 类型

**Files:**
- Modify: `src/lib/icons.ts`（整文件替换类型；保留 `getIconManifest()`）

**Interfaces:**
- Consumes: `icons/manifest.json`（Task 3 才会写成 v2；本任务只改类型）
- Produces:
  - `export type IconFontWeight = { min: number; max: number; default: number }`
  - `export type IconFont = { id: string; label: string; family: string; path: string; weight: IconFontWeight }`
  - `export type IconEntry = { id: string; fontId: string; name: string; unicode: string; glyphIndex: number }`
  - `export type IconManifest = { version: number; generatedAt?: string; fonts: IconFont[]; icons: IconEntry[] }`
  - 删除 `IconCategory`、旧 `path` / `category` / `multicolor`

- [ ] **Step 1: 替换 `src/lib/icons.ts`**

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type IconFontWeight = {
  min: number;
  max: number;
  default: number;
};

export type IconFont = {
  id: string;
  label: string;
  family: string;
  path: string;
  weight: IconFontWeight;
};

export type IconEntry = {
  id: string;
  fontId: string;
  name: string;
  unicode: string;
  glyphIndex: number;
};

export type IconManifest = {
  version: number;
  generatedAt?: string;
  fonts: IconFont[];
  icons: IconEntry[];
};

/** Always read from disk so `icons:sync` is visible without restarting the server. */
export function getIconManifest(): IconManifest {
  const path = join(process.cwd(), 'icons', 'manifest.json');
  const raw = readFileSync(path, 'utf8');
  return JSON.parse(raw) as IconManifest;
}
```

- [ ] **Step 2: 确认旧 SVG 字段已从类型消失**

Run:

```bash
rg "multicolor|IconCategory|category:" src/lib/icons.ts src/components/mdx/IconGallery.tsx || true
```

Expected: `icons.ts` 无旧字段。`IconGallery.tsx` 此时仍引用旧类型，Task 4 会改；本任务不修 UI。

- [ ] **Step 3: Commit（仅用户要求时）**

```bash
git add src/lib/icons.ts
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
refactor: 将图标清单类型改为多套件字体结构

EOF
)"
```

---

### Task 3: 重写 `icons:sync` 并生成 v2 清单

**Files:**
- Modify: `package.json` / `package-lock.json`（安装 `fontkit`、`ttf2woff2`）
- Modify: `scripts/generate-icon-manifest.mjs`（整文件重写）
- Modify: `package.json` scripts：删除 `icons:import`
- Create via script: `icons/manifest.json`、`public/icons/manifest.json`、`public/fonts/*`

**Interfaces:**
- Consumes: `icons/font/*.ttf`；`fontkit.openSync`；`font.familyName`、`font.characterSet`、`font.glyphForCodePoint(cp)`、`glyph.id`、`glyph.name`、`font.variationAxes.wght`
- Produces: spec 中的 v2 manifest；每个已知 TTF 一份 `/fonts/<stem>.woff2`（失败则为 `.ttf`）

已知文件映射（写死，避免误收 10 字重）：

```js
const FONT_FILES = {
  'HyperOSSymbolsVF.ttf': { id: 'symbols', label: 'Symbols' },
  'HyperOSSymbols-Content-RegularVF.ttf': { id: 'content-regular', label: 'Content Regular' },
  'HyperOSSymbols-Content-SecondaryVF.ttf': {
    id: 'content-secondary',
    label: 'Content Secondary',
  },
  'HyperOSSymbols-SmallVF.ttf': { id: 'small', label: 'Small' },
  'HyperOSSymbols-Small-DualtoneVF.ttf': {
    id: 'small-dualtone',
    label: 'Small Dualtone',
  },
};
```

跳过码点：`0x20`、`0xA0`；跳过 glyph name `.notdef`。

- [ ] **Step 1: 安装依赖**

Run:

```bash
npm install fontkit ttf2woff2
```

Expected: `package.json` dependencies 出现两者；lockfile 更新。

- [ ] **Step 2: 重写 `scripts/generate-icon-manifest.mjs`**

完整文件：

```js
#!/usr/bin/env node
/**
 * Parse icons/font/*.ttf → icons/manifest.json + public/fonts + public/icons/manifest.json
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const fontkit = require('fontkit');
const ttf2woff2 = require('ttf2woff2');

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FONT_DIR = join(ROOT, 'icons', 'font');
const MANIFEST_PATH = join(ROOT, 'icons', 'manifest.json');
const PUBLIC_MANIFEST = join(ROOT, 'public', 'icons', 'manifest.json');
const PUBLIC_FONTS = join(ROOT, 'public', 'fonts');

const SKIP_CODEPOINTS = new Set([0x20, 0xa0]);

const FONT_FILES = {
  'HyperOSSymbolsVF.ttf': { id: 'symbols', label: 'Symbols' },
  'HyperOSSymbols-Content-RegularVF.ttf': { id: 'content-regular', label: 'Content Regular' },
  'HyperOSSymbols-Content-SecondaryVF.ttf': {
    id: 'content-secondary',
    label: 'Content Secondary',
  },
  'HyperOSSymbols-SmallVF.ttf': { id: 'small', label: 'Small' },
  'HyperOSSymbols-Small-DualtoneVF.ttf': {
    id: 'small-dualtone',
    label: 'Small Dualtone',
  },
};

function fail(message) {
  console.error(message);
  process.exit(1);
}

function glyphNameOf(glyph, codePoint) {
  const name = glyph?.name;
  if (name && name !== '.notdef') return name;
  return `gid-${glyph.id}`;
}

function writeWebFont(ttfPath, stem) {
  mkdirSync(PUBLIC_FONTS, { recursive: true });
  const ttf = readFileSync(ttfPath);
  const woff2Path = join(PUBLIC_FONTS, `${stem}.woff2`);
  try {
    writeFileSync(woff2Path, ttf2woff2(ttf));
    return `/fonts/${stem}.woff2`;
  } catch (err) {
    console.warn(`woff2 failed for ${stem}, falling back to ttf:`, err.message);
    const ttfOut = join(PUBLIC_FONTS, `${stem}.ttf`);
    copyFileSync(ttfPath, ttfOut);
    return `/fonts/${stem}.ttf`;
  }
}

function parseFontFile(fileName) {
  const meta = FONT_FILES[fileName];
  const ttfPath = join(FONT_DIR, fileName);
  const font = fontkit.openSync(ttfPath);
  const wght = font.variationAxes?.wght;
  if (!wght) {
    fail(`${fileName}: missing wght axis (not a variable font?)`);
  }

  const stem = basename(fileName, '.ttf');
  const path = writeWebFont(ttfPath, stem);
  const family = font.familyName || stem;

  const icons = [];
  for (const cp of font.characterSet) {
    if (SKIP_CODEPOINTS.has(cp)) continue;
    const glyph = font.glyphForCodePoint(cp);
    if (!glyph || glyph.name === '.notdef') continue;
    const name = glyphNameOf(glyph, cp);
    icons.push({
      id: `${meta.id}.${name}`,
      fontId: meta.id,
      name,
      unicode: cp.toString(16).toUpperCase(),
      glyphIndex: glyph.id,
    });
  }

  icons.sort((a, b) => a.unicode.localeCompare(b.unicode, 'en'));

  return {
    font: {
      id: meta.id,
      label: meta.label,
      family,
      path,
      weight: {
        min: wght.min,
        max: wght.max,
        default: wght.default,
      },
    },
    icons,
  };
}

function main() {
  if (!existsSync(FONT_DIR)) fail(`Missing ${FONT_DIR}`);

  const listed = readdirSync(FONT_DIR).filter((f) => extname(f).toLowerCase() === '.ttf');
  for (const extra of listed) {
    if (!FONT_FILES[extra]) {
      console.warn(`skip unrecognized ttf: ${extra}`);
    }
  }

  const required = Object.keys(FONT_FILES);
  for (const name of required) {
    if (!existsSync(join(FONT_DIR, name))) fail(`Missing ${name} in icons/font/`);
  }

  if (existsSync(PUBLIC_FONTS)) rmSync(PUBLIC_FONTS, { recursive: true, force: true });
  mkdirSync(join(ROOT, 'public', 'icons'), { recursive: true });

  const fonts = [];
  const icons = [];
  for (const name of required) {
    const parsed = parseFontFile(name);
    fonts.push(parsed.font);
    icons.push(...parsed.icons);
  }

  const manifest = {
    version: 2,
    generatedAt: new Date().toISOString(),
    fonts,
    icons,
  };
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(MANIFEST_PATH, json, 'utf8');
  writeFileSync(PUBLIC_MANIFEST, json, 'utf8');
  console.log(`Wrote ${icons.length} icon(s), ${fonts.length} font(s) → icons/manifest.json`);
}

main();
```

若 `require('fontkit')` 实际导出 `{ openSync }`，把 `fontkit.openSync` 改成：

```js
const openSync = fontkit.openSync ?? fontkit.default?.openSync ?? fontkit;
```

- [ ] **Step 3: 删除 `icons:import`**

在 `package.json` 的 `scripts` 中删除 `icons:import` 那一行。保留 `"icons:sync": "node scripts/generate-icon-manifest.mjs"`。

- [ ] **Step 4: 跑 sync**

Run:

```bash
npm run icons:sync
```

Expected: 退出码 0；日志约 `Wrote 947 icon(s), 5 font(s)`（space 已排除，约 947）；`icons/manifest.json` 含 `"version": 2` 与 `fonts` 数组 5 项；`public/fonts/` 有对应 woff2 或 ttf。

抽查：`HyperOSSymbolsVF` 中 `name` 为 `reset` 的 `unicode` 为 `F0000`。

- [ ] **Step 5: Commit（仅用户要求时）**

```bash
git add package.json package-lock.json scripts/generate-icon-manifest.mjs icons/manifest.json public/icons/manifest.json public/fonts
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
feat: 从 HyperOS Symbols 可变字体生成图标清单

EOF
)"
```

---

### Task 4: 重写 `IconGallery` UI

**Files:**
- Modify: `src/components/mdx/IconGallery.tsx`（整文件）
- Modify: `src/components/mdx/IconGalleryServer.tsx`（忽略 `categories`，仍接收以免 Tina 传参报错）

**Interfaces:**
- Consumes: `IconManifest`、`filterIcons` / `formatUnicode` / `codePointToChar` / `parseHexColor` / `previewSurfaceHex` / `COLOR_PRESETS` / `ALL_FONTS`
- Produces: 工具条（套件、搜索、颜色、粗细、字号）+ 卡片网格 + `@font-face`

- [ ] **Step 1: 更新 Server 包装**

`src/components/mdx/IconGalleryServer.tsx`：

```tsx
import { unstable_noStore as noStore } from 'next/cache';
import { getIconManifest } from '@/lib/icons';
import { IconGallery as IconGalleryClient } from './IconGallery';

type IconGalleryProps = {
  /** @deprecated SVG 分类；字体画廊忽略 */
  categories?: string[];
};

export function IconGallery(_props: IconGalleryProps) {
  noStore();
  const manifest = getIconManifest();
  return <IconGalleryClient manifest={manifest} />;
}
```

- [ ] **Step 2: 重写 `src/components/mdx/IconGallery.tsx`**

```tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { IconEntry, IconFont, IconManifest } from '@/lib/icons';
import {
  ALL_FONTS,
  COLOR_PRESETS,
  codePointToChar,
  filterIcons,
  formatUnicode,
  parseHexColor,
  previewSurfaceHex,
} from '@/lib/icon-query.ts';

type IconGalleryProps = {
  categories?: string[];
  manifest?: IconManifest;
};

function fontOf(manifest: IconManifest, fontId: string): IconFont | undefined {
  return manifest.fonts.find((f) => f.id === fontId);
}

function GlyphPreview({
  icon,
  font,
  color,
  weight,
  size,
}: {
  icon: IconEntry;
  font: IconFont | undefined;
  color: string;
  weight: number;
  size: number;
}) {
  if (!font) {
    return <span className="text-[10px] text-fd-muted-foreground">字体缺失</span>;
  }

  return (
    <span
      aria-hidden
      className="leading-none"
      style={{
        fontFamily: `"${font.family}", sans-serif`,
        fontWeight: weight,
        fontVariationSettings: `"wght" ${weight}`,
        fontSize: size,
        color,
      }}
    >
      {codePointToChar(icon.unicode)}
    </span>
  );
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

function GalleryBody({ manifest }: { manifest: IconManifest }) {
  const [fontId, setFontId] = useState(ALL_FONTS);
  const [query, setQuery] = useState('');
  const [color, setColor] = useState(COLOR_PRESETS[0].hex);
  const [hexDraft, setHexDraft] = useState(COLOR_PRESETS[0].hex);
  const [weight, setWeight] = useState(330);
  const [size, setSize] = useState(32);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const weightMin = Math.min(...manifest.fonts.map((f) => f.weight.min), 150);
  const weightMax = Math.max(...manifest.fonts.map((f) => f.weight.max), 700);

  useEffect(() => {
    const styleId = 'hyperos-symbol-faces';
    let el = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = styleId;
      document.head.appendChild(el);
    }
    el.textContent = manifest.fonts
      .map((f) => {
        const fmt = f.path.endsWith('.woff2') ? 'woff2' : 'truetype';
        return `@font-face{font-family:${JSON.stringify(f.family)};src:url(${JSON.stringify(f.path)}) format(${JSON.stringify(fmt)});font-weight:${f.weight.min} ${f.weight.max};font-style:normal;font-display:block;}`;
      })
      .join('\n');
  }, [manifest.fonts]);

  const filtered = useMemo(
    () => filterIcons(manifest.icons, { fontId, query }),
    [manifest.icons, fontId, query],
  );

  const flashCopied = (key: string) => {
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 1500);
  };

  const onCopy = async (key: string, text: string) => {
    try {
      await copyText(text);
      flashCopied(`${key}:ok`);
    } catch {
      flashCopied(`${key}:err`);
    }
  };

  const showSuiteLabel = fontId === ALL_FONTS;
  const chipClass = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      active
        ? 'border-fd-foreground bg-fd-foreground text-fd-background'
        : 'border-fd-border text-fd-muted-foreground hover:border-fd-foreground/40 hover:text-fd-foreground'
    }`;

  return (
    <div className="my-6 not-prose space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={chipClass(fontId === ALL_FONTS)} onClick={() => setFontId(ALL_FONTS)}>
          全部
        </button>
        {manifest.fonts.map((font) => (
          <button
            key={font.id}
            type="button"
            className={chipClass(fontId === font.id)}
            onClick={() => setFontId(font.id)}
          >
            {font.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-fd-border p-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索名称、Unicode、Glyph Index"
          className="w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                title={preset.label}
                onClick={() => {
                  setColor(preset.hex);
                  setHexDraft(preset.hex);
                }}
                className="size-6 rounded-full border border-fd-border"
                style={{ backgroundColor: preset.hex }}
              />
            ))}
            <input
              value={hexDraft}
              onChange={(e) => {
                const next = e.target.value;
                setHexDraft(next);
                setColor((prev) => parseHexColor(next, prev));
              }}
              className="w-28 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs"
              aria-label="自定义颜色"
            />
          </div>
          <label className="flex min-w-40 flex-1 items-center gap-2 text-xs text-fd-muted-foreground">
            粗细 {weight}
            <input
              type="range"
              min={weightMin}
              max={weightMax}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="flex-1"
            />
          </label>
          <label className="flex min-w-40 flex-1 items-center gap-2 text-xs text-fd-muted-foreground">
            字号 {size}
            <input
              type="range"
              min={16}
              max={64}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="flex-1"
            />
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-fd-border p-8 text-center text-sm text-fd-muted-foreground">
          没有匹配的图标
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((icon) => {
            const font = fontOf(manifest, icon.fontId);
            const unicodeText = formatUnicode(icon.unicode);
            const surface = previewSurfaceHex(color);
            const copyState = (part: string) => {
              if (copiedKey === `${icon.id}:${part}:ok`) return '已复制';
              if (copiedKey === `${icon.id}:${part}:err`) return '复制失败';
              return null;
            };

            return (
              <li key={icon.id} className="flex flex-col overflow-hidden rounded-xl border border-fd-border">
                <button
                  type="button"
                  onClick={() => void onCopy(`${icon.id}:glyph`, codePointToChar(icon.unicode))}
                  className="flex h-24 items-center justify-center"
                  style={{ backgroundColor: surface }}
                >
                  <GlyphPreview icon={icon} font={font} color={color} weight={weight} size={size} />
                </button>
                <div className="flex flex-1 flex-col gap-1 border-t border-fd-border bg-fd-card p-3">
                  {showSuiteLabel ? (
                    <p className="text-[10px] text-fd-muted-foreground">{font?.label ?? icon.fontId}</p>
                  ) : null}
                  <p className="truncate text-xs" title={icon.name}>
                    {icon.name}
                  </p>
                  <button
                    type="button"
                    className="truncate text-left font-mono text-[10px] text-fd-muted-foreground hover:text-fd-foreground"
                    onClick={() => void onCopy(`${icon.id}:unicode`, unicodeText)}
                  >
                    {copyState('unicode') ?? unicodeText}
                  </button>
                  <button
                    type="button"
                    className="truncate text-left font-mono text-[10px] text-fd-muted-foreground hover:text-fd-foreground"
                    onClick={() => void onCopy(`${icon.id}:gid`, String(icon.glyphIndex))}
                  >
                    {copyState('gid') ?? `Glyph Index ${icon.glyphIndex}`}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function IconGallery({ manifest: manifestProp }: IconGalleryProps) {
  const [manifest, setManifest] = useState<IconManifest | null>(manifestProp ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/icons/manifest.json?t=${Date.now()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<IconManifest>;
      })
      .then((data) => {
        if (!cancelled) setManifest(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (manifestProp) {
          setManifest(manifestProp);
          return;
        }
        setError(err instanceof Error ? err.message : '加载失败');
      });
    return () => {
      cancelled = true;
    };
  }, [manifestProp]);

  if (error) {
    return (
      <div className="my-6 rounded-xl border border-dashed border-fd-border p-6 text-sm text-fd-muted-foreground">
        无法加载图标清单：{error}
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="my-6 rounded-xl border border-dashed border-fd-border p-6 text-sm text-fd-muted-foreground">
        正在加载图标…
      </div>
    );
  }

  return <GalleryBody manifest={manifest} />;
}
```

- [ ] **Step 3: Tina 仍传 `categories`，确认可编译**

`src/components/tina/tina-markdown-components.tsx` 保持 `categories` 传入即可（被忽略）。不要改 schema。

- [ ] **Step 4: 类型检查**

Run:

```bash
npm run types:check
```

Expected: 退出码 0。若 `icon-query.ts` 的导入报 TS，在 `src/lib/icon-query.ts` 旁不要强行加 `.d.ts`；`IconGallery.tsx` 用 `// @ts-expect-error` 也禁止。仓库已能从 `.mjs` import（Ask AI 测试同模式）。若 `tsc` 拒收 `.mjs`，把 `icon-query.ts` 的导出再在 `src/lib/icon-query.ts` 用相同实现包一层 **不要**；应在 `tsconfig` 已有的 `allowJs` 下工作。若仍失败，将 `icon-query.ts` 改为 `icon-query.ts`，测试改为：

```js
import { filterIcons } from './icon-query.ts';
```

与 `search-docs.test.mjs` 相同。**优先保持 `.mjs`；只有 `tsc` 失败时才改成 `.ts`。** 改成 `.ts` 时同步改测试 import，并删 `.mjs`。

- [ ] **Step 5: Commit（仅用户要求时）**

```bash
git add src/components/mdx/IconGallery.tsx src/components/mdx/IconGalleryServer.tsx
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
feat: 用可变字体画廊替换 SVG IconGallery

EOF
)"
```

---

### Task 5: 下线 SVG 管线并改文案

**Files:**
- Delete: `icons/svg/**`（整树）
- Delete: `public/icons/` 下除 `manifest.json` 外的分类 SVG
- Modify: `icons/README.md`（按下面全文）
- Modify: `package.json`（若 Task 3 已删 `icons:import` 则跳过）
- Modify: `AGENTS.md`、`README.md`、`docs/deployment.md`、`docs/technical-design.md`、`docs/roadmap.md` 中 SVG / `icons:import` /「复制 ID 与 SVG」表述
- Modify: `src/lib/resources.ts` 图标卡片 description
- Modify: `content/docs/os4/resources/icons.mdx`、`content/docs/os5/resources/icons.mdx` 的 `description`

**Interfaces:**
- Consumes: Task 3 的新 manifest
- Produces: 文档与仓库结构与 spec 一致

- [ ] **Step 1: 删 SVG 资产**

Run:

```bash
git rm -r icons/svg
# 只删 SVG，保留 manifest
find public/icons -name '*.svg' -delete
# 删空分类目录
find public/icons -type d -empty -delete
```

确认 `public/icons/manifest.json` 仍在（version 2）。

- [ ] **Step 2: 重写 `icons/README.md`**

```md
# HyperOS 图标资产

本目录存放 **HyperOS Symbols 可变字体**（5 字重）与由 sync 生成的清单。

## 结构

```text
icons/font/*.ttf          # 真源（提交）
icons/manifest.json       # icons:sync 生成（提交）
public/fonts/             # web 字体（提交）
public/icons/manifest.json
```

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

```bash
npm run icons:sync
```

## 文档站预览

- 页面：`/docs/os4/resources/icons`
- 组件：`<IconGallery />`
```

（README 外层已是 md，内嵌的结构 fence 在实现时用缩进 code block，避免围栏冲突。）

- [ ] **Step 3: 文案替换（精确字符串）**

`src/lib/resources.ts` 中图标卡片：

```ts
description: '套件浏览、复制字符、Unicode 与 Glyph Index。',
```

`content/docs/os4/resources/icons.mdx`：

```yaml
description: HyperOS Symbols 字体图标预览：套件浏览、复制字符与 Unicode
```

`content/docs/os5/resources/icons.mdx` 同样改 description，可保留「OS5 占位」前缀。

`README.md`：删除 `icons:import` 行；`<IconGallery categories={...} />` 示例删掉，只留 `<IconGallery />`。

`AGENTS.md`：删除 `icons:import`；图标资产节改为 `icons/font` + `icons:sync`；`IconGallery` 表格改为「套件切换 / 搜索 / 复制字符、Unicode、Glyph Index」。

`docs/deployment.md`：命令列表去掉 `icons:import`；「图标资产以仓库内已提交的…」改为 `icons/manifest.json` 与 `public/fonts/`。

`docs/technical-design.md` 与 `docs/roadmap.md`：把「分类过滤 / 复制 ID 与 SVG」改成字体画廊能力；roadmap 勾仍可保留，注明管线已改为 TTF。

不要回滚工作区里与本次无关的未提交修改；只改图标相关句子。

- [ ] **Step 4: Commit（仅用户要求时）**

```bash
git add icons/README.md icons/svg public/icons AGENTS.md README.md docs/deployment.md docs/technical-design.md docs/roadmap.md src/lib/resources.ts content/docs/os4/resources/icons.mdx content/docs/os5/resources/icons.mdx package.json
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
chore: 下线 SVG 图标管线并同步字体图标库说明

EOF
)"
```

---

### Task 6: 全量验证

**Files:** 无新文件

- [ ] **Step 1: 单测**

Run:

```bash
node --test "src/**/*.test.mjs"
```

Expected: 全绿（含原 Ask AI / 彩蛋，以及 `icon-query`）。

- [ ] **Step 2: 构建**

Run:

```bash
npm run build
```

Expected: 成功。不要提交 `tina/__generated__/client.ts` 若只有 `cacheDir` 噪音。

- [ ] **Step 3: 手工（`npm run dev`）打开 `/docs/os4/resources/icons`**

1. 默认「全部」，约 947 张卡片，每张有套件名
2. 点 Symbols / Content Regular 等，网格变少且不再显示套件名
3. 搜索 `reset`、`U+F0000`、`f0000`、某个 GID
4. 切黑/白/品牌/非法 hex（应保持上一色）；白图标深底
5. 拖粗细、字号，字形变
6. 点预览复制字符；点 Unicode 复制 `U+F0000`；点 Glyph Index 复制数字；出现「已复制」
7. 搜不到时「没有匹配的图标」

- [ ] **Step 4: Commit（仅用户要求时，若验证中还有修）** 按实际 diff 写中文 message。

---

## Self-review

**Spec coverage**

| Spec | Task |
|------|------|
| 5 TTF + 全部套件切换 | 3, 4 |
| 搜索名称 / Unicode / GID | 1, 4 |
| 颜色预设 + hex | 1, 4 |
| wght 150–700 滑杆 | 4 |
| 字号 16–64 | 4 |
| 复制字符 / `U+` / GID | 1, 4 |
| 名称不复制；全部时显示套件 | 4 |
| 预览底按亮度 | 1, 4 |
| 构建时解析、WOFF2 回退 TTF | 3 |
| 排除 notdef / space | 3 |
| 忽略 Tina categories、不改 schema | 4 |
| 下线 SVG / import | 5 |
| 单测 + build + 手工 | 1, 6 |
| 不收 10 字重 | 3 的 `FONT_FILES` 白名单 |

**Placeholders:** 无 TBD。`fontkit` 的 CJS/ESM 导出差异在 Task 3 给了明确 fallback。`.mjs` vs `.ts` 仅在 `tsc` 失败时改，路径写清。

**Types:** `IconEntry.fontId` / `IconFont.id` 与 `filterIcons`、`FONT_FILES[].id` 一致：`symbols` | `content-regular` | `content-secondary` | `small` | `small-dualtone`。
