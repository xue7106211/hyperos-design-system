import type { ReactNode } from 'react';
import { PillNav } from '@/components/home/PillNav';

/**
 * PillNav 为 fixed，不占文档流；用等高 spacer 把内容顶到胶囊下方，
 * 外壳锁定 h-dvh + overflow-hidden，避免整页滚动。
 */
const PILL_NAV_SPACER = 'h-[5.25rem] shrink-0';

export default function IconsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="home-shell flex h-dvh flex-col overflow-hidden bg-fd-background text-fd-foreground">
      <PillNav />
      <div aria-hidden className={PILL_NAV_SPACER} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
