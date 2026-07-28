'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { resourcesPageAnchors } from '@/lib/resources';

/** 基准条宽 36px；用 scaleX 变形，避免 animating width */
const BASE_W = 36;

/** 悬停展开态（图二）：相对焦点距离 → scaleX + 强调档；高度恒为 3px */
function expandedScale(distance: number): {
  sx: number;
  sy: number;
  emphasis: 0 | 1 | 2;
} {
  if (distance === 0) return { sx: 1, sy: 1, emphasis: 2 };
  if (distance === 1) return { sx: 22 / BASE_W, sy: 1, emphasis: 1 };
  if (distance === 2) return { sx: 14 / BASE_W, sy: 1, emphasis: 0 };
  return { sx: 10 / BASE_W, sy: 1, emphasis: 0 };
}

/** 默认态（图一）：短胶囊，视觉高 3px */
const COLLAPSED = { sx: 14 / BASE_W, sy: 1 } as const;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

export function ResourcesCodexNav() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const anchors = resourcesPageAnchors
      .map((a) => document.getElementById(a.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (anchors.length === 0) return;

    const update = () => {
      setVisible(window.scrollY > window.innerHeight * 0.35);

      const marker = window.innerHeight * 0.32;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      anchors.forEach((el, i) => {
        const top = el.getBoundingClientRect().top;
        const dist = Math.abs(top - marker);
        if (top <= marker + 48 && dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });

      if (bestDist === Number.POSITIVE_INFINITY) {
        const firstVisible = anchors.findIndex(
          (el) => el.getBoundingClientRect().top < window.innerHeight * 0.85,
        );
        best = firstVisible >= 0 ? firstVisible : 0;
      }

      setActiveIndex(best);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const expanded = hoverIndex !== null;

  return (
    <nav
      className={[
        'resources-codex',
        visible ? 'is-visible' : '',
        expanded ? 'is-expanded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="页面分区导航"
      onMouseLeave={() => setHoverIndex(null)}
    >
      <ul className="resources-codex-list">
        {resourcesPageAnchors.map((anchor, index) => {
          const isActive = index === activeIndex;
          const isHovered = hoverIndex === index;

          const { sx, sy, emphasis } = expanded
            ? expandedScale(Math.abs(index - (hoverIndex ?? 0)))
            : {
                ...COLLAPSED,
                emphasis: (isActive ? 1 : 0) as 0 | 1 | 2,
              };

          return (
            <li key={anchor.id} className="resources-codex-item">
              <button
                type="button"
                className={[
                  'resources-codex-bar',
                  `resources-codex-bar--e${emphasis}`,
                  isActive ? 'is-active' : '',
                  isHovered ? 'is-hovered' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={
                  {
                    '--codex-sx': sx,
                    '--codex-sy': sy,
                  } as CSSProperties
                }
                aria-label={anchor.title}
                aria-current={isActive ? 'location' : undefined}
                onMouseEnter={() => setHoverIndex(index)}
                onFocus={() => setHoverIndex(index)}
                onBlur={() => setHoverIndex(null)}
                onClick={() => scrollToSection(anchor.id)}
              >
                <span className="resources-codex-bar-pill" aria-hidden />
              </button>
              {isHovered ? (
                <div className="resources-codex-preview" role="tooltip">
                  <p className="resources-codex-preview-title">{anchor.title}</p>
                  <p className="resources-codex-preview-desc">
                    {anchor.description}
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
