'use client';

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { typoHero } from './content';

/** Settle once scroll progress reaches the end of the media reveal range */
const MEDIA_REVEAL_END = 1;
/** First-paint desk tilt — hero centerpiece needs a hard read before scroll */
const MEDIA_TILT_DEG = 44;
const HERO_MEDIA_INTRO_KEY = 'hyperos-home-hero-media-intro';
const HERO_MEDIA_INTRO_EASE = [0.32, 0.72, 0, 1] as const;

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
  const mediaRef = useRef<HTMLDivElement>(null);
  // Progress ≈ 0 on first paint (media center still low); upright by mid-viewport
  const { scrollYProgress } = useScroll({
    target: mediaRef,
    offset: ['center 0.95', 'center 0.48'],
  });

  const introOpacity = useMotionValue(1);
  const introY = useMotionValue(0);

  // Once per session: settle into the tilted hero pose (maps to load, not scroll)
  useLayoutEffect(() => {
    if (reduce) {
      introOpacity.set(1);
      introY.set(0);
      return;
    }

    let playIntro = true;
    try {
      if (sessionStorage.getItem(HERO_MEDIA_INTRO_KEY) === '1') {
        playIntro = false;
      } else {
        sessionStorage.setItem(HERO_MEDIA_INTRO_KEY, '1');
      }
    } catch {
      playIntro = true;
    }

    if (!playIntro) return;

    introOpacity.set(0);
    introY.set(40);
    const opacityAnim = animate(introOpacity, 1, {
      duration: 0.85,
      ease: HERO_MEDIA_INTRO_EASE,
      delay: 0.06,
    });
    const yAnim = animate(introY, 0, {
      duration: 0.85,
      ease: HERO_MEDIA_INTRO_EASE,
      delay: 0.06,
    });
    return () => {
      opacityAnim.stop();
      yAnim.stop();
    };
  }, [reduce, introOpacity, introY]);

  // Progress follows scroll until the media fully settles, then locks (no reverse)
  const revealProgress = useMotionValue(reduce ? MEDIA_REVEAL_END : 0);

  useEffect(() => {
    if (reduce) {
      revealProgress.set(MEDIA_REVEAL_END);
      return;
    }
    const current = scrollYProgress.get();
    if (current >= MEDIA_REVEAL_END) {
      revealProgress.set(MEDIA_REVEAL_END);
      return;
    }
    revealProgress.set(current);
  }, [reduce, revealProgress, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (reduce) return;
    if (revealProgress.get() >= MEDIA_REVEAL_END) return;
    if (latest >= MEDIA_REVEAL_END) {
      revealProgress.set(MEDIA_REVEAL_END);
      return;
    }
    revealProgress.set(latest);
  });

  // Hold a strong tilt through most of the range, then resolve upright (1:1 scroll)
  const mediaRotateX = useTransform(
    revealProgress,
    [0, 0.55, 1],
    [MEDIA_TILT_DEG, 22, 0],
  );
  const mediaScrollY = useTransform(revealProgress, [0, 1], [0, 36]);
  const mediaScale = useTransform(revealProgress, [0, 1], [0.86, 1]);

  const titleLine1Words = typoHero.titleLine1.split(/\s+/);
  let revealIndex = 0;

  return (
    <section
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
            className="typo-badge typo-badge--sky"
          >
            <span className="typo-badge__chip">新</span>
            <span className="typo-badge__label">{typoHero.badge}</span>
            <svg
              aria-hidden
              className="typo-badge__chevron"
              width="12"
              height="12"
              viewBox="0 0 12 12"
            >
              <path
                d="M4.4 2.6 7.6 6 4.4 9.4"
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

      <div
        ref={mediaRef}
        className="relative z-[1] flex w-full max-w-[1240px] justify-center px-4 pb-24 sm:px-6"
        style={
          reduce
            ? undefined
            : ({ perspective: 1000 } as CSSProperties)
        }
      >
        <motion.div
          className="w-full will-change-transform"
          style={
            reduce
              ? undefined
              : {
                  opacity: introOpacity,
                  y: introY,
                  scale: mediaScale,
                  rotateX: mediaRotateX,
                  transformOrigin: '50% 100%',
                  transformStyle: 'preserve-3d',
                }
          }
        >
          <motion.div
            className="w-full"
            style={reduce ? undefined : { y: mediaScrollY }}
          >
            <div className="w-full overflow-hidden rounded-[20px]">
              {/*
                Hero is LCP + heavily transformed (tilt/scale). Prefer the original
                asset over the image optimizer so retina never gets a stale/low-res WebP.
              */}
              <Image
                src={typoHero.demoSrc}
                alt={typoHero.demoAlt}
                width={3840}
                height={2160}
                className="typo-media typo-media--flush h-auto w-full"
                sizes="(max-width: 1240px) calc(100vw - 2rem), 1240px"
                quality={90}
                priority
                unoptimized
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
