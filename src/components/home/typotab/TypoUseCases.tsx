'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { typoUseCases } from './content';
import { TypoStagger, TypoStaggerItem } from './TypoReveal';
import { TypoSection } from './TypoSection';

type UseCaseCardData = (typeof typoUseCases.cards)[number];

function UseCaseCard({
  title,
  body,
  color,
  href,
  image,
  imageAlt,
}: UseCaseCardData) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      className="flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[20px] md:h-[350px] md:flex-row"
      style={{ backgroundColor: color }}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      <div className="flex w-full flex-col gap-5 p-10 md:w-1/2 md:max-w-[500px]">
        <h3 className="m-0 max-w-[420px] text-[clamp(32px,4vw,50px)] leading-[1.25] font-extrabold tracking-normal text-balance text-white">
          <Link
            href={href}
            className="text-inherit no-underline transition-opacity duration-150 ease-out hover:opacity-90"
          >
            {title}
          </Link>
        </h3>
        <p className="m-0 max-w-[420px] text-[22px] leading-[1.55] font-semibold tracking-[0.01em] text-pretty text-white">
          {body}
        </p>
        <Link
          href={href}
          className="mt-auto inline-flex min-h-10 w-fit items-center text-[15px] text-white/90 underline decoration-white/40 underline-offset-4 transition-colors duration-150 ease-out hover:text-white"
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

export function TypoUseCases() {
  return (
    <TypoSection className="typo-section-pad gap-20">
      <TypoSection.Header>
        <TypoSection.Title>{typoUseCases.title}</TypoSection.Title>
        <TypoSection.Lead>{typoUseCases.subtitle}</TypoSection.Lead>
      </TypoSection.Header>

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
    </TypoSection>
  );
}
