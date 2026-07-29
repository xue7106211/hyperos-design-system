'use client';

import { useEffect, useRef } from 'react';

export type EasterEggPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function EasterEggPanel({ open, onClose }: EasterEggPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeRef.current?.focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="关闭彩蛋"
        className="absolute inset-0 bg-black/40 transition-opacity duration-200"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="easter-egg-title"
        aria-describedby="easter-egg-body"
        className="relative z-[1] w-full max-w-sm rounded-xl border border-fd-border bg-fd-background p-6 shadow-lg transition-opacity duration-200"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md px-2 py-1 text-sm text-fd-muted-foreground hover:text-fd-foreground"
        >
          关闭
        </button>
        <h2
          id="easter-egg-title"
          className="pr-12 text-lg font-medium text-fd-foreground"
        >
          恭喜你来到了无人区
        </h2>
        <p
          id="easter-egg-body"
          className="mt-3 text-sm leading-relaxed text-fd-muted-foreground"
        >
          规范都在外面，这里只留给偶然路过的人。
        </p>
        <p className="mt-6 text-xs text-fd-muted-foreground/80">
          薛困惑，2026 年 7 月
        </p>
      </div>
    </div>
  );
}
