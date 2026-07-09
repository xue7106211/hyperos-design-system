import Link from 'next/link';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { HyperOSMark } from '@/components/home/HyperOSMark';
import { cn } from '@/lib/cn';
import { defaultDocsRoute } from '@/lib/shared';

const links = [
  { href: defaultDocsRoute, label: '文档' },
  { href: `${defaultDocsRoute}/foundations/colors`, label: '色彩' },
  { href: `${defaultDocsRoute}/components/actions/button`, label: '组件' },
  { href: `${defaultDocsRoute}/resources/figma-library`, label: 'Figma' },
] as const;

export function PillNav({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4',
        className,
      )}
    >
      <nav
        aria-label="主导航"
        className={cn(
          'pointer-events-auto flex items-center gap-0.5 rounded-full p-1.5 backdrop-blur-sm',
          'bg-[var(--home-nav-bg)] shadow-[var(--home-nav-shadow)]',
        )}
      >
        <Link
          href="/"
          aria-label="首页"
          className="home-nav-mark flex size-9 items-center justify-center rounded-full transition-opacity duration-150 hover:opacity-70"
        >
          <HyperOSMark />
        </Link>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="home-nav-link relative flex h-9 items-center rounded-full px-3 text-sm font-medium"
          >
            <span className="relative z-10">{link.label}</span>
          </Link>
        ))}
        <ThemeSwitch
          mode="light-dark"
          className="ms-0.5 border-0 bg-transparent p-0.5"
        />
      </nav>
    </div>
  );
}
