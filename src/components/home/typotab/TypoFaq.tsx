'use client';

import Link from 'next/link';
import { typoFaq } from './content';
import { TypoAccordion } from './TypoAccordion';
import { TypoReveal } from './TypoReveal';
import { TypoSection } from './TypoSection';

type TypoFaqProps = {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
};

export function TypoFaq({
  value,
  defaultValue = null,
  onValueChange,
}: TypoFaqProps = {}) {
  return (
    <TypoSection className="typo-section-pad gap-10">
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

      <TypoReveal className="w-full max-w-[640px]">
        <TypoAccordion
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          className="typo-faq"
        >
          {typoFaq.items.map((item, i) => (
            <TypoAccordion.Item key={item.question} value={i}>
              <TypoAccordion.Trigger>
                <span className="typo-faq-question">{item.question}</span>
                <TypoAccordion.Indicator />
              </TypoAccordion.Trigger>
              <TypoAccordion.Content>
                <p className="typo-faq-answer">{item.answer}</p>
              </TypoAccordion.Content>
            </TypoAccordion.Item>
          ))}
        </TypoAccordion>
      </TypoReveal>
    </TypoSection>
  );
}
