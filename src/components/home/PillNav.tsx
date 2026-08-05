'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { cn } from '@/lib/cn';
import { defaultDocsRoute } from '@/lib/shared';

/**
 * 首页顶部胶囊导航条目。
 * 这里硬编码了落地页的主要入口，与侧边栏 IA 保持一致，方便用户快速跳转。
 */
const links = [
  { href: `${defaultDocsRoute}/general`, label: '设计指南' },
  { href: `${defaultDocsRoute}/components`, label: '系统组件' },
  { href: '/resources', label: '设计资源' },
] as const;

function linkIsActive(pathname: string, href: string) {
  if (href === '/resources') {
    return pathname === '/resources' || pathname.startsWith('/resources/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 固定在首页顶部的胶囊型导航栏。
 *
 * 外层 `pointer-events-none` + 内层 `pointer-events-auto` 的组合，
 * 让透明遮罩不会拦截下方内容的点击/滚动，同时保证导航本身可交互。
 */
export function PillNav({ className }: { className?: string }) {
  const pathname = usePathname() ?? '';

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 top-4 z-[var(--z-home-nav,40)] flex justify-center px-4',
        className,
      )}
    >
      <nav
        aria-label="主导航"
        className={cn(
          'pointer-events-auto flex items-center gap-0.5 rounded-full p-1.5 backdrop-blur-sm',
          // --home-nav-bg / --home-nav-shadow 在 global.css 中按主题定义，
          // 保证毛玻璃背景与浅色/深色首页都协调。
          'bg-[var(--home-nav-bg)] shadow-[var(--home-nav-shadow)]',
        )}
      >
        {links.map((link) => {
          const active = linkIsActive(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                // h-10 ≥ 40px desktop hit target; weight stays constant (color signals state)
                'home-nav-link relative flex h-10 min-w-10 items-center justify-center rounded-full px-3.5 text-sm font-medium',
                active && 'is-active',
              )}
            >
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
        <ThemeSwitch
          mode="light-dark"
          className="ms-0.5 self-center border-0 bg-transparent"
        />
      </nav>
    </div>
  );
}
