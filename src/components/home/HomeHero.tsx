import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { BookOpen, Palette } from 'lucide-react';
import { HyperOSLogo } from '@/components/HyperOSLogo';
import { HalftoneBloom } from '@/components/home/HalftoneBloom';
import { defaultDocsRoute } from '@/lib/shared';

function Reveal({ index, children }: { index: number; children: ReactNode }) {
  return (
    <span
      className="home-reveal-item"
      style={{ '--index': index } as CSSProperties}
    >
      {children}
    </span>
  );
}

export function HomeHero() {
  return (
    <main className="relative grid min-h-dvh place-items-center px-6">
      <HalftoneBloom />
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <HyperOSLogo className="h-8 sm:h-10" priority />
        <p className="home-copy max-w-lg text-pretty text-xl font-medium tracking-[0.025em] sm:text-2xl sm:leading-8">
          <Reveal index={0}>了解</Reveal>{' '}
          <Reveal index={1}>HyperOS</Reveal>{' '}
          <Reveal index={2}>
            <Link
              href={`${defaultDocsRoute}/general/design-token`}
              className="home-link inline"
            >
              <Palette
                aria-hidden
                strokeWidth={1.75}
                className="mr-1.5 inline size-5 -translate-y-px scale-[0.85] text-current sm:size-6"
              />
              设计规范
            </Link>
          </Reveal>
          <Reveal index={3}>，</Reveal>
          <Reveal index={4}>并</Reveal>{' '}
          <Reveal index={5}>探索</Reveal>{' '}
          <Reveal index={6}>我们的</Reveal>{' '}
          <Reveal index={7}>
            <Link href={defaultDocsRoute} className="home-link inline">
              <BookOpen
                aria-hidden
                strokeWidth={1.75}
                className="mr-1.5 inline size-5 -translate-y-px scale-[0.85] text-current sm:size-6"
              />
              设计系统
            </Link>
          </Reveal>
        </p>
      </div>
    </main>
  );
}
