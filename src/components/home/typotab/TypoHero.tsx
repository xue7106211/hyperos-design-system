'use client';

import {
  type CSSProperties,
  type ReactNode,
  useRef,
} from 'react';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { typoHero } from './content';

/** Soft block reveal — same contract as /resources ResourceHero */
function HeroReveal({
  index,
  block,
  className,
  children,
}: {
  index: number;
  block?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={[
        'typo-hero-reveal-item',
        block ? 'typo-hero-reveal-block' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--index': index } as CSSProperties}
    >
      {children}
    </span>
  );
}

/** ASCII / Latin tokens — optical weight vs PingFang */
function isLatinToken(text: string) {
  return /^[\x00-\x7F]+$/.test(text.trim());
}

function FloatingShape({
  className,
  delay,
  duration,
  rotate,
}: {
  className: string;
  delay: number;
  duration: number;
  rotate: number;
}) {
  return (
    <span
      aria-hidden
      className={`typo-anim pointer-events-none absolute select-none text-[var(--typo-hero-ink)]/70 ${className}`}
      style={
        {
          '--typo-rot': `${rotate}deg`,
          animation: `typo-float-rotate ${duration}s ease-in-out ${delay}s infinite`,
        } as CSSProperties
      }
    >
      ✦
    </span>
  );
}

export function TypoHero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 48]);
  const mediaScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, reduce ? 1 : 0.98],
  );

  const titleLine1Words = typoHero.titleLine1.split(/\s+/);
  let revealIndex = 0;

  return (
    <section
      ref={sectionRef}
      className="typo-hero relative flex flex-col items-center gap-10 overflow-visible pt-20"
    >
      <div
        aria-hidden
        className="typo-hero__bg pointer-events-none absolute inset-0 z-0 overflow-hidden"
      />

      <FloatingShape
        className="top-[22%] left-[12%] text-3xl"
        delay={0}
        duration={5.5}
        rotate={-12}
      />
      <FloatingShape
        className="top-[28%] right-[14%] text-2xl"
        delay={0.6}
        duration={6.5}
        rotate={18}
      />
      <FloatingShape
        className="top-[18%] right-[28%] text-lg"
        delay={1.2}
        duration={4.8}
        rotate={8}
      />

      <div className="relative z-[1] flex w-full max-w-[1000px] flex-col items-center gap-9 px-5 pb-5 pt-20">
        <HeroReveal block index={revealIndex++}>
          <Link
            href={typoHero.badgeHref}
            className="typo-badge typo-badge--sky inline-flex h-[30px] items-center gap-3.5 rounded-full py-1 pr-3 pl-1 text-[12px] font-normal tracking-normal no-underline hover:scale-[1.02] active:scale-[0.96]"
          >
            <span
              className="inline-flex h-[22px] items-center rounded-full px-2 text-[12px] font-normal leading-none"
              style={{
                backgroundColor: 'var(--typo-accent-soft)',
                color: 'var(--typo-hero-badge-fg)',
              }}
            >
              新
            </span>
            <span className="leading-none">{typoHero.badge}</span>
            <svg
              aria-hidden
              width="14"
              height="14"
              viewBox="0 0 14 14"
              className="shrink-0"
              style={{ color: 'var(--typo-accent)' }}
            >
              <path
                d="M5.2 3.2 8.8 7 5.2 10.8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </HeroReveal>

        <div className="relative flex w-full max-w-[960px] flex-col items-center gap-5">
          <h1 className="typo-hero-title m-0 text-center text-[clamp(40px,7vw,70px)] leading-[1.2] tracking-normal text-[var(--typo-hero-ink)]">
            <span className="typo-hero-title-line">
              {titleLine1Words.map((word, i) => (
                <span key={`${word}-${i}`}>
                  {i > 0 ? ' ' : null}
                  <HeroReveal
                    index={revealIndex++}
                    className={
                      isLatinToken(word) ? 'typo-hero-latin' : undefined
                    }
                  >
                    {word}
                  </HeroReveal>
                </span>
              ))}
            </span>
            <HeroReveal block index={revealIndex++}>
              {typoHero.titleLine2}
            </HeroReveal>
          </h1>
          <p className="m-0 max-w-[560px] text-center text-[clamp(18px,2.2vw,22px)] leading-[1.6] font-semibold tracking-[0.01em] text-pretty text-[var(--typo-hero-ink-muted)]">
            <HeroReveal index={revealIndex++}>{typoHero.subtitle}</HeroReveal>
          </p>
        </div>

        <HeroReveal block index={revealIndex++}>
          <Link
            href={typoHero.ctaHref}
            className="group relative inline-flex h-[58px] min-w-[44px] items-center justify-center gap-3 overflow-hidden rounded-full py-[18px] pr-[22px] pl-6 transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-[0.96]"
            style={{
              backgroundColor: 'var(--typo-cta-bg)',
              color: 'var(--typo-cta-fg)',
            }}
          >
            <span
              aria-hidden
              className="typo-anim pointer-events-none absolute top-[-14px] h-[84px] w-[70px] -skew-x-[11deg] bg-white opacity-90 blur-[5px] mix-blend-soft-light select-none"
              style={{ animation: 'typo-shine 2.8s linear infinite' }}
            />
            <BookOpen
              aria-hidden
              className="relative size-[18px] shrink-0"
              strokeWidth={2}
            />
            <span className="relative text-[18px] leading-[1.2] font-bold">
              {typoHero.cta}
            </span>
          </Link>
        </HeroReveal>
      </div>

      <motion.div
        className="relative z-[1] flex w-full max-w-[1240px] justify-center px-4 pb-24 sm:px-6"
        style={{ y: mediaY, scale: mediaScale }}
      >
        <HeroReveal block className="w-full" index={revealIndex}>
          <div
            className="w-full overflow-hidden rounded-[12px]"
            style={{ boxShadow: 'var(--typo-elevation-media)' }}
          >
            <Image
              src={typoHero.demoSrc}
              alt={typoHero.demoAlt}
              width={1024}
              height={576}
              className="typo-media h-auto w-full"
              priority
            />
          </div>
        </HeroReveal>
      </motion.div>
    </section>
  );
}
