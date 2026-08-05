'use client';

import Link from 'next/link';
import { typoFaq } from './content';
import { TypoAccordion } from './TypoAccordion';
import { TypoReveal } from './TypoReveal';
import { TypoSection } from './TypoSection';

type TypoFaqProps = {
  /** Controlled open index; omit for uncontrolled. */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
};

export function TypoFaq({
  value,
  defaultValue = 0,
  onValueChange,
}: TypoFaqProps = {}) {
  return (
    <TypoSection className="flex flex-col items-center gap-10 px-5 py-24">
      <TypoSection.Header maxWidthClassName="max-w-[610px]">
        <TypoSection.Title>{typoFaq.title}</TypoSection.Title>
        <TypoSection.Lead>
          {typoFaq.contactPrefix}
          <Link
            href={typoFaq.contactHref}
            className="typo-link-ink underline underline-offset-4 transition-opacity duration-150 ease-out hover:opacity-80"
          >
            {typoFaq.contactLabel}
          </Link>
          。
        </TypoSection.Lead>
      </TypoSection.Header>

      <TypoReveal className="w-full max-w-[924px]">
        <TypoAccordion
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
        >
          {typoFaq.items.map((item, i) => (
            <TypoAccordion.Item key={item.question} value={i}>
              <TypoAccordion.Trigger>
                <span className="text-[22px] leading-[1.5] font-semibold tracking-normal text-balance text-[var(--typo-ink)]">
                  {item.question}
                </span>
                <TypoAccordion.Indicator />
              </TypoAccordion.Trigger>
              <TypoAccordion.Content>
                <p className="m-0 max-w-[820px] pb-6 text-[18px] leading-[1.55] font-medium text-pretty text-[var(--typo-ink-muted)]">
                  {item.answer}
                </p>
              </TypoAccordion.Content>
            </TypoAccordion.Item>
          ))}
        </TypoAccordion>
      </TypoReveal>
    </TypoSection>
  );
}
