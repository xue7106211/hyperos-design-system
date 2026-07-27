import { Component } from 'lucide-react';
import {
  ResourcesFeatureCard,
  ResourcesFeatureCardGrid,
} from '@/components/resources/ResourcesFeatureCard';
import { ResourcesSplitSection } from '@/components/resources/ResourcesSplitSection';
import { resourcesFeatured, resourcesSectionIds } from '@/lib/resources';

export function ResourcesFeatured() {
  return (
    <ResourcesSplitSection
      id={resourcesSectionIds.components}
      className="resources-split-section--spaced"
      icon={
        <Component
          className="resources-split-icon"
          aria-hidden
          strokeWidth={1.75}
        />
      }
      copy={
        <>
          <h2 className="resources-h2 resources-h2-tight">Components</h2>
          <p className="resources-paragraph">
            面向界面设计的 Figma 组件库，覆盖 OS4 主线、OS3 与 AI 探索。
          </p>
        </>
      }
    >
      <ResourcesFeatureCardGrid variant="hero">
        {resourcesFeatured.map((card) => {
          const isWide = 'wide' in card && card.wide;
          const image = 'image' in card ? card.image : undefined;

          return (
            <ResourcesFeatureCard
              key={card.id}
              title={card.title}
              description={card.description}
              href={card.href}
              external={card.external}
              image={image}
              pill={card.pill}
              wide={isWide}
              media={Boolean(isWide && image)}
            />
          );
        })}
      </ResourcesFeatureCardGrid>
    </ResourcesSplitSection>
  );
}
