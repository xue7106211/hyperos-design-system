import Link from 'next/link';
import { Library, Rocket } from 'lucide-react';
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
          <h2 className="resources-h2 resources-h2-tight">你会找到这些资源</h2>
          <p className="resources-paragraph">
            按设计与工程分组。点击条目即可打开
            Figma、文档或代码库；标注待补充的条目我们正在补齐链接。
          </p>
          <p className="resources-paragraph">资源目录：</p>
          <p className="resources-paragraph resources-split-note">
            后续还会继续补充更多资产入口。
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
