'use client';

import { type ReactNode } from 'react';
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from 'motion/react';

const easeOut = [0.22, 1, 0.36, 1] as const;

export const typoSpring = {
  type: 'spring' as const,
  stiffness: 120,
  damping: 22,
  mass: 0.85,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: easeOut },
  },
};

export const fadeUpSoft: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: typoSpring,
  },
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
} & Omit<HTMLMotionProps<'div'>, 'children' | 'variants'>;

export function TypoReveal({
  children,
  className,
  variants = fadeUp,
  delay = 0,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function TypoStagger({
  children,
  className,
  stagger = 0.08,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
} & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: 0.04 },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -6% 0px' }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function TypoStaggerItem({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & Omit<HTMLMotionProps<'div'>, 'children' | 'variants'>) {
  return (
    <motion.div className={className} variants={fadeUpSoft} {...rest}>
      {children}
    </motion.div>
  );
}
