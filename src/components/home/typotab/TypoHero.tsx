'use client';

import { type CSSProperties, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { typoHero } from './content';
import { TypoLetterLine } from './TypoLetterLine';
import { typoSpring } from './TypoReveal';

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
      className={`typo-anim pointer-events-none absolute text-white/70 select-none ${className}`}
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
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);
  const mediaScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, reduce ? 1 : 0.96],
  );

  return (
    <section
      ref={sectionRef}
      className="typo-hero relative flex flex-col items-center gap-10 overflow-visible pt-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{
          /* Eased blue→cyan→white (avoids hard banding of 3-stop linear) */
          background:
            'linear-gradient(180deg, rgb(71, 114, 255) 0%, rgb(55, 130, 255) 18%, rgb(28, 155, 255) 42%, rgb(0, 185, 255) 62%, rgb(160, 230, 255) 78%, rgb(255, 255, 255) 100%)',
        }}
      />

      <FloatingShape
        className="top-[22%] left-[12%] text-3xl opacity-60"
        delay={0}
        duration={5.5}
        rotate={-12}
      />
      <FloatingShape
        className="top-[28%] right-[14%] text-2xl opacity-50"
        delay={0.6}
        duration={6.5}
        rotate={18}
      />
      <FloatingShape
        className="top-[18%] right-[28%] text-lg opacity-40"
        delay={1.2}
        duration={4.8}
        rotate={8}
      />

      <div className="relative z-[1] flex w-full max-w-[1000px] flex-col items-center gap-9 px-5 pb-5 pt-20">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...typoSpring, delay: 0.05 }}
        >
          <Link
            href={typoHero.badgeHref}
            className="inline-flex min-h-10 items-center gap-3.5 rounded-full bg-white py-1.5 pr-3 pl-1 text-[13px] font-bold text-[#2B6BFF] shadow-[var(--typo-elevation-raised)] transition-[transform,box-shadow] duration-150 ease-out hover:scale-[1.02] hover:shadow-[var(--typo-elevation-raised-hover)] active:scale-[0.96]"
          >
            <span className="rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#2B6BFF]">
              新
            </span>
            <span>{typoHero.badge}</span>
            <span aria-hidden className="text-[12px] opacity-70">
              ›
            </span>
          </Link>
        </motion.div>

        <div className="relative flex w-full max-w-[960px] flex-col items-center gap-5">
          <h1 className="m-0 text-center text-[clamp(40px,7vw,70px)] leading-[1.15] font-extrabold tracking-[-0.04em] text-balance text-white">
            <TypoLetterLine text={typoHero.titleLine1} delay={0.15} />
            <TypoLetterLine text={typoHero.titleLine2} delay={0.45} />
          </h1>
          <motion.p
            className="m-0 max-w-[480px] text-center text-[clamp(18px,2.2vw,22px)] leading-[1.5] font-semibold tracking-[-0.04em] text-pretty text-white"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {typoHero.subtitle}
          </motion.p>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...typoSpring, delay: 1.05 }}
          whileHover={reduce ? undefined : { scale: 1.02 }}
          whileTap={reduce ? undefined : { scale: 0.96 }}
        >
          <Link
            href={typoHero.ctaHref}
            className="group relative inline-flex h-[58px] min-w-[44px] items-center justify-center gap-3 overflow-hidden rounded-full bg-black py-[18px] pr-[22px] pl-6 text-white"
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
        </motion.div>
      </div>

      <motion.div
        className="relative z-[1] flex w-full max-w-[1000px] justify-center px-5 pb-8"
        style={{ y: mediaY, scale: mediaScale }}
        initial={reduce ? false : { opacity: 0, y: 48, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="w-full overflow-hidden rounded-[12px]"
          style={{
            boxShadow: 'var(--typo-elevation-media)',
            transformStyle: 'preserve-3d',
            perspective: 1200,
          }}
        >
          <Image
            src={typoHero.demoSrc}
            alt={typoHero.demoAlt}
            width={1920}
            height={1080}
            className="typo-media h-auto w-full"
            priority
          />
        </div>
      </motion.div>
    </section>
  );
}
