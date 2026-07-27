import Image from 'next/image';
import Link from 'next/link';
import { Aperture, Baseline, PaintBucket, Shapes } from 'lucide-react';
import type { ReactNode } from 'react';
import { ResourcesGridCrosses } from '@/components/resources/ResourcesGridCrosses';
import { ResourcesSplitSection } from '@/components/resources/ResourcesSplitSection';
import { resourcesTopics, type ToolItem } from '@/lib/resources';

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
    <Aperture className="resources-split-icon" aria-hidden strokeWidth={1.75} />
  ),
};

function TopicItemLink({ name, description, href, external }: ToolItem) {
  const pending = !href || href === '#';
  const body = (
    <>
      <p className="resources-skills-name">{name}</p>
      <p className="resources-skills-desc">{description}</p>
    </>
  );

  if (pending) {
    return <div className="resources-skills-item">{body}</div>;
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    );
  }

  return <Link href={href}>{body}</Link>;
}

function TopicFeatureCards({ items }: { items: ToolItem[] }) {
  return (
    <div className="resources-feature-grid resources-feature-grid--tools resources-grid-frame">
      <ResourcesGridCrosses />
      {items.map((item) => {
        const pending = !item.href || item.href === '#';
        const className = [
          'resources-feature-card',
          item.image ? 'resources-feature-card--media' : '',
        ]
          .filter(Boolean)
          .join(' ');
        const inner = (
          <>
            <div className="resources-feature-preview">
              {item.image ? (
                <Image
                  className="resources-feature-image"
                  src={item.image}
                  alt={item.name}
                  width={item.imageWidth ?? 640}
                  height={item.imageHeight ?? 360}
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
  );
}

export function ResourcesTopics() {
  return (
    <>
      {resourcesTopics.map((topic) => {
        const withImages = topic.items.some((item) => item.image);

        return (
          <ResourcesSplitSection
            key={topic.id}
            className="resources-split-section--spaced"
            icon={topicIcons[topic.id]}
            copy={
              <>
                <h2 className="resources-h2 resources-h2-tight">{topic.title}</h2>
                <p className="resources-paragraph">{topic.description}</p>
              </>
            }
          >
            {withImages ? (
              <TopicFeatureCards items={topic.items} />
            ) : (
              <div className="resources-skills-card resources-grid-frame">
                <ResourcesGridCrosses />
                <ul className="resources-skills-list resources-tools-list">
                  {topic.items.map((item) => (
                    <li key={item.name}>
                      <TopicItemLink {...item} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ResourcesSplitSection>
        );
      })}
    </>
  );
}
