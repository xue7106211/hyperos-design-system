'use client';

import Image from 'next/image';
import Link from 'next/link';
import { typoApps } from './content';
import { TypoReveal } from './TypoReveal';
import { TypoSection } from './TypoSection';

export function TypoApps() {
  const logos = typoApps.logos;
  const outer = logos.slice(0, typoApps.outerLogoCount);
  const inner = logos.slice(typoApps.outerLogoCount);
  const logoSrc = (name: string) => `${typoApps.logoBasePath}/${name}.png`;

  return (
    <TypoSection className="relative flex flex-col items-center overflow-hidden px-5 py-20">
      <TypoSection.Header className="relative z-[2] mb-28">
        <TypoSection.Title>{typoApps.title}</TypoSection.Title>
        <TypoSection.Lead>{typoApps.subtitle}</TypoSection.Lead>
      </TypoSection.Header>

      <TypoReveal
        className="relative flex min-h-[640px] w-full max-w-[920px] items-center justify-center"
        variants={{
          hidden: { opacity: 0, scale: 0.92 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
          },
        }}
      >
        <div
          aria-hidden
          className="typo-anim pointer-events-none absolute size-[min(850px,95vw)] select-none"
          style={{ animation: 'typo-spin 60s linear infinite' }}
        >
          {outer.map((name, i) => {
            const angle = (i / outer.length) * Math.PI * 2;
            const r = 42;
            const x = Math.round((50 + r * Math.cos(angle)) * 1000) / 1000;
            const y = Math.round((50 + r * Math.sin(angle)) * 1000) / 1000;
            return (
              <Image
                key={`outer-${name}`}
                src={logoSrc(name)}
                alt=""
                width={56}
                height={56}
                className="absolute size-14 -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-[var(--typo-elevation-raised)]"
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            );
          })}
        </div>

        <div
          aria-hidden
          className="typo-anim pointer-events-none absolute size-[min(520px,70vw)] opacity-80 select-none"
          style={{ animation: 'typo-spin 90s linear infinite reverse' }}
        >
          {inner.map((name, i) => {
            const angle = (i / inner.length) * Math.PI * 2 + 0.4;
            const r = 40;
            const x = Math.round((50 + r * Math.cos(angle)) * 1000) / 1000;
            const y = Math.round((50 + r * Math.sin(angle)) * 1000) / 1000;
            return (
              <Image
                key={`inner-${name}`}
                src={logoSrc(name)}
                alt=""
                width={44}
                height={44}
                className="absolute size-11 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-[var(--typo-elevation-raised)]"
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            );
          })}
        </div>

        <div
          className="relative z-[1] w-[min(349px,90vw)] overflow-hidden rounded-[20px] shadow-[var(--typo-elevation-float)] backdrop-blur transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-1 hover:shadow-[var(--typo-elevation-float-hover)]"
          style={{ backgroundColor: 'color-mix(in oklch, var(--typo-surface) 95%, transparent)' }}
        >
          <div
            className="px-4 py-3 text-[14px] text-[var(--typo-ink-muted)]"
            style={{
              borderBottom:
                'var(--typo-border-hairline) solid var(--typo-divider)',
            }}
          >
            {typoApps.searchPlaceholder}
          </div>
          <ul className="m-0 grid list-none grid-cols-2 gap-1 p-2">
            {typoApps.menuItems.map((item) => (
              <li key={item.label}>
                {/* outer 20 − pad 8 → inner 12 (rounded-xl) */}
                <Link
                  href={item.href}
                  className="flex min-h-10 items-center justify-center rounded-xl px-3 py-2.5 text-center text-[15px] font-semibold text-[var(--typo-ink)] no-underline transition-colors duration-150 ease-out hover:bg-[var(--typo-surface-muted)] active:scale-[0.96]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div
            className="flex justify-between px-4 py-2 text-[12px] text-[var(--typo-ink-muted)]"
            style={{
              borderTop: 'var(--typo-border-hairline) solid var(--typo-divider)',
            }}
          >
            <span>esc 关闭</span>
            <span>回车 打开</span>
          </div>
        </div>
      </TypoReveal>
    </TypoSection>
  );
}
