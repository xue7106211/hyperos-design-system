import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { resourcesPage } from '@/lib/resources';

function Reveal({
  index,
  block,
  children,
}: {
  index: number;
  block?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`home-reveal-item${block ? ' resources-hero-reveal-block' : ''}`}
      style={{ '--index': index } as CSSProperties}
    >
      {children}
    </span>
  );
}

export function ResourceHero() {
  const titleWords = resourcesPage.title.split(/\s+/);
  let revealIndex = 0;

  return (
    <header className="resources-hero">
      <h1 className="resources-h1">
        {titleWords.map((word, i) => (
          <span key={word}>
            {i > 0 ? ' ' : null}
            <Reveal index={revealIndex++}>{word}</Reveal>
          </span>
        ))}
      </h1>
      <p className="resources-hero-sub">
        <Reveal index={revealIndex++}>{resourcesPage.description}</Reveal>
      </p>
      <div className="resources-taught-by">
        <Reveal block index={revealIndex++}>
          <span>
            {resourcesPage.taughtByLabel}{' '}
            <Link href={resourcesPage.taughtByHref}>
              {resourcesPage.taughtByName}
            </Link>
          </span>
        </Reveal>
      </div>
    </header>
  );
}
