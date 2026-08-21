'use client';

import { useEffect, useRef, useState } from 'react';
import type { IconEntry, IconFont, IconFontMetrics } from '@/lib/icons';
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

function metricLines(metrics: IconFontMetrics, compact: boolean) {
  const lines = [
    { label: compact ? 'Asc' : 'Ascender', value: metrics.ascender },
    { label: compact ? 'Cap' : 'Cap height', value: metrics.capHeight },
    { label: compact ? 'x' : 'x-height', value: metrics.xHeight },
    { label: compact ? 'Base' : 'Baseline', value: 0 },
    { label: compact ? 'Desc' : 'Descender', value: metrics.descender },
  ];
  return lines.filter((line, index, all) => {
    if (line.label === 'Cap height' || line.label === 'Cap' || line.label === 'x-height' || line.label === 'x') {
      return line.value !== 0;
    }
    return all.findIndex((item) => item.value === line.value) === index;
  });
}

function yPercent(value: number, ascender: number, span: number) {
  return ((ascender - value) / span) * 100;
}

/** Label column width in the same unit space as glyphWidth / span (font units). */
const LABEL_UNITS = 220;

export function IconInspector({
  icon,
  font,
  weight,
  color,
  showSuiteLabel,
  copiedKey,
  onCopy,
}: IconInspectorProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const sync = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
  const contentW = LABEL_UNITS + glyphWidth;
  const aspect = contentW / span;

  // Fit frame inside stage (contain), then derive font size from the real pixel height.
  const frameW = stage.w > 0 && stage.h > 0 ? Math.min(stage.w, stage.h * aspect) : 0;
  const frameH = frameW > 0 ? frameW / aspect : 0;
  const fontSize = frameH > 0 ? frameH * (upm / span) : 0;
  const lines = metrics ? metricLines(metrics, frameW > 0 && frameW < 260) : [];

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
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-3 sm:px-5 sm:pt-4">
        <p className="truncate text-sm font-medium" title={icon.name}>
          {icon.name}
        </p>
        {showSuiteLabel ? (
          <p className="text-xs text-fd-muted-foreground">{font?.label ?? icon.fontId}</p>
        ) : null}
      </div>

      <div className="relative min-h-[9rem] flex-1 overflow-hidden sm:min-h-[12rem]">
        <button
          type="button"
          aria-label={`复制 ${icon.name} 字符`}
          onClick={() => onCopy(`${icon.id}:glyph`, char)}
          className="absolute inset-0 z-10 cursor-pointer"
        />
        <div ref={stageRef} className="pointer-events-none absolute inset-3 grid place-items-center overflow-hidden sm:inset-4">
          {font && frameW > 0 ? (
            <div
              className="relative overflow-hidden"
              style={{ width: frameW, height: frameH }}
            >
              {lines.map((line) => (
                <div
                  key={line.label}
                  className="absolute inset-x-0 flex items-center"
                  style={{ top: `${yPercent(line.value, ascender, span)}%` }}
                >
                  <span
                    className="shrink-0 -translate-y-1/2 truncate px-1 text-left leading-none text-fd-muted-foreground"
                    style={{
                      width: (LABEL_UNITS / contentW) * frameW,
                      fontSize: Math.max(8, frameH * 0.022),
                    }}
                  >
                    {line.label}
                  </span>
                  <span className="h-px min-w-0 flex-1 -translate-y-1/2 border-t border-dashed border-fd-foreground/20" />
                </div>
              ))}
              <span
                aria-hidden
                className="absolute block overflow-hidden text-center [font-synthesis:none]"
                style={{
                  left: (LABEL_UNITS / contentW) * frameW,
                  top: 0,
                  width: (glyphWidth / contentW) * frameW,
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
            </div>
          ) : null}
        </div>
      </div>

      <dl className="grid max-h-[40%] shrink-0 grid-cols-1 gap-x-6 gap-y-1 overflow-y-auto border-t border-fd-border px-4 py-2.5 sm:max-h-none sm:grid-cols-2 sm:gap-x-8 sm:gap-y-2.5 sm:px-5 sm:py-4 sm:pb-6">
        {fields.map((field) => (
          <div key={field.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-2 sm:grid-cols-[7.25rem_minmax(0,1fr)]">
            <dt className="text-[11px] text-fd-muted-foreground">{field.label}</dt>
            <dd>
              {field.copy ? (
                <button
                  type="button"
                  className="max-w-full break-all text-left font-mono text-xs tabular-nums text-fd-foreground hover:text-fd-foreground/80"
                  onClick={() => onCopy(`${icon.id}:${field.part}`, field.copy)}
                >
                  {copyState(field.part) ?? field.value}
                </button>
              ) : (
                <span className="font-mono text-xs tabular-nums text-fd-muted-foreground">{field.value}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
