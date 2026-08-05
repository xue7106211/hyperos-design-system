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
      </TypoSection.Header>

      <TypoStagger
        className="grid w-full max-w-[1000px] grid-cols-1 gap-5 md:grid-cols-2"
        stagger={0.1}
      >
        {typoValueProp.cards.map((card) => (
          <TypoStaggerItem key={card.title}>
            <Link
              href={card.href}
              className="group typo-panel relative flex h-[min(508px,70vw)] flex-col overflow-hidden rounded-[20px] bg-[var(--typo-card)] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-1 active:scale-[0.99] md:h-[508px]"
            >
              <div className="flex w-full max-w-[400px] flex-col gap-2 px-10 pt-[30px]">
                <h3 className="m-0 text-[28px] leading-[42px] font-semibold tracking-normal text-balance text-[#262626]">
                  {card.title}
                </h3>
                <p className="m-0 text-[20px] leading-[1.55] font-medium tracking-[0.01em] text-pretty text-[#262626]">
                  {card.body}
                </p>
              </div>

              <div className="relative mt-auto min-h-0 flex-1">
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
                          className="typo-anim typo-media size-[72px] rounded-[12px] shadow-[var(--typo-elevation-raised)]"
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
                    width={1011}
                    height={750}
                    className="typo-media pointer-events-none absolute inset-x-0 bottom-0 h-auto w-full object-contain object-bottom transition-transform duration-500 ease-out select-none group-hover:scale-[1.02]"
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
