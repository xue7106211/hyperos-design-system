import { preload } from 'react-dom';
import { BackToTop } from '@/components/BackToTop';
import { PillNav } from '@/components/home/PillNav';
import {
  TypoApps,
  TypoFaq,
  TypoHero,
  TypoRule,
  TypoShortcuts,
  TypoUseCases,
  TypoValueProp,
} from '@/components/home/typotab';
import { typoHero } from '@/components/home/typotab/content';

/**
 * 首页：TypoTab 形式 + HyperOS 文案；视觉对齐设计资源中心 surfaces。
 */
export default function HomePage() {
  preload(typoHero.demoSrc, { as: 'image' });

  return (
    <>
      <PillNav />
      <div className="typo-clone">
        <TypoHero />
        <TypoRule />
        <TypoValueProp />
        <TypoRule />
        <TypoUseCases />
        <TypoRule />
        <TypoShortcuts />
        <TypoRule />
        <TypoApps />
        <TypoRule />
        <TypoFaq />
      </div>
      <BackToTop />
    </>
  );
}
