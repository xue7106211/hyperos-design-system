'use client';

import { cn } from '@/lib/cn';

export type DocsMode = 'design' | 'code';

type DocsModeSwitchProps = {
  value: DocsMode;
  onChange: (mode: DocsMode) => void;
  className?: string;
  /** Avoid duplicate ids when TOC + popover both mount a switch */
  idPrefix?: string;
};

const MODES: { id: DocsMode; label: string }[] = [
  { id: 'design', label: 'Design' },
  { id: 'code', label: 'Code' },
];

/**
 * Page-level Design / Code segmented control.
 * Pilot placement: meta bar, left of Copy Markdown.
 */
export function DocsModeSwitch({
  value,
  onChange,
  className,
  idPrefix = 'docs-mode',
}: DocsModeSwitchProps) {
  return (
    <div
      role="tablist"
      aria-label="文档内容模式"
      className={cn(
        'inline-flex w-fit items-center gap-0.5 rounded-full border border-fd-border bg-fd-muted/40 p-0.5',
        className,
      )}
    >
      {MODES.map((mode) => {
        const selected = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={selected}
            id={`${idPrefix}-${mode.id}`}
            onClick={() => onChange(mode.id)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-[color,background-color,box-shadow] duration-150 ease-out',
              selected
                ? 'bg-fd-background text-fd-foreground shadow-sm'
                : 'text-fd-muted-foreground hover:text-fd-foreground',
            )}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
