import Link from 'next/link';
import { Library } from 'lucide-react';
import { ResourcesGridCrosses } from '@/components/resources/ResourcesGridCrosses';
import { ResourcesSplitSection } from '@/components/resources/ResourcesSplitSection';
import { resourcesCatalog } from '@/lib/resources';

function CatalogItemLink({
  name,
  description,
  href,
  external,
}: {
  name: string;
  description: string;
  href: string;
  external?: boolean;
}) {
  const pending = !href || href === '#';
  const isHash = href.startsWith('#') && href.length > 1;
  const body = (
    <>
      <p className="resources-skills-name">{name}</p>
      <p className="resources-skills-desc">{description}</p>
    </>
  );

  if (pending) {
    return <div className="resources-skills-item">{body}</div>;
  }

  if (isHash) {
    return <a href={href}>{body}</a>;
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

export function ResourcesCatalog() {
  return (
    <ResourcesSplitSection
      icon={
        <Library
          className="resources-split-icon"
          aria-hidden
          strokeWidth={1.75}
        />
      }
      copy={
        <>
          <h2 className="resources-h2 resources-h2-tight">Catalog</h2>
          <p className="resources-paragraph">
            按设计与工程分组。点击条目可跳转到页内对应资源区。
          </p>
        </>
      }
    >
      <div className="resources-skills-card resources-grid-frame">
        <ResourcesGridCrosses />
        <div className="resources-skills-grid">
          {resourcesCatalog.map((col) => (
            <div key={col.title} className="resources-skills-col">
              <p className="resources-skills-heading">{col.title}</p>
              <ul className="resources-skills-list">
                {col.items.map((item) => (
                  <li key={item.name}>
                    <CatalogItemLink {...item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </ResourcesSplitSection>
  );
}
