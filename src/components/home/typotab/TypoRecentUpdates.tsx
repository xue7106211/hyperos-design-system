'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { RecentDocItem } from '@/lib/recent-docs';
import { typoRecentUpdates } from './content';
import { TypoStagger, TypoStaggerItem } from './TypoReveal';
import { TypoSection } from './TypoSection';

type TypoRecentUpdatesProps = {
  items: RecentDocItem[];
};

export function TypoRecentUpdates({ items }: TypoRecentUpdatesProps) {
  if (items.length === 0) return null;

  return (
    <TypoSection className="typo-section-pad gap-[43px]">
      <TypoSection.Header maxWidthClassName="max-w-[1000px]">
        <TypoSection.Title>{typoRecentUpdates.title}</TypoSection.Title>
        <TypoSection.Lead>{typoRecentUpdates.subtitle}</TypoSection.Lead>
      </TypoSection.Header>

      <TypoStagger
        className="typo-panel typo-panel--quiet flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[20px]"
        stagger={0.08}
      >
        {items.map((item, index) => (
          <TypoStaggerItem key={item.href} className="w-full">
            <Link
              href={item.href}
              className="group flex w-full min-h-11 items-start gap-4 px-6 py-5 no-underline transition-colors duration-150 ease-out hover:bg-[var(--typo-surface-muted)] active:bg-[var(--typo-surface)] sm:gap-5 sm:px-8 sm:py-6"
              style={
                index < items.length - 1
                  ? {
                      borderBottom:
                        'var(--typo-border-hairline) solid var(--typo-divider)',
                    }
                  : undefined
              }
            >
              <time
                dateTime={item.updatedAt}
                className="w-[7.25rem] shrink-0 pt-1.5 font-mono text-[13px] leading-none tracking-tight whitespace-nowrap tabular-nums text-[var(--typo-ink-muted)]"
              >
                {item.updatedAt}
              </time>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="m-0 min-w-0 text-[18px] leading-[1.25] font-semibold tracking-normal text-balance break-words text-[var(--typo-ink)] sm:text-[20px]">
                    {item.title}
                  </h3>
                  <ArrowUpRight
                    aria-hidden
                    className="mt-0.5 size-5 shrink-0 translate-x-px -translate-y-px text-[var(--typo-ink-muted)] transition-[color,transform] duration-150 ease-out pointer-events-none select-none group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--typo-ink)]"
                  />
                </div>
                {item.description ? (
                  <p
                    title={item.description}
                    className="mt-1.5 m-0 max-w-prose line-clamp-2 text-[16px] leading-[1.55] font-normal tracking-[0.01em] text-pretty text-[var(--typo-ink-muted)]"
                  >
                    {item.description}
                  </p>
                ) : null}
              </div>
            </Link>
          </TypoStaggerItem>
        ))}
      </TypoStagger>

      <Link
        href={typoRecentUpdates.moreHref}
        className="inline-flex min-h-11 items-center px-1 text-[15px] leading-[1.5] font-medium text-[var(--typo-ink-muted)] no-underline transition-colors duration-150 ease-out hover:text-[var(--typo-ink)]"
      >
        {typoRecentUpdates.moreLabel}
        <span aria-hidden className="ms-1 inline-block translate-y-px">
          →
        </span>
      </Link>
    </TypoSection>
  );
}
