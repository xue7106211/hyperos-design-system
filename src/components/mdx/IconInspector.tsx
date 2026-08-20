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

function metricLines(metrics: IconFontMetrics) {
  const lines = [
    { label: 'Ascender', value: metrics.ascender },
    { label: 'Cap height', value: metrics.capHeight },
    { label: 'x-height', value: metrics.xHeight },
    { label: 'Baseline', value: 0 },
    { label: 'Descender', value: metrics.descender },
  ];
  return lines.filter((line, index, all) => {
    if (line.label === 'Cap height' || line.label === 'x-height') {
      return line.value !== 0;
    }
    return all.findIndex((item) => item.value === line.value) === index;
  });
}

function yPercent(value: number, ascender: number, span: number) {
  return ((ascender - value) / span) * 100;
}

export function IconInspector({
  icon,
  font,
  weight,
  color,
  showSuiteLabel,
  copiedKey,
  onCopy,
}: IconInspectorProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameH, setFrameH] = useState(280);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const sync = () => setFrameH(el.clientHeight);
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
  const lines = metrics ? metricLines(metrics) : [];
  const baselinePct = yPercent(0, ascender, span);
  const fontSize = frameH * (upm / span);

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
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-5 pt-4">
        <p className="truncate text-sm font-medium" title={icon.name}>
          {icon.name}
        </p>
        {showSuiteLabel ? (
          <p className="text-xs text-fd-muted-foreground">{font?.label ?? icon.fontId}</p>
        ) : null}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <button
          type="button"
          aria-label={`复制 ${icon.name} 字符`}
          onClick={() => onCopy(`${icon.id}:glyph`, char)}
          className="absolute inset-0 z-10 cursor-pointer"
        />
        <div ref={frameRef} className="pointer-events-none absolute inset-y-4 inset-x-0 select-none">
          {lines.map((line) => (
            <div
              key={line.label}
              className="absolute inset-x-0 flex items-center"
              style={{ top: `${yPercent(line.value, ascender, span)}%` }}
            >
              <span className="w-[5.25rem] shrink-0 -translate-y-1/2 px-3 text-[10px] leading-none text-fd-muted-foreground">
                {line.label}
              </span>
              <span className="h-px flex-1 -translate-y-1/2 border-t border-dashed border-fd-foreground/20" />
            </div>
          ))}
          {font ? (
            <span className="absolute inset-0 block text-center leading-none">
              <span
                aria-hidden
                className="inline-block align-baseline"
                style={{ height: `${baselinePct}%`, width: 0 }}
              />
              <span
                aria-hidden
                className="inline-block align-baseline [font-synthesis:none]"
                style={{
                  fontFamily: `"${font.family}", sans-serif`,
                  fontWeight: weight,
                  fontVariationSettings: `"wght" ${weight}`,
                  fontSize,
                  lineHeight: 1,
                  color,
                }}
              >
                {char}
              </span>
            </span>
          ) : null}
        </div>
      </div>

      <dl className="grid shrink-0 grid-cols-1 gap-x-8 gap-y-2.5 border-t border-fd-border px-5 py-4 pb-6 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="grid grid-cols-[7.25rem_minmax(0,1fr)] items-baseline gap-2">
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
