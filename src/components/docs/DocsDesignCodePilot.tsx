'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { DocsBody } from 'fumadocs-ui/layouts/docs/page';
import { cn } from '@/lib/cn';
import { DocsMode, DocsModeSwitch } from './DocsModeSwitch';

type DocsModeContextValue = {
  mode: DocsMode;
  setMode: (mode: DocsMode) => void;
};

const DocsModeContext = createContext<DocsModeContextValue | null>(null);

const CODE_TOC_ID = 'docs-mode-code-toc';

type TocHeading = {
  id: string;
  title: string;
  depth: 2 | 3;
};

/**
 * Code-mode TOC overlay. Never mutates the Design TOC DOM — that would break
 * Fumadocs scroll-spy / progress thumb (React-owned nodes).
 */
function CodeModeTocPortal() {
  const { mode } = useDocsMode();
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const toc = document.getElementById('nd-toc');
    if (!(toc instanceof HTMLElement)) return;

    const nativeScroll = toc.querySelector<HTMLElement>(
      '#toc-title + *:not(#docs-mode-code-toc)',
    );

    if (mode !== 'code') {
      if (nativeScroll) {
        nativeScroll.hidden = false;
        nativeScroll.style.display = '';
      }
      setMount(null);
      setHeadings([]);
      setActiveId(null);
      return;
    }

    if (nativeScroll) {
      nativeScroll.hidden = true;
      nativeScroll.style.display = 'none';
    }
    setMount(toc);

    const collect = () => {
      const body = document.querySelector('[role="tabpanel"]');
      if (!(body instanceof HTMLElement)) return;

      const next: TocHeading[] = [
        ...body.querySelectorAll<HTMLHeadingElement>('h2[id], h3[id]'),
      ].map((el) => ({
        id: el.id,
        title: el.textContent?.trim() ?? el.id,
        depth: el.tagName === 'H3' ? 3 : 2,
      }));
      setHeadings(next);
      setActiveId(next[0]?.id ?? null);
    };

    const frame = requestAnimationFrame(collect);
    return () => {
      cancelAnimationFrame(frame);
      if (nativeScroll) {
        nativeScroll.hidden = false;
        nativeScroll.style.display = '';
      }
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== 'code' || headings.length === 0) return;

    const nodes = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el instanceof HTMLElement);

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target;
        if (top instanceof HTMLElement && top.id) {
          setActiveId(top.id);
        }
      },
      {
        rootMargin: '0px 0px -70% 0px',
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [mode, headings]);

  if (mode !== 'code' || !mount) return null;

  return createPortal(
    <div
      id={CODE_TOC_ID}
      className="relative min-h-0 flex-1 overflow-auto py-3 text-sm [scrollbar-width:none]"
    >
      <nav className="flex flex-col border-s border-fd-foreground/10">
        {headings.map((item) => {
          const active = item.id === activeId;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              data-active={active ? 'true' : undefined}
              className={cn(
                'border-s-2 py-1 text-[0.8125rem] leading-[1.35] transition-colors',
                item.depth === 3 ? 'ps-4' : 'ps-3',
                active
                  ? 'border-fd-primary font-medium text-fd-primary'
                  : 'border-transparent text-fd-muted-foreground hover:text-fd-foreground',
              )}
            >
              {item.title}
            </a>
          );
        })}
      </nav>
    </div>,
    mount,
  );
}

export function DocsModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DocsMode>('design');
  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return (
    <DocsModeContext.Provider value={value}>
      {children}
      <CodeModeTocPortal />
    </DocsModeContext.Provider>
  );
}

function useDocsMode() {
  const ctx = useContext(DocsModeContext);
  if (!ctx) {
    throw new Error('useDocsMode must be used within DocsModeProvider');
  }
  return ctx;
}

/** Meta bar control: sits left of Copy Markdown */
export function DocsModeToolbarSwitch() {
  const { mode, setMode } = useDocsMode();

  return (
    <DocsModeSwitch
      value={mode}
      onChange={setMode}
      className="shrink-0 [&_button]:px-3 [&_button]:py-1 [&_button]:text-[13px]"
    />
  );
}

/**
 * Pilot shell: switches Design MDX vs Code panel.
 * Mode control lives in the meta actions via DocsModeToolbarSwitch.
 */
export function DocsModeShell({ design, code }: { design: ReactNode; code: ReactNode }) {
  const { mode } = useDocsMode();

  return (
    <DocsBody
      className="pt-6"
      role="tabpanel"
      aria-label={mode === 'design' ? 'Design 内容' : 'Code 内容'}
    >
      {mode === 'design' ? design : code}
    </DocsBody>
  );
}
