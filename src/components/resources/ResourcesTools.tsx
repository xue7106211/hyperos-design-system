import Image from 'next/image';
import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { ResourcesGridCrosses } from '@/components/resources/ResourcesGridCrosses';
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
      <div className="resources-feature-grid resources-feature-grid--tools resources-grid-frame">
        <ResourcesGridCrosses />
        {resourcesTools.map((item) => {
          const pending = !item.href || item.href === '#';
          const className = 'resources-feature-card';
          const inner = (
            <>
              <div className="resources-feature-preview">
                {item.image ? (
                  <Image
                    className="resources-feature-image"
                    src={item.image}
                    alt={item.name}
                    width={640}
                    height={360}
                    sizes="(min-width: 768px) 677px, 100vw"
                  />
                ) : null}
              </div>
              <p className="resources-feature-meta">
                <span className="resources-feature-title">{item.name}</span>
                {', '}
                {item.description}
              </p>
            </>
          );

          if (pending) {
            return (
              <div key={item.name} className={className}>
                {inner}
              </div>
            );
          }

          if (item.external) {
            return (
              <a
                key={item.name}
                className={className}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            );
          }

          return (
            <Link key={item.name} className={className} href={item.href}>
              {inner}
            </Link>
          );
        })}
      </div>
    </ResourcesSplitSection>
  );
}
