import { Puzzle } from 'lucide-react';
import {
  ResourcesFeatureCard,
  ResourcesFeatureCardGrid,
} from '@/components/resources/ResourcesFeatureCard';
import { ResourcesSplitSection } from '@/components/resources/ResourcesSplitSection';
import { resourcesSectionIds, resourcesTools } from '@/lib/resources';

export function ResourcesTools() {
  return (
    <ResourcesSplitSection
      id={resourcesSectionIds.designTools}
      className="resources-split-section--spaced"
      icon={
        <Puzzle
          className="resources-split-icon"
          aria-hidden
          strokeWidth={1.75}
        />
      }
      copy={
        <>
          <h2 className="resources-h2 resources-h2-tight">Plugin & Tools</h2>
          <p className="resources-paragraph">
            面向 Figma 的效率插件，覆盖材质填充、图层语义化与 Token
            规范性检查。
          </p>
        </>
      }
    >
      <ResourcesFeatureCardGrid variant="stack">
        {resourcesTools.map((item, index) => (
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
  );
}
