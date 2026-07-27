import { Wrench } from 'lucide-react';
import {
  ResourcesFeatureCard,
  ResourcesFeatureCardGrid,
} from '@/components/resources/ResourcesFeatureCard';
import { ResourcesSplitSection } from '@/components/resources/ResourcesSplitSection';
import { resourcesTools } from '@/lib/resources';

export function ResourcesTools() {
  return (
    <ResourcesSplitSection
      className="resources-split-section--spaced"
      icon={
        <Wrench
          className="resources-split-icon"
          aria-hidden
          strokeWidth={1.75}
        />
      }
      copy={
        <>
          <h2 className="resources-h2 resources-h2-tight">设计工具</h2>
          <p className="resources-paragraph">
            插件、协作与效率工具，辅助更快落地 HyperOS 界面。
          </p>
        </>
      }
    >
      <ResourcesFeatureCardGrid variant="stack">
        {resourcesTools.map((item) => (
          <ResourcesFeatureCard
            key={item.name}
            title={item.name}
            description={item.description}
            href={item.href}
            external={item.external}
            image={item.image}
            imageWidth={item.imageWidth}
            imageHeight={item.imageHeight}
            media={false}
          />
        ))}
      </ResourcesFeatureCardGrid>
    </ResourcesSplitSection>
  );
}
