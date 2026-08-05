'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { typoUseCases } from './content';
import { TypoReveal, TypoStagger, TypoStaggerItem } from './TypoReveal';

function UseCaseCard({
  title,
  body,
  color,
  video,
  poster,
  href,
}: (typeof typoUseCases.cards)[number]) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <motion.article
      className="flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[20px] md:h-[350px] md:flex-row"
      style={{ backgroundColor: color }}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      <div className="flex w-full flex-col gap-5 p-10 md:w-1/2 md:max-w-[500px]">
        <h3
          className="m-0 max-w-[420px] text-[clamp(32px,4vw,50px)] leading-[1.2] tracking-[-0.04em] text-white"
          style={{ fontVariationSettings: "'wght' 850" }}
        >
          <Link
            href={href}
            className="text-inherit no-underline hover:opacity-90"
          >
            {title}
          </Link>
        </h3>
        <p
          className="m-0 max-w-[420px] text-[22px] leading-[33px] tracking-[-0.04em] text-white"
          style={{ fontVariationSettings: "'wght' 660" }}
        >
          {body}
        </p>
        <Link
          href={href}
          className="mt-auto inline-flex w-fit text-[15px] text-white/90 underline decoration-white/40 underline-offset-4 hover:text-white"
        >
          了解更多 →
        </Link>
      </div>

      <div className="relative min-h-[220px] flex-1 md:min-h-0">
        <video
          ref={ref}
          className="absolute inset-0 size-full object-cover"
          src={video}
          poster={poster}
          muted
          loop
          playsInline
          onClick={toggle}
        />
        <motion.button
          type="button"
          onClick={toggle}
          aria-label={playing ? '暂停' : '播放'}
          className="absolute top-1/2 left-1/2 z-[1] flex size-[70px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
          whileHover={reduce ? undefined : { scale: 1.08 }}
          whileTap={reduce ? undefined : { scale: 0.94 }}
        >
          {playing ? (
            <span className="flex gap-1.5">
              <span className="h-5 w-1.5 rounded-sm bg-white" />
              <span className="h-5 w-1.5 rounded-sm bg-white" />
            </span>
          ) : (
            <span className="ml-1 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
          )}
        </motion.button>
      </div>
    </motion.article>
  );
}

export function TypoUseCases() {
  return (
    <section className="typo-section-pad gap-20">
      <TypoReveal className="flex max-w-[611px] flex-col items-center gap-5">
        <h2 className="typo-h2">{typoUseCases.title}</h2>
        <p className="typo-lead">{typoUseCases.subtitle}</p>
      </TypoReveal>

      <TypoStagger
        className="flex w-full max-w-[1000px] flex-col gap-5"
        stagger={0.12}
      >
        {typoUseCases.cards.map((card) => (
          <TypoStaggerItem key={card.title}>
            <UseCaseCard {...card} />
          </TypoStaggerItem>
        ))}
      </TypoStagger>
    </section>
  );
}
