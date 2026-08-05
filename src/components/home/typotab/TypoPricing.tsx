'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { typoPricing } from './content';
import { TypoReveal, TypoStagger, TypoStaggerItem } from './TypoReveal';

function Check() {
  return (
    <svg
      aria-hidden
      width="18"
      height="18"
      viewBox="0 0 18 18"
      className="mt-0.5 shrink-0 text-white"
    >
      <circle cx="9" cy="9" r="9" fill="rgba(255,255,255,0.25)" />
      <path
        d="M5 9.2 7.8 12 13 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TypoPricing() {
  const reduce = useReducedMotion();

  return (
    <section
      id="start"
      className="flex flex-col items-center gap-16 px-5 py-24"
    >
      <TypoReveal className="flex max-w-[611px] flex-col items-center gap-5">
        <h2 className="typo-h2">{typoPricing.title}</h2>
        <p className="typo-lead">{typoPricing.subtitle}</p>
      </TypoReveal>

      <TypoStagger
        className="flex w-full max-w-[850px] flex-col items-stretch justify-center gap-5 md:flex-row"
        stagger={0.12}
      >
        {typoPricing.plans.map((plan) => (
          <TypoStaggerItem key={plan.name} className="flex flex-1">
            <motion.article
              className="relative flex w-full flex-col rounded-[24px] p-8 text-white md:max-w-[415px]"
              style={{ backgroundColor: plan.color }}
              whileHover={reduce ? undefined : { y: -6, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            >
              {plan.badge ? (
                <span
                  className="absolute top-5 right-5 rounded-full bg-white/20 px-3 py-1 text-[13px] backdrop-blur"
                  style={{ fontVariationSettings: "'wght' 700" }}
                >
                  {plan.badge}
                </span>
              ) : null}

              <h3
                className="m-0 text-[28px] leading-[1.1] tracking-[-0.04em]"
                style={{ fontVariationSettings: "'wght' 825" }}
              >
                {plan.name}
              </h3>
              <p
                className="mt-2 mb-6 text-[16px] opacity-90"
                style={{ fontVariationSettings: "'wght' 600" }}
              >
                {plan.tagline}
              </p>

              <div className="mb-2 flex items-end gap-2">
                <motion.span
                  className="text-[60px] leading-[54px] tracking-[-0.04em]"
                  style={{ fontVariationSettings: "'wght' 900" }}
                  animate={
                    reduce
                      ? undefined
                      : { y: [0, -3, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
                  }
                >
                  {plan.price}
                </motion.span>
                <span
                  className="pb-1 text-[18px] opacity-90"
                  style={{ fontVariationSettings: "'wght' 650" }}
                >
                  {plan.period}
                </span>
              </div>
              <p className="mb-6 text-[14px] opacity-85">{plan.note}</p>

              <Link
                href={plan.ctaHref}
                className="mb-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[16px] text-[#111] transition hover:scale-[1.02]"
                style={{ fontVariationSettings: "'wght' 700" }}
              >
                {plan.cta}
              </Link>

              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px]">
                    <Check />
                    <span style={{ fontVariationSettings: "'wght' 600" }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.article>
          </TypoStaggerItem>
        ))}
      </TypoStagger>
    </section>
  );
}
