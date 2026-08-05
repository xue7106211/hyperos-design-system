'use client';

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';
import { TypoReveal } from './TypoReveal';

type SectionProps = ComponentPropsWithoutRef<'section'> & {
  children: ReactNode;
};

/**
 * Landing section shell. Prefer composition:
 *
 * ```tsx
 * <TypoSection className="typo-section-pad gap-20">
 *   <TypoSection.Header>
 *     <TypoSection.Title>…</TypoSection.Title>
 *     <TypoSection.Lead>…</TypoSection.Lead>
 *   </TypoSection.Header>
 *   {body}
 * </TypoSection>
 * ```
 */
function TypoSectionRoot({ children, className, ...props }: SectionProps) {
  return (
    <section className={cn(className)} {...props}>
      {children}
    </section>
  );
}

type HeaderProps = {
  children: ReactNode;
  className?: string;
  maxWidthClassName?: string;
};

function TypoSectionHeader({
  children,
  className,
  maxWidthClassName = 'max-w-[611px]',
}: HeaderProps) {
  return (
    <TypoReveal
      className={cn(
        'flex flex-col items-center gap-5',
        maxWidthClassName,
        className,
      )}
    >
      {children}
    </TypoReveal>
  );
}

type TitleProps = ComponentPropsWithoutRef<'h2'>;

function TypoSectionTitle({ children, className, ...props }: TitleProps) {
  return (
    <h2 className={cn('typo-h2', className)} {...props}>
      {children}
    </h2>
  );
}

type LeadProps = ComponentPropsWithoutRef<'p'>;

function TypoSectionLead({ children, className, ...props }: LeadProps) {
  return (
    <p className={cn('typo-lead', className)} {...props}>
      {children}
    </p>
  );
}

export const TypoSection = Object.assign(TypoSectionRoot, {
  Header: TypoSectionHeader,
  Title: TypoSectionTitle,
  Lead: TypoSectionLead,
});
