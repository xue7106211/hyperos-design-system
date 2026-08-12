'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';

export type TypoFeatureCardData = {
  title: string;
  body: string;
  href: string;
  image: string;
  imageAlt: string;
  /** 彩色底；`quiet` 时忽略，改用浅灰表面 */
  color?: string;
  tone?: 'color' | 'quiet';
};

/**
 * 单列横卡：左文右图。
 * - `color`：系统特性等同款彩色底 + 白字
 * - `quiet`：浅灰表面 + 阴影抬升（`--typo-card` / elevation）
 */
export function TypoFeatureCard({
  title,
  body,
  color,
  href,
  image,
  imageAlt,
  tone = 'color',
}: TypoFeatureCardData) {
  const reduce = useReducedMotion();
  const quiet = tone === 'quiet';

  return (
    <motion.article
      className={cn(
        'flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[20px] md:h-[350px] md:flex-row',
        quiet && 'typo-panel typo-panel--quiet',
      )}
      style={quiet || !color ? undefined : { backgroundColor: color }}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      <div className="flex w-full flex-col gap-5 p-10 md:w-1/2 md:max-w-[500px]">
        <h3
          className={cn(
            'm-0 max-w-[420px] tracking-normal text-balance',
            quiet
              ? 'text-[28px] leading-[42px] font-semibold text-[var(--typo-ink)]'
              : 'text-[clamp(32px,4vw,50px)] leading-[1.25] font-extrabold text-white',
          )}
        >
          <Link
            href={href}
            className="text-inherit no-underline transition-opacity duration-150 ease-out hover:opacity-90"
          >
            {title}
          </Link>
        </h3>
        <p
          className={cn(
            'm-0 max-w-[420px] tracking-[0.01em] text-pretty',
            quiet
              ? 'text-[16px] leading-[1.55] font-normal text-[var(--typo-ink-muted)]'
              : 'text-[22px] leading-[1.55] font-semibold text-white',
          )}
        >
          {body}
        </p>
        <Link
          href={href}
          className={cn(
            'mt-auto inline-flex min-h-10 w-fit items-center text-[15px] underline underline-offset-4 transition-opacity duration-150 ease-out hover:opacity-80',
            quiet
              ? 'text-[var(--typo-ink-muted)] decoration-[var(--typo-ink-muted)]/40'
              : 'text-white/90 decoration-white/40 hover:text-white hover:opacity-100',
          )}
        >
          了解更多 →
        </Link>
      </div>

      <div className="relative min-h-[220px] flex-1 overflow-hidden md:min-h-0">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="typo-media typo-media--flush object-cover object-center"
          sizes="(max-width: 768px) 100vw, 500px"
        />
      </div>
    </motion.article>
  );
}
