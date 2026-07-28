import Link from 'next/link';
import { Library } from 'lucide-react';
import { ResourcesCatalogFrame } from '@/components/resources/ResourcesCatalogFrame';
import { ResourcesSplitSection } from '@/components/resources/ResourcesSplitSection';
import { resourcesCatalog, resourcesSectionIds } from '@/lib/resources';

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
      <p className="resources-skills-name">
        <span>{name}</span>
        {pending ? (
          <span className="resources-skills-status">即将上线</span>
        ) : null}
      </p>
      <p className="resources-skills-desc">{description}</p>
    </>
  );

  if (pending) {
    return (
      <div className="resources-skills-item resources-skills-item--pending">
        {body}
      </div>
    );
  }

  if (isHash) {
    return <a href={href}>{body}</a>;
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${name}（新窗口）`}
      >
        {body}
      </a>
    );
  }

  return <Link href={href}>{body}</Link>;
}

export function ResourcesCatalog() {
  return (
    <ResourcesSplitSection
      id={resourcesSectionIds.catalog}
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
            设计与工程资源目录，条目可跳转至页内对应分区。
          </p>
        </>
      }
    >
      <ResourcesCatalogFrame>
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
      </ResourcesCatalogFrame>
    </ResourcesSplitSection>
  );
}
