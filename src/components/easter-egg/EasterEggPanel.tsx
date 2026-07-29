'use client';

import {
  useEffect,
  useRef,
  useState,
  type TransitionEvent,
} from 'react';
import './easter-egg.css';

export type EasterEggPanelProps = {
  open: boolean;
  onClose: () => void;
};

const FLARE_SESSION_KEY = 'hyperos-easter-egg-flare';

/**
 * Keep the dialog mounted through the exit transition so close feels interruptible
 * (transition from current state), instead of unmounting on the first frame.
 */
export function EasterEggPanel({ open, onClose }: EasterEggPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [present, setPresent] = useState(open);
  const [active, setActive] = useState(false);
  /** Extra core flare once per browser session (marketing intro budget). */
  const [flare, setFlare] = useState(false);

  useEffect(() => {
    if (open) {
      setPresent(true);
      try {
        const seen = sessionStorage.getItem(FLARE_SESSION_KEY);
        if (!seen) {
          sessionStorage.setItem(FLARE_SESSION_KEY, '1');
          setFlare(true);
        } else {
          setFlare(false);
        }
      } catch {
        setFlare(true);
      }
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setActive(true));
      });
      return () => cancelAnimationFrame(id);
    }

    setActive(false);
    const timeout = window.setTimeout(() => setPresent(false), 450);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open || !present) return;

    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeRef.current?.focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [open, present]);

  const handlePanelTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== 'opacity' && event.propertyName !== 'transform') {
      return;
    }
    if (!open && !active) {
      setPresent(false);
    }
  };

  if (!present) return null;

  const state = active ? 'open' : 'closed';

  return (
    <div className="easter-egg-root fixed inset-0 z-[100] flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="关闭彩蛋"
        data-state={state}
        className="easter-egg-overlay absolute inset-0"
        onClick={onClose}
      />
      <div className="easter-egg-stage" data-state={state}>
        <div className="easter-egg-bloom" aria-hidden="true" />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="easter-egg-title"
          aria-describedby="easter-egg-body"
          data-state={state}
          data-flare={flare ? 'true' : undefined}
          className="easter-egg-panel"
          onTransitionEnd={handlePanelTransitionEnd}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="easter-egg-close"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="easter-egg-mark" aria-hidden="true">
            <span className="easter-egg-mark-glyph">
              <span className="easter-egg-mark-core" />
            </span>
          </div>

          <div className="easter-egg-copy">
            <h2 id="easter-egg-title" className="easter-egg-title">
              恭喜你来到了无人区
            </h2>
            <p id="easter-egg-body" className="easter-egg-body">
              规范都在外面，这里只留给偶然路过的人。
            </p>
          </div>

          <footer className="easter-egg-footer">
            <hr className="easter-egg-rule" />
            <p className="easter-egg-sign">薛困惑，2026 年 7 月</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
