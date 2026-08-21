'use client';

import { useEffect, useEffectEvent, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { IconEntry, IconFont } from '@/lib/icons';
import {
  codePointToChar,
  formatBBox,
  formatUnicode,
  unicodeToDecimal,
} from '@/lib/icon-query';

type IconInspectorProps = {
  icon: IconEntry;
  font: IconFont | undefined;
  weight: number;
  color: string;
  showSuiteLabel: boolean;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
};

const META_DEFAULT = 280;
const META_MIN = 120;
const PREVIEW_MIN = 144;
const HANDLE_H = 20;

export function IconInspector({
  icon,
  font,
  weight,
  color,
  showSuiteLabel,
  copiedKey,
  onCopy,
}: IconInspectorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [metaHeight, setMetaHeight] = useState(META_DEFAULT);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const sync = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clampMeta = (height: number) => {
    const root = rootRef.current;
    if (!root) return Math.max(META_MIN, height);
    const header = root.querySelector<HTMLElement>('[data-icon-inspector-header]');
    const max = Math.max(
      META_MIN,
      root.clientHeight - (header?.offsetHeight ?? 0) - HANDLE_H - PREVIEW_MIN,
    );
    return Math.min(max, Math.max(META_MIN, Math.round(height)));
  };

  const onPointerMove = useEffectEvent((event: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    // 向上拖增大元数据区，向下拖缩小
    const next = drag.startHeight + (drag.startY - event.clientY);
    setMetaHeight(clampMeta(next));
  });

  const stopDragging = useEffectEvent(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    setMetaHeight((prev) => clampMeta(prev));
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: PointerEvent) => onPointerMove(event);
    const onUp = () => stopDragging();
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sync = () => setMetaHeight((prev) => clampMeta(prev));
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const startDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragRef.current = { startY: event.clientY, startHeight: metaHeight };
    setDragging(true);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  const metrics = font?.metrics;
  const upm = metrics?.unitsPerEm ?? 1000;
  const ascender = metrics?.ascender ?? upm * 0.8;
  const descender = metrics?.descender ?? -upm * 0.2;
  const span = Math.max(ascender - descender, 1);
  const char = codePointToChar(icon.unicode);
  const unicodeText = formatUnicode(icon.unicode);
  const decimal = unicodeToDecimal(icon.unicode);
  const bboxW = icon.bbox ? icon.bbox[2] - icon.bbox[0] : 0;
  const glyphWidth = Math.max(icon.advanceWidth ?? upm, bboxW, 1);
  const aspect = glyphWidth / span;

  // Fit frame inside stage (contain), then derive font size from the real pixel height.
  const frameW = stage.w > 0 && stage.h > 0 ? Math.min(stage.w, stage.h * aspect) : 0;
  const frameH = frameW > 0 ? frameW / aspect : 0;
  const fontSize = frameH > 0 ? frameH * (upm / span) : 0;

  const copyState = (part: string) => {
    if (copiedKey === `${icon.id}:${part}:ok`) return '已复制';
    if (copiedKey === `${icon.id}:${part}:err`) return '复制失败';
    return null;
  };

  const fields = [
    { label: 'Unicode', part: 'unicode', value: unicodeText, copy: unicodeText },
    { label: 'Decimal', part: 'decimal', value: String(decimal), copy: String(decimal) },
    { label: 'Units/Em', part: 'upm', value: String(upm), copy: String(upm) },
    {
      label: 'Advance Width',
      part: 'advance',
      value: String(icon.advanceWidth ?? upm),
      copy: String(icon.advanceWidth ?? upm),
    },
    {
      label: 'Ascender',
      part: 'asc',
      value: String(Math.round(ascender)),
      copy: String(Math.round(ascender)),
    },
    {
      label: 'Descender',
      part: 'desc',
      value: String(Math.round(descender)),
      copy: String(Math.round(descender)),
    },
    {
      label: 'Cap Height',
      part: 'cap',
      value: metrics?.capHeight ? String(metrics.capHeight) : '—',
      copy: metrics?.capHeight ? String(metrics.capHeight) : '',
    },
    {
      label: 'x-height',
      part: 'xh',
      value: metrics?.xHeight ? String(metrics.xHeight) : '—',
      copy: metrics?.xHeight ? String(metrics.xHeight) : '',
    },
    { label: 'BBox', part: 'bbox', value: formatBBox(icon.bbox), copy: formatBBox(icon.bbox) },
    {
      label: 'Glyph Index',
      part: 'gid',
      value: String(icon.glyphIndex),
      copy: String(icon.glyphIndex),
    },
    {
      label: 'PostScript',
      part: 'ps',
      value: font?.postscriptName || '—',
      copy: font?.postscriptName || '',
      wide: true,
    },
    {
      label: 'Version',
      part: 'fontver',
      value: font?.fontVersion || '—',
      copy: font?.fontVersion || '',
      wide: true,
    },
    {
      label: 'Copyright',
      part: 'copyright',
      value: font?.copyright || '—',
      copy: font?.copyright || '',
      wide: true,
    },
    {
      label: 'Trademark',
      part: 'trademark',
      value: font?.trademark || '—',
      copy: font?.trademark || '',
      wide: true,
    },
  ];

  return (
    <div ref={rootRef} className="flex h-full min-h-0 flex-col overflow-hidden">
      <div
        data-icon-inspector-header
        className="flex shrink-0 flex-col justify-center px-4 py-2 sm:px-5"
      >
        <p className="truncate text-sm font-medium tracking-tight" title={icon.name}>
          {icon.name}
        </p>
        {showSuiteLabel ? (
          <p className="mt-0.5 text-xs text-fd-muted-foreground">{font?.label ?? icon.fontId}</p>
        ) : null}
      </div>

      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ backgroundColor: 'var(--icon-surface)' }}
      >
        <button
          type="button"
          aria-label={`复制 ${icon.name} 字符`}
          onClick={() => onCopy(`${icon.id}:glyph`, char)}
          className="absolute inset-0 z-10 cursor-pointer outline-none transition-opacity duration-150 ease-out focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring"
        />
        <div
          ref={stageRef}
          className="pointer-events-none absolute inset-3 grid place-items-center overflow-hidden select-none sm:inset-4"
        >
          {font && frameW > 0 ? (
            <span
              aria-hidden
              className="block overflow-hidden text-center [font-synthesis:none]"
              style={{
                width: frameW,
                height: frameH,
                fontFamily: `"${font.family}", sans-serif`,
                fontWeight: weight,
                fontVariationSettings: `"wght" ${weight}`,
                fontSize,
                // Line box = fontSize * (span/upm) = frameH, so half-leading is ~0 and
                // the typographic baseline lands on Ascender→0 within the frame.
                lineHeight: span / upm,
                color,
              }}
            >
              {char}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-col border-t border-fd-border">
        <button
          type="button"
          role="separator"
          aria-label="拖拽调整详情高度"
          aria-orientation="horizontal"
          aria-valuenow={metaHeight}
          aria-valuemin={META_MIN}
          onPointerDown={startDrag}
          className={`flex h-5 w-full cursor-ns-resize touch-none items-center justify-center outline-none transition-colors duration-150 ease-out focus-visible:bg-fd-accent/40 ${
            dragging ? 'bg-fd-accent/30' : 'hover:bg-fd-accent/20'
          }`}
        >
          <span
            aria-hidden
            className="pointer-events-none h-1 w-9 rounded-full bg-fd-muted-foreground/35"
          />
        </button>
        <dl
          className="grid grid-cols-1 gap-x-6 gap-y-0.5 overflow-y-auto px-4 pb-2 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-1 sm:px-5 sm:pb-6"
          style={{ height: metaHeight }}
        >
          {fields.map((field) => (
            <div
              key={field.label}
              className={`grid items-start gap-2 ${
                field.wide
                  ? 'grid-cols-[6.5rem_minmax(0,1fr)] sm:col-span-2 sm:grid-cols-[7.25rem_minmax(0,1fr)]'
                  : 'grid-cols-[6.5rem_minmax(0,1fr)] items-center sm:grid-cols-[7.25rem_minmax(0,1fr)]'
              }`}
            >
              <dt className="pt-1 text-[11px] text-fd-muted-foreground sm:pt-0">{field.label}</dt>
              <dd>
                {field.copy ? (
                  <button
                    type="button"
                    className="min-h-8 max-w-full break-all rounded-sm py-1 text-left font-mono text-xs tabular-nums text-fd-foreground outline-none transition-colors duration-150 ease-out hover:text-fd-foreground/70 focus-visible:ring-2 focus-visible:ring-fd-ring"
                    onClick={() => onCopy(`${icon.id}:${field.part}`, field.copy)}
                  >
                    {copyState(field.part) ?? field.value}
                  </button>
                ) : (
                  <span className="inline-flex min-h-8 items-center font-mono text-xs tabular-nums text-fd-muted-foreground">
                    {field.value}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
