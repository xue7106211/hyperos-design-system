'use client';

import { useEffect, useRef } from 'react';

/**
 * 内容需进入视口中部偏上后再入场，避免刚露边角就播完。
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

        // 顶部越过「视口底部往上 32%」这条线才播，保证人眼跟得上
        const triggerLine = window.innerHeight * 0.68;
        if (entry.boundingClientRect.top > triggerLine) return;

        requestAnimationFrame(reveal);
        io.disconnect();
      },
      {
        // 多档阈值，滚动过程中持续取样 top 位置
        threshold: [0, 0.08, 0.16, 0.24, 0.35, 0.5],
        rootMargin: '0px 0px -8% 0px',
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
