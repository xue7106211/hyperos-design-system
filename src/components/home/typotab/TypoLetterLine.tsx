'use client';

import { motion, useReducedMotion } from 'motion/react';

function splitChars(text: string) {
  return [...text];
}

export function TypoLetterLine({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const chars = splitChars(text);

  if (reduce) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      className={className}
      aria-label={text}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.028, delayChildren: delay },
        },
      }}
      style={{ display: 'block' }}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          aria-hidden
          variants={{
            hidden: { opacity: 0, y: '0.45em', filter: 'blur(6px)' },
            visible: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          style={{
            display: 'inline-block',
            whiteSpace: ch === ' ' ? 'pre' : undefined,
            fontWeight: 'var(--typo-fw-extrabold)',
          }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}
