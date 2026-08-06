import { PillNav } from '@/components/home/PillNav';
import {
  TypoApps,
  TypoFaq,
  TypoHero,
  TypoPricing,
  TypoRule,
  TypoShortcuts,
  TypoUseCases,
  TypoValueProp,
} from '@/components/home/typotab';

/**
 * 首页：TypoTab 形式 + HyperOS 文案；视觉对齐设计资源中心 surfaces。
 */
export default function HomePage() {
  return (
    <>
      <PillNav />
      <div className="typo-clone">
        <TypoHero />
        <TypoRule />
        <TypoValueProp />
        <TypoRule />
        <TypoShortcuts />
        <TypoRule />
        <TypoUseCases />
        <TypoRule />
        <TypoApps />
        <TypoRule />
        <TypoPricing />
        <TypoRule />
        <TypoFaq />
      </div>
    </>
  );
}
