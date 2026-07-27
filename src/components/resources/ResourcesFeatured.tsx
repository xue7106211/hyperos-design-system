import Image from 'next/image';
import Link from 'next/link';
import { Rocket } from 'lucide-react';
import { ResourcesGridCrosses } from '@/components/resources/ResourcesGridCrosses';
import { ResourcesSplitSection } from '@/components/resources/ResourcesSplitSection';
import { resourcesFeatured } from '@/lib/resources';

export function ResourcesFeatured() {
  return (
    <ResourcesSplitSection
      className="resources-split-section--spaced"
      icon={
        <Rocket
          className="resources-split-icon"
          aria-hidden
          strokeWidth={1.75}
        />
      }
      copy={
        <>
          <h2 className="resources-h2 resources-h2-tight">Components</h2>
          <p className="resources-paragraph">
            先从 OS4 组件库开始，再按需取用 Token 与工程组件。
          </p>
        </>
      }
    >
      <div className="resources-feature-grid resources-grid-frame resources-grid-frame--cols resources-grid-frame--hero-row">
        <ResourcesGridCrosses />
        {resourcesFeatured.map((card) => {
          const isWide = 'wide' in card && card.wide;
          const image = 'image' in card ? card.image : undefined;
          const className = [
            'resources-feature-card',
            isWide ? 'resources-feature-card--wide' : '',
            /* 宽卡贴边展示原图；半宽卡保留固定高度，图铺满预览区 */
            isWide && image ? 'resources-feature-card--media' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const inner = (
            <>
              {isWide ? (
                <div className="resources-feature-row-crosses" aria-hidden>
                  <span className="resources-grid-cross resources-grid-cross--row-l" />
                  <span className="resources-grid-cross resources-grid-cross--row-c" />
                  <span className="resources-grid-cross resources-grid-cross--row-r" />
                </div>
              ) : null}
              <div className="resources-feature-preview">
                {image ? (
                  <Image
                    className="resources-feature-image"
                    src={image}
                    alt={card.title}
                    width={1024}
                    height={576}
                    sizes={isWide ? '(min-width: 768px) 677px, 100vw' : '50vw'}
                  />
                ) : (
                  <span className="resources-feature-pill">{card.pill}</span>
                )}
              </div>
              <p className="resources-feature-meta">
                <span className="resources-feature-title">{card.title}</span>
                {', '}
                {card.description}
              </p>
            </>
          );

          if (card.external) {
            return (
              <a
                key={card.id}
                className={className}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            );
          }

          return (
            <Link key={card.id} className={className} href={card.href}>
              {inner}
            </Link>
          );
        })}
      </div>
    </ResourcesSplitSection>
  );
}
