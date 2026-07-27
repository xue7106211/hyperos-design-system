import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { resourcesPage, resourcesTeamAvatars } from '@/lib/resources';

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
      <div className="resources-avatar-stack" aria-label="维护团队成员">
        <Reveal block index={revealIndex++}>
          <ul className="resources-avatar-list">
            {resourcesTeamAvatars.map((person, i) => (
              <li
                key={person.name}
                className="resources-avatar"
                style={{ zIndex: resourcesTeamAvatars.length - i }}
                title={person.name}
              >
                {person.src ? (
                  <Image
                    src={person.src}
                    alt={person.name}
                    width={36}
                    height={36}
                  />
                ) : (
                  <span aria-hidden>{person.initials}</span>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </header>
  );
}
