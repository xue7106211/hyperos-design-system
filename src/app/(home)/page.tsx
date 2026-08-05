import { PillNav } from '@/components/home/PillNav';
import {
  TypoApps,
  TypoFaq,
  TypoHero,
  TypoPricing,
  TypoShortcuts,
  TypoUseCases,
  TypoValueProp,
} from '@/components/home/typotab';

/**
 * 首页：TypoTab 形式 + HyperOS 能力文案（导航保留 PillNav；页脚稍后）。
 * 能力映射：设计规范 / 组件 / Token / 图标 / 多端 / 资源
 */
export default function HomePage() {
  return (
    <>
      <PillNav />
      <div className="typo-clone">
        <TypoHero />
        <TypoValueProp />
        <TypoShortcuts />
        <TypoUseCases />
        <TypoApps />
        <TypoPricing />
        <TypoFaq />
      </div>
    </>
  );
}
