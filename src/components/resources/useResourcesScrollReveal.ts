'use client';

import { useEffect, useRef } from 'react';

/**
 * 挂上 data-animate → 进入视口后 data-revealed，驱动 CSS 入场。
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

    const reveal = () => {
      el.dataset.revealed = '';
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        // 等一帧，确保先应用 data-animate 的隐藏态再播放入场
        requestAnimationFrame(reveal);
        io.disconnect();
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
