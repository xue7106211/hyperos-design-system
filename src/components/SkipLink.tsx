'use client';

import { usePathname } from 'next/navigation';

/**
 * Keyboard skip target: docs content is fumadocs' #nd-page article;
 * home, icons, and resources expose #main.
 */
export function SkipLink() {
  const pathname = usePathname();
  const href = pathname.startsWith('/docs') ? '#nd-page' : '#main';

  return (
    <a
      href={href}
      className="skip-link"
      onClick={(event) => {
        const target = document.querySelector<HTMLElement>(href);
        if (!target) return;
        event.preventDefault();
        if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
        target.focus();
      }}
    >
      跳到正文
    </a>
  );
}
