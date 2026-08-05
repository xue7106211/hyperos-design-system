'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { typoShortcuts } from './content';
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
    <div className="absolute top-[-40px] z-[1] flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      <motion.span
        key={KEYS[phase]}
        className="typo-anim flex size-8 items-center justify-center rounded-lg bg-[#f3f3f3] text-sm font-semibold"
        style={
          reduce
            ? undefined
            : { animation: 'typo-pulse-key 0.55s ease-out' }
        }
      >
        {KEYS[phase]}
      </motion.span>
      <span className="relative min-w-[160px] overflow-hidden text-[15px] text-[#262626]">
        <AnimatePresence mode="wait">
          <motion.span
            key={CYCLE[phase]}
            className="block"
            style={{ fontVariationSettings: "'wght' 600" }}
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
    <section className="flex flex-col items-center gap-[100px] px-5 py-[100px]">
      <TypoReveal className="flex max-w-[611px] flex-col items-center gap-5">
        <h2 className="typo-h2">{typoShortcuts.title}</h2>
        <p className="typo-lead">{typoShortcuts.subtitle}</p>
      </TypoReveal>

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
          className="h-auto w-full max-w-[778px]"
        />
      </TypoReveal>
    </section>
  );
}
