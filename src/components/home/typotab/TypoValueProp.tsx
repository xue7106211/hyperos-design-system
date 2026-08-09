'use client';

import Image from 'next/image';
import Link from 'next/link';
import { typoValueProp } from './content';
import { TypoStagger, TypoStaggerItem } from './TypoReveal';
import { TypoSection } from './TypoSection';

export function TypoValueProp() {
  return (
    <TypoSection className="typo-section-pad gap-[43px]">
      <TypoSection.Header maxWidthClassName="max-w-[1000px]">
        <TypoSection.Title>{typoValueProp.title}</TypoSection.Title>
        <TypoSection.Lead>{typoValueProp.subtitle}</TypoSection.Lead>
      </TypoSection.Header>

      <TypoStagger
        className="grid w-full max-w-[1000px] grid-cols-1 gap-5 md:grid-cols-2"
        stagger={0.1}
      >
        {typoValueProp.cards.map((card) => (
          <TypoStaggerItem key={card.title}>
            <Link
              href={card.href}
              className="group typo-panel typo-panel--quiet relative flex h-[min(508px,70vw)] flex-col gap-6 overflow-hidden rounded-[20px] active:scale-[0.96] md:h-[508px]"
            >
              <div className="flex w-full flex-col gap-2 px-10 pt-[30px]">
                <h3 className="m-0 text-[28px] leading-[42px] font-semibold tracking-normal text-balance text-[var(--typo-ink)]">
                  {card.title}
                </h3>
                <p className="m-0 text-[16px] leading-[1.55] font-normal tracking-[0.01em] text-[var(--typo-ink-muted)]">
                  {card.body}
                </p>
              </div>

              <div className="relative min-h-0 flex-1">
                {card.variant === 'apps' ? (
                  <div className="pointer-events-none absolute inset-0 select-none">
                    <Image
                      src={card.image}
                      alt=""
                      fill
                      className="typo-media object-cover opacity-80"
                      sizes="480px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a6900]/35 via-[#00d600]/45 to-[#40ff00]/55 mix-blend-multiply" />
                    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-3 p-8">
                      {card.logos?.map((src, i) => (
                        <Image
                          key={src}
                          src={src}
                          alt=""
                          width={72}
                          height={72}
                          className="typo-anim typo-thumb size-[72px] rounded-[12px] shadow-[var(--typo-elevation-raised)]"
                          style={{
                            animation: `typo-bob ${3.2 + (i % 4) * 0.45}s ease-in-out infinite`,
                            animationDelay: `${i * 0.18}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    fill
                    className="typo-media pointer-events-none object-cover object-center select-none"
                    sizes="(max-width: 768px) 100vw, 490px"
                  />
                )}
              </div>
            </Link>
          </TypoStaggerItem>
        ))}
      </TypoStagger>
    </TypoSection>
  );
}
