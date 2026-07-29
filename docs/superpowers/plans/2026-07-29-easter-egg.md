# 全站彩蛋浮层 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全站（排除 `/admin`）在 1.2s 内连点 4 次后打开居中签名浮层，文案为「无人区」彩蛋。

**Architecture:** 纯函数 `recordRapidClick` 负责时间窗计数；`EasterEggProvider`（Client）在根布局挂载，捕获阶段监听 `click`、管理 `open`、处理 Esc；`EasterEggPanel` 只负责遮罩 + 卡片 UI。不新增路由、不进导航、不改 Tina / MDX。

**Tech Stack:** Next.js App Router · React 19 Client Components · Tailwind CSS 4（`fd-*` token）· Node 内置 `node:test`（无新测试依赖）

**Spec:** [docs/superpowers/specs/2026-07-29-easter-egg-design.md](../specs/2026-07-29-easter-egg-design.md)

## Global Constraints

- 触发：捕获阶段 `click`，**1.2s** 内 **4** 次；超时清零
- 范围：全站；路径以 `/admin` 开头时不监听、不渲染
- 面板打开期间忽略继续连点；关闭后可再触发
- 关闭：遮罩、关闭钮、`Esc`
- 文案固定：标题「恭喜你来到了无人区」；正文「规范都在外面，这里只留给偶然路过的人。」；页脚「薛困惑，2026 年 7 月」
- 无独立路由、无 URL/localStorage 同步、无音效/全屏特效
- Commit message 中文（Conventional Commits 前缀 + 中文主题）；author email 用 `git -c user.email="xueyifei1@xiaomi.com"`（仅在用户要求提交时）
- 不新增 npm 依赖；不改 `content/docs/` / Tina schema

## File Structure

| 文件 | 职责 |
|------|------|
| `src/components/easter-egg/rapid-click.ts` | 纯函数：时间窗点击计数 |
| `src/components/easter-egg/rapid-click.test.mjs` | Node 内置测试（验证计数逻辑） |
| `src/components/easter-egg/EasterEggPanel.tsx` | 遮罩 + dialog 卡片 + 固定文案 |
| `src/components/easter-egg/EasterEggProvider.tsx` | pathname 排除、监听、状态、Esc、挂载 Panel |
| `src/app/layout.tsx` | 在 `RootProvider` 内挂载 `EasterEggProvider` |

---

### Task 1: 连点时间窗纯函数 + 单元测试

**Files:**
- Create: `src/components/easter-egg/rapid-click.ts`
- Create: `src/components/easter-egg/rapid-click.test.mjs`
- Test: `src/components/easter-egg/rapid-click.test.mjs`

**Interfaces:**
- Consumes: 无
- Produces:
  - `export const EASTER_EGG_CLICK_WINDOW_MS = 1200`
  - `export const EASTER_EGG_CLICK_THRESHOLD = 4`
  - `export type RapidClickResult = { timestamps: number[]; shouldOpen: boolean }`
  - `export function recordRapidClick(timestamps: number[], now: number, windowMs?: number, threshold?: number): RapidClickResult`

- [ ] **Step 1: 写入失败测试（逻辑尚未存在）**

创建 `src/components/easter-egg/rapid-click.test.mjs`：

```js
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  EASTER_EGG_CLICK_THRESHOLD,
  EASTER_EGG_CLICK_WINDOW_MS,
  recordRapidClick,
} from './rapid-click.ts';

describe('recordRapidClick', () => {
  it('opens after threshold clicks inside the window', () => {
    let timestamps = [];
    let result;
    for (let i = 0; i < EASTER_EGG_CLICK_THRESHOLD; i++) {
      result = recordRapidClick(timestamps, 1000 + i * 100);
      timestamps = result.timestamps;
    }
    assert.equal(result.shouldOpen, true);
    assert.deepEqual(result.timestamps, []);
  });

  it('does not open when clicks are spaced beyond the window', () => {
    let timestamps = [];
    let result = recordRapidClick(timestamps, 0);
    timestamps = result.timestamps;
    result = recordRapidClick(timestamps, 1);
    timestamps = result.timestamps;
    result = recordRapidClick(timestamps, 2);
    timestamps = result.timestamps;
    result = recordRapidClick(
      timestamps,
      2 + EASTER_EGG_CLICK_WINDOW_MS + 1,
    );
    assert.equal(result.shouldOpen, false);
    assert.equal(result.timestamps.length, 1);
  });

  it('keeps only clicks inside the rolling window', () => {
    const result = recordRapidClick(
      [0, 100, 200],
      100 + EASTER_EGG_CLICK_WINDOW_MS,
      EASTER_EGG_CLICK_WINDOW_MS,
      EASTER_EGG_CLICK_THRESHOLD,
    );
    assert.equal(result.shouldOpen, false);
    assert.deepEqual(result.timestamps, [100, 200, 100 + EASTER_EGG_CLICK_WINDOW_MS]);
  });
});
```

- [ ] **Step 2: 跑测试，确认失败**

Run:

```bash
node --experimental-strip-types --test src/components/easter-egg/rapid-click.test.mjs
```

Expected: FAIL（无法 resolve `./rapid-click.ts` 或 `recordRapidClick` 未定义）

- [ ] **Step 3: 实现纯函数**

创建 `src/components/easter-egg/rapid-click.ts`：

```ts
export const EASTER_EGG_CLICK_WINDOW_MS = 1200;
export const EASTER_EGG_CLICK_THRESHOLD = 4;

export type RapidClickResult = {
  timestamps: number[];
  shouldOpen: boolean;
};

/**
 * 将一次点击记入滚动时间窗；达到阈值时 shouldOpen=true 并清空队列。
 */
export function recordRapidClick(
  timestamps: number[],
  now: number,
  windowMs: number = EASTER_EGG_CLICK_WINDOW_MS,
  threshold: number = EASTER_EGG_CLICK_THRESHOLD,
): RapidClickResult {
  const next = timestamps.filter((t) => now - t <= windowMs);
  next.push(now);

  if (next.length >= threshold) {
    return { timestamps: [], shouldOpen: true };
  }

  return { timestamps: next, shouldOpen: false };
}
```

- [ ] **Step 4: 再跑测试，确认通过**

Run:

```bash
node --experimental-strip-types --test src/components/easter-egg/rapid-click.test.mjs
```

Expected: 3 passed

若 `--experimental-strip-types` 在当前 Node 不可用：把实现临时复制为同目录 `rapid-click.mjs` 仅供测试，或把测试改写为内联复制函数逻辑对照——优先保留单一 `.ts` 真源 + strip-types。

- [ ] **Step 5: Commit（仅在用户要求提交时执行）**

```bash
git add src/components/easter-egg/rapid-click.ts src/components/easter-egg/rapid-click.test.mjs
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
feat: 新增彩蛋连点时间窗纯函数

为全站仪式感触发抽离可单测的计数逻辑。
EOF
)"
```

---

### Task 2: EasterEggPanel 浮层 UI

**Files:**
- Create: `src/components/easter-egg/EasterEggPanel.tsx`

**Interfaces:**
- Consumes: 无（文案内联）
- Produces:
  - `export type EasterEggPanelProps = { open: boolean; onClose: () => void }`
  - `export function EasterEggPanel(props: EasterEggPanelProps): JSX.Element | null`

- [ ] **Step 1: 实现面板组件**

Create `src/components/easter-egg/EasterEggPanel.tsx`：

```tsx
'use client';

import { useEffect, useRef } from 'react';

export type EasterEggPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function EasterEggPanel({ open, onClose }: EasterEggPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeRef.current?.focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="关闭彩蛋"
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="easter-egg-title"
        aria-describedby="easter-egg-body"
        className="relative z-[1] w-full max-w-sm rounded-xl border border-fd-border bg-fd-background p-6 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md px-2 py-1 text-sm text-fd-muted-foreground hover:text-fd-foreground"
        >
          关闭
        </button>
        <h2
          id="easter-egg-title"
          className="pr-12 text-lg font-medium text-fd-foreground"
        >
          恭喜你来到了无人区
        </h2>
        <p
          id="easter-egg-body"
          className="mt-3 text-sm leading-relaxed text-fd-muted-foreground"
        >
          规范都在外面，这里只留给偶然路过的人。
        </p>
        <p className="mt-6 text-xs text-fd-muted-foreground/80">
          薛困惑，2026 年 7 月
        </p>
      </div>
    </div>
  );
}
```

说明：若项目未启用 `animate-in` / `fade-in` 等 utility，删除这些 class，改用 `opacity` + 短 `transition`（或纯静态出现），避免引入新动画库。以 `npm run types:check` 与视觉为准。

- [ ] **Step 2: 目视/类型冒烟（组件尚未挂载也可先 types 到 Task 3 一并查）**

暂无独立 UI 测试。确认文案三处与 spec 完全一致。

- [ ] **Step 3: Commit（仅在用户要求提交时执行）**

```bash
git add src/components/easter-egg/EasterEggPanel.tsx
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
feat: 新增彩蛋签名浮层面板

展示无人区文案，支持遮罩与关闭钮。
EOF
)"
```

---

### Task 3: EasterEggProvider 监听与状态

**Files:**
- Create: `src/components/easter-egg/EasterEggProvider.tsx`

**Interfaces:**
- Consumes:
  - `recordRapidClick` / `EASTER_EGG_*` from `./rapid-click`
  - `EasterEggPanel` from `./EasterEggPanel`
  - `usePathname` from `next/navigation`
- Produces:
  - `export function EasterEggProvider({ children }: { children: React.ReactNode }): JSX.Element`

- [ ] **Step 1: 实现 Provider**

Create `src/components/easter-egg/EasterEggProvider.tsx`：

```tsx
'use client';

import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { EasterEggPanel } from './EasterEggPanel';
import { recordRapidClick } from './rapid-click';

function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export function EasterEggProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const disabled = isAdminPath(pathname);
  const [open, setOpen] = useState(false);
  const timestampsRef = useRef<number[]>([]);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (disabled || open) return;

    const onClick = () => {
      const result = recordRapidClick(timestampsRef.current, Date.now());
      timestampsRef.current = result.timestamps;
      if (result.shouldOpen) {
        setOpen(true);
      }
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
    };
  }, [disabled, open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      {children}
      {!disabled ? <EasterEggPanel open={open} onClose={close} /> : null}
    </>
  );
}
```

注意：
- 打开时卸载 click 监听（`open` 在依赖中且 early return），满足「打开后忽略连点」
- 关闭后 `open=false`，监听恢复
- **不要**默认改 `document.body.style.overflow`，除非手动验证 docs 页滚动穿透严重；优先 YAGNI

- [ ] **Step 2: Commit（仅在用户要求提交时执行）**

```bash
git add src/components/easter-egg/EasterEggProvider.tsx
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
feat: 接入彩蛋连点监听与开关状态

全站捕获点击，admin 路径排除，Esc 关闭。
EOF
)"
```

---

### Task 4: 根布局挂载 + 端到端验证

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `EasterEggProvider` from `@/components/easter-egg/EasterEggProvider`
- Produces: 全站 children 包在 Provider 内

- [ ] **Step 1: 修改根布局**

将 `src/app/layout.tsx` 的 body 内容改为：

```tsx
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { EasterEggProvider } from '@/components/easter-egg/EasterEggProvider';
import { appDescription, appName, appShortTitle } from '@/lib/shared';
import './global.css';

// ... metadata 与 inter 保持不变 ...

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <EasterEggProvider>{children}</EasterEggProvider>
        </RootProvider>
      </body>
    </html>
  );
}
```

`EasterEggProvider` 放在 `RootProvider` **内部**，以便继承主题 / 路由上下文（`usePathname`）。

- [ ] **Step 2: 类型检查**

Run:

```bash
npm run types:check
```

Expected: 退出码 0，无与 easter-egg 相关的 TS 错误

- [ ] **Step 3: 单元测试再跑一遍**

Run:

```bash
node --experimental-strip-types --test src/components/easter-egg/rapid-click.test.mjs
```

Expected: 3 passed

- [ ] **Step 4: 手动冒烟（`npm run dev`）**

1. 打开首页：约 1.2s 内快速连点空白/任意处 4 次 → 出现面板，文案三处正确  
2. 故意慢点（间隔 >1.2s）→ 不出现  
3. Esc、遮罩、关闭钮均可关；关闭后再连点 4 次可再开  
4. 打开 `/docs/os4` 再测一次触发，确认 docs 布局无错位  
5. 打开 `/admin`：连点不出现面板  

- [ ] **Step 5: Commit（仅在用户要求提交时执行）**

```bash
git add src/app/layout.tsx src/components/easter-egg
git -c user.email="xueyifei1@xiaomi.com" commit -m "$(cat <<'EOF'
feat: 根布局挂载全站彩蛋浮层

连点四次打开无人区签名面板，admin 除外。
EOF
)"
```

若 Task 1–3 尚未分别提交，可在本步一次性提交所有 easter-egg 文件 + layout。

---

## Spec Coverage Checklist

| Spec 要求 | Task |
|-----------|------|
| 1.2s / 4 次连点 | Task 1 + 3 |
| 排除 `/admin` | Task 3 |
| 打开后忽略连点 | Task 3（`open` 时不绑监听） |
| Esc / 遮罩 / 关闭钮 | Task 2 + 3 |
| 固定三处文案 | Task 2 |
| dialog / aria / 焦点 | Task 2 |
| 根布局挂载、无新路由 | Task 4 |
| 无 URL/localStorage | 全任务均未引入 |
| types:check + 手动验证 | Task 4 |

## Plan Self-Review

- 无 TBD /「稍后实现」占位
- 接口名在 Task 间一致：`recordRapidClick`、`EasterEggPanel`、`EasterEggProvider`
- 仓库无 vitest/jest：用 Node 22 `node:test` + `--experimental-strip-types`；若环境失败，优先修运行方式，不引入新依赖
- `animate-in` 类若不存在，Task 2 已注明降级为静态/CSS transition
