import { Baseline, Gem, PaintBucket, Shapes } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  ResourcesFeatureCard,
  ResourcesFeatureCardGrid,
} from '@/components/resources/ResourcesFeatureCard';
import { ResourcesSplitSection } from '@/components/resources/ResourcesSplitSection';
import { resourcesTopics } from '@/lib/resources';

const topicIcons: Record<string, ReactNode> = {
  'design-token': (
    <PaintBucket className="resources-split-icon" aria-hidden strokeWidth={1.75} />
  ),
  fonts: (
    <Baseline className="resources-split-icon" aria-hidden strokeWidth={1.75} />
  ),
  icon: (
    <Shapes className="resources-split-icon" aria-hidden strokeWidth={1.75} />
  ),
  brand: (
    <Gem className="resources-split-icon" aria-hidden strokeWidth={1.75} />
  ),
};

export function ResourcesTopics() {
  return (
    <>
      {resourcesTopics.map((topic) => (
        <ResourcesSplitSection
          key={topic.id}
          id={topic.id}
          className="resources-split-section--spaced"
          icon={topicIcons[topic.id]}
          copy={
            <>
              <h2 className="resources-h2 resources-h2-tight">{topic.title}</h2>
              <p className="resources-paragraph">{topic.description}</p>
            </>
          }
        >
          <ResourcesFeatureCardGrid variant="stack">
            {topic.items.map((item, index) => (
              <ResourcesFeatureCard
                key={item.name}
                title={item.name}
                description={item.description}
                href={item.href}
                external={item.external}
                image={item.image}
                imageWidth={item.imageWidth}
                imageHeight={item.imageHeight}
                media={Boolean(item.image)}
                dividerCrosses={index > 0}
              />
            ))}
          </ResourcesFeatureCardGrid>
        </ResourcesSplitSection>
      ))}
    </>
  );
}
