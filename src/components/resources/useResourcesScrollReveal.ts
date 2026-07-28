'use client';

import { useEffect, useRef } from 'react';

/**
 * 挂上 data-animate → 进入可读区后 data-revealed。
 * 用 scroll + IO 双通道，避免「已相交但 top 未过线」时 IO 不再回调导致永远不显示。
 * prefers-reduced-motion 时不挂属性，内容保持可见。
 */
export function useResourcesScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    el.dataset.animate = '';
    let revealed = false;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      el.dataset.revealed = '';
      cleanup();
    };

    /** 顶部进入视口上 75% 再播，偏早一点保证中央可见时已出现 */
    const inReadableZone = () => {
      const { top, bottom } = el.getBoundingClientRect();
      if (bottom <= 0 || top >= window.innerHeight) return false;
      return top <= window.innerHeight * 0.75;
    };

    const tryReveal = () => {
      if (!inReadableZone()) return;
      requestAnimationFrame(reveal);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        tryReveal();
      },
      {
        threshold: [0, 0.05, 0.1, 0.2, 0.35],
        rootMargin: '0px 0px -10% 0px',
      },
    );

    const onScrollOrResize = () => tryReveal();

    const cleanup = () => {
      io.disconnect();
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };

    io.observe(el);
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    tryReveal();

    return cleanup;
  }, []);

  return ref;
}
