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
            四个高频入口：组件库、图标、Token 与工程组件，按需取用。
          </p>
        </>
      }
    >
      <div className="resources-feature-grid resources-grid-frame resources-grid-frame--cols">
        <ResourcesGridCrosses />
        {resourcesFeatured.map((card) => {
          const inner = (
            <>
              <div className="resources-feature-preview">
                <span className="resources-feature-pill">{card.pill}</span>
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
                className="resources-feature-card"
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            );
          }

          return (
            <Link
              key={card.id}
              className="resources-feature-card"
              href={card.href}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </ResourcesSplitSection>
  );
}
