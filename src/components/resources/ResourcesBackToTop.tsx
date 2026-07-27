'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

const SHOW_AFTER_PX = 400;

export function ResourcesBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={['resources-back-to-top', visible ? 'is-visible' : '']
        .filter(Boolean)
        .join(' ')}
      aria-label="返回顶部"
      onClick={() => {
        const reduceMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;
        window.scrollTo({
          top: 0,
          behavior: reduceMotion ? 'auto' : 'smooth',
        });
      }}
    >
      <ChevronUp aria-hidden strokeWidth={1.75} />
    </button>
  );
}
