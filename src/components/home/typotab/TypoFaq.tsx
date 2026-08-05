'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { typoFaq } from './content';
import { TypoReveal } from './TypoReveal';

export function TypoFaq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section className="flex flex-col items-center gap-10 px-5 py-24">
      <TypoReveal className="flex max-w-[610px] flex-col items-center gap-5">
        <h2 className="typo-h2">{typoFaq.title}</h2>
        <p className="typo-lead">
          {typoFaq.contactPrefix}
          <Link
            href={typoFaq.contactHref}
            className="underline decoration-black/30 underline-offset-4"
          >
            {typoFaq.contactLabel}
          </Link>
          。
        </p>
      </TypoReveal>

      <TypoReveal className="w-full max-w-[924px]">
        {typoFaq.items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.question} className="border-b border-[#e8e8e8]">
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span
                  className="text-[22px] leading-[33px] tracking-[-0.04em] text-[#262626]"
                  style={{ fontVariationSettings: "'wght' 660" }}
                >
                  {item.question}
                </span>
                <motion.span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center text-[28px] leading-none text-[#262626]"
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 320, damping: 22 }
                  }
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    key="answer"
                    initial={
                      reduce ? false : { height: 0, opacity: 0 }
                    }
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p
                      className="m-0 max-w-[820px] pb-6 text-[18px] leading-[1.55] text-[#555]"
                      style={{ fontVariationSettings: "'wght' 520" }}
                    >
                      {item.answer}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </TypoReveal>
    </section>
  );
}
