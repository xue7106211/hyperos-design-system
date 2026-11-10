import type { ReactNode } from 'react';
import { PillNav } from '@/components/home/PillNav';
import './tools.css';
import './arc-theme.css';

/**
 * 工具页外壳：与 /icons 共用 PillNav（fixed），但页面正常滚动。
 * 底部留白给右下角 Ask AI 浮动入口。
 */
export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="home-shell tools-shell flex min-h-dvh flex-col bg-fd-background text-fd-foreground">
      <PillNav />
      <div aria-hidden className="h-[5.25rem] shrink-0" />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
    </div>
  );
}
