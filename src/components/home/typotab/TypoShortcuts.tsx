'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { typoShortcuts } from './content';
import { TypoSection } from './TypoSection';
import { TypoReveal } from './TypoReveal';

const CYCLE = typoShortcuts.cycle;
const KEYS = typoShortcuts.cycleKeys;
const CYCLE_MS = 1800;

function ShortcutStatus() {
  const [phase, setPhase] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhase((p) => (p + 1) % CYCLE.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="absolute top-[-40px] z-[1] flex items-center gap-2 rounded-full px-4 py-3 shadow-[var(--typo-elevation-float)]"
      style={{ backgroundColor: 'var(--typo-surface)' }}
    >
      <motion.span
        key={KEYS[phase]}
        className="typo-anim flex size-8 items-center justify-center rounded-[10px] font-mono text-sm font-semibold tabular-nums text-[var(--typo-ink)]"
        style={{
          backgroundColor: 'var(--typo-surface-muted)',
          ...(reduce ? {} : { animation: 'typo-pulse-key 0.55s ease-out' }),
        }}
      >
        {KEYS[phase]}
      </motion.span>
      <span className="relative min-w-[160px] overflow-hidden text-[15px] text-[var(--typo-ink)]">
        <AnimatePresence mode="wait">
          <motion.span
            key={CYCLE[phase]}
            className="block font-semibold"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {CYCLE[phase]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

export function TypoShortcuts() {
  return (
    <TypoSection className="flex flex-col items-center gap-[100px] px-5 py-[100px]">
      <TypoSection.Header>
        <TypoSection.Title>{typoShortcuts.title}</TypoSection.Title>
        <TypoSection.Lead>{typoShortcuts.subtitle}</TypoSection.Lead>
      </TypoSection.Header>

      <TypoReveal
        className="relative flex w-full max-w-[1000px] flex-col items-center"
        variants={{
          hidden: { opacity: 0, y: 36, scale: 0.98 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          },
        }}
      >
        <ShortcutStatus />
        <Image
          src={typoShortcuts.keyboardSrc}
          alt={typoShortcuts.keyboardAlt}
          width={1556}
          height={670}
          className="typo-media h-auto w-full max-w-[778px]"
        />
      </TypoReveal>
    </TypoSection>
  );
}
