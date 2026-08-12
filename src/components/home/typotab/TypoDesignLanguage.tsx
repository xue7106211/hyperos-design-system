'use client';

import { typoDesignLanguage } from './content';
import { TypoFeatureCard } from './TypoFeatureCard';
import { TypoStagger, TypoStaggerItem } from './TypoReveal';
import { TypoSection } from './TypoSection';

/**
 * 设计语言宣言区：单列横卡（复用系统特性形式），置于「设计指南」之上。
 */
export function TypoDesignLanguage() {
  return (
    <TypoSection className="typo-section-pad gap-20">
      <TypoSection.Header maxWidthClassName="max-w-[1000px]">
        <TypoSection.Title>{typoDesignLanguage.title}</TypoSection.Title>
        <TypoSection.Lead>{typoDesignLanguage.subtitle}</TypoSection.Lead>
      </TypoSection.Header>

      <TypoStagger
        className="flex w-full max-w-[1000px] flex-col gap-5"
        stagger={0.12}
      >
        {typoDesignLanguage.cards.map((card) => (
          <TypoStaggerItem key={card.title}>
            <TypoFeatureCard {...card} />
          </TypoStaggerItem>
        ))}
      </TypoStagger>
    </TypoSection>
  );
}
