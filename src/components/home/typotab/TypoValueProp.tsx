'use client';

import Image from 'next/image';
import Link from 'next/link';
import { typoValueProp } from './content';
import { TypoReveal, TypoStagger, TypoStaggerItem } from './TypoReveal';

export function TypoValueProp() {
  return (
    <section className="typo-section-pad gap-[43px]">
      <TypoReveal>
        <h2 className="typo-h2 max-w-[1000px]">{typoValueProp.title}</h2>
      </TypoReveal>

      <TypoStagger
        className="grid w-full max-w-[1000px] grid-cols-1 gap-5 md:grid-cols-2"
        stagger={0.1}
      >
        {typoValueProp.cards.map((card) => (
          <TypoStaggerItem key={card.title}>
            <Link
              href={card.href}
              className="relative flex h-[min(508px,70vw)] flex-col overflow-hidden rounded-[20px] bg-[#f7f7f6] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] md:h-[508px]"
            >
              <div className="flex w-full max-w-[400px] flex-col gap-2 px-10 pt-[30px]">
                <h3
                  className="m-0 text-[28px] leading-[42px] tracking-[-0.04em] text-[#262626]"
                  style={{ fontVariationSettings: "'wght' 683" }}
                >
                  {card.title}
                </h3>
                <p
                  className="m-0 text-[20px] leading-[30px] tracking-[-0.04em] text-[#262626]"
                  style={{
                    fontFamily: 'var(--typo-inter)',
                    fontVariationSettings: "'opsz' 14, 'wght' 520",
                  }}
                >
                  {card.body}
                </p>
              </div>

              <div className="relative mt-auto min-h-0 flex-1">
                {card.variant === 'apps' ? (
                  <div className="absolute inset-0">
                    <Image
                      src={card.image}
                      alt=""
                      fill
                      className="object-cover opacity-80"
                      sizes="480px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a6900]/40 via-[#00d600]/50 to-[#40ff00]/60 mix-blend-multiply" />
                    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-3 p-8">
                      {card.logos?.map((src, i) => (
                        <Image
                          key={src}
                          src={src}
                          alt=""
                          width={72}
                          height={72}
                          className="typo-anim size-[72px] rounded-[18px] shadow-lg"
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
                    className="absolute inset-x-0 bottom-0 h-auto w-full object-contain object-bottom transition duration-500 group-hover:scale-[1.02]"
                  />
                )}
              </div>
            </Link>
          </TypoStaggerItem>
        ))}
      </TypoStagger>
    </section>
  );
}

