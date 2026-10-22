'use client';

import type { ComponentProps } from 'react';
import { usePathname } from 'fumadocs-core/framework';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  type SidebarProps,
} from 'fumadocs-ui/layouts/docs/slots/sidebar';
import { isHiddenNavPathname } from '@/lib/hidden-nav-pages';

/**
 * 隐藏页（见 `isHiddenNavPathname`）整个隐藏侧边栏外壳：搜索框、版本切换器
 * banner、导航树全部一起消失，而不是渲染一棵空树。其余页面原样渲染默认
 * `Sidebar`。四个 slot（provider / root / trigger / useSidebar）必须整体
 * 替换——`DocsLayout` 对 `slots.sidebar` 是整体覆盖而非逐字段合并。
 */
export { SidebarProvider as HiddenNavSidebarProvider };

export function HiddenNavSidebarRoot(props: SidebarProps) {
  const pathname = usePathname();
  if (isHiddenNavPathname(pathname)) return null;
  return <Sidebar {...props} />;
}

/** 移动端汉堡触发器同步隐藏，避免打开一个空抽屉。 */
export function HiddenNavSidebarTrigger(props: ComponentProps<'button'>) {
  const pathname = usePathname();
  if (isHiddenNavPathname(pathname)) return null;
  return <SidebarTrigger {...props} />;
}

/**
 * 隐藏页强制 `collapsed: true`，让 `Container` 的网格列宽
 * (`--fd-sidebar-col`) 回收为 0，内容区占满剩余空间，而不是留出一条空白。
 */
export function useHiddenNavSidebar() {
  const pathname = usePathname();
  const state = useSidebar();
  if (isHiddenNavPathname(pathname)) {
    return { ...state, collapsed: true, open: false };
  }
  return state;
}
