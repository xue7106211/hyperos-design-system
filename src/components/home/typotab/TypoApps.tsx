'use client';

import Image from 'next/image';
import Link from 'next/link';
import { typoApps } from './content';
import { TypoReveal } from './TypoReveal';
import { TypoSection } from './TypoSection';

export function TypoApps() {
  const ring = typoApps.logos;

  return (
    <TypoSection className="relative flex flex-col items-center overflow-hidden px-5 py-20">
      <TypoSection.Header className="relative z-[2] mb-16">
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
          {ring.map((name, i) => {
            const angle = (i / ring.length) * Math.PI * 2;
            const r = 42;
            const x = Math.round((50 + r * Math.cos(angle)) * 1000) / 1000;
            const y = Math.round((50 + r * Math.sin(angle)) * 1000) / 1000;
            return (
              <Image
                key={`${name}-${i}`}
                src={`/typotab/logos/${name}.png`}
                alt=""
                width={56}
                height={56}
                className="absolute size-14 -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-[var(--typo-elevation-raised)] outline outline-1 -outline-offset-1 outline-black/10"
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
          {ring.slice(0, 12).map((name, i) => {
            const angle = (i / 12) * Math.PI * 2 + 0.4;
            const r = 40;
            const x = Math.round((50 + r * Math.cos(angle)) * 1000) / 1000;
            const y = Math.round((50 + r * Math.sin(angle)) * 1000) / 1000;
            return (
              <Image
                key={`inner-${name}-${i}`}
                src={`/typotab/logos/${name}.png`}
                alt=""
                width={44}
                height={44}
                className="absolute size-11 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-[var(--typo-elevation-raised)] outline outline-1 -outline-offset-1 outline-black/10"
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            );
          })}
        </div>

        <div className="relative z-[1] w-[min(349px,90vw)] overflow-hidden rounded-[20px] bg-white/95 shadow-[var(--typo-elevation-float)] backdrop-blur transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-1 hover:shadow-[var(--typo-elevation-float-hover)]">
          <div
            className="px-4 py-3 text-[14px] text-[#888]"
            style={{
              borderBottom:
                'var(--typo-border-hairline) solid var(--typo-divider)',
            }}
          >
            {typoApps.searchPlaceholder}
          </div>
          <ul className="m-0 list-none p-2">
            {typoApps.menuItems.map((item) => (
              <li key={item.label}>
                {/* outer 20 − pad 8 → inner 12 (rounded-xl) */}
                <Link
                  href={item.href}
                  className="flex min-h-10 items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-semibold text-[#262626] no-underline transition-colors duration-150 ease-out hover:bg-[#f5f5f5]"
                >
                  <span>{item.label}</span>
                  {item.shortcut ? (
                    <kbd className="rounded-md bg-[#f0f0f0] px-2 py-0.5 font-mono text-[12px] font-medium text-[#666] tabular-nums">
                      {item.shortcut}
                    </kbd>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
          <div
            className="flex justify-between px-4 py-2 text-[12px] text-[#999]"
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
