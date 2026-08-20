'use client';

import { memo, useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { IconEntry, IconFont, IconManifest } from '@/lib/icons';
import {
  ALL_FONTS,
  COLOR_PRESETS,
  codePointToChar,
  filterIcons,
  formatUnicode,
  parseHexColor,
  previewSurfaceHex,
} from '@/lib/icon-query';

type IconGalleryProps = {
  categories?: string[];
  manifest?: IconManifest;
};

function fontOf(manifest: IconManifest, fontId: string): IconFont | undefined {
  return manifest.fonts.find((f) => f.id === fontId);
}

function GlyphPreview({ icon, font }: { icon: IconEntry; font: IconFont | undefined }) {
  if (!font) {
    return <span className="text-[10px] text-fd-muted-foreground">字体缺失</span>;
  }

  return (
    <span
      aria-hidden
      className="leading-none"
      style={{
        fontFamily: `"${font.family}", sans-serif`,
        fontWeight: 'var(--icon-wght)',
        fontVariationSettings: '"wght" var(--icon-wght)',
        fontSize: 'var(--icon-size)',
        color: 'var(--icon-color)',
      }}
    >
      {codePointToChar(icon.unicode)}
    </span>
  );
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

function copyFeedback(copiedKey: string | null): string {
  if (!copiedKey) return '';
  if (copiedKey.endsWith(':ok')) return '已复制';
  if (copiedKey.endsWith(':err')) return '复制失败';
  return '';
}

const IconGrid = memo(function IconGrid({
  manifest,
  icons,
  showSuiteLabel,
  copiedKey,
  onCopy,
}: {
  manifest: IconManifest;
  icons: IconEntry[];
  showSuiteLabel: boolean;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {icons.map((icon) => {
        const font = fontOf(manifest, icon.fontId);
        const unicodeText = formatUnicode(icon.unicode);
        const copyState = (part: string) => {
          if (copiedKey === `${icon.id}:${part}:ok`) return '已复制';
          if (copiedKey === `${icon.id}:${part}:err`) return '复制失败';
          return null;
        };

        return (
          <li key={icon.id} className="flex flex-col overflow-hidden rounded-xl border border-fd-border">
            <button
              type="button"
              aria-label={`复制 ${icon.name} 字符`}
              onClick={() => onCopy(`${icon.id}:glyph`, codePointToChar(icon.unicode))}
              className="flex h-24 items-center justify-center"
              style={{ backgroundColor: 'var(--icon-surface)' }}
            >
              <GlyphPreview icon={icon} font={font} />
            </button>
            <div className="flex flex-1 flex-col gap-1 border-t border-fd-border bg-fd-card p-3">
              {showSuiteLabel ? (
                <p className="text-[10px] text-fd-muted-foreground">{font?.label ?? icon.fontId}</p>
              ) : null}
              <p className="truncate text-xs" title={icon.name}>
                {icon.name}
              </p>
              <button
                type="button"
                className="truncate text-left font-mono text-[10px] text-fd-muted-foreground hover:text-fd-foreground"
                onClick={() => onCopy(`${icon.id}:unicode`, unicodeText)}
              >
                {copyState('unicode') ?? unicodeText}
              </button>
              <button
                type="button"
                className="truncate text-left font-mono text-[10px] text-fd-muted-foreground hover:text-fd-foreground"
                onClick={() => onCopy(`${icon.id}:gid`, String(icon.glyphIndex))}
              >
                {copyState('gid') ?? `Glyph Index ${icon.glyphIndex}`}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
});

function GalleryBody({ manifest }: { manifest: IconManifest }) {
  const [fontId, setFontId] = useState(ALL_FONTS);
  const [query, setQuery] = useState('');
  const [color, setColor] = useState(COLOR_PRESETS[0].hex);
  const [hexDraft, setHexDraft] = useState(COLOR_PRESETS[0].hex);
  const [weight, setWeight] = useState(330);
  const [size, setSize] = useState(32);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const weightMin = Math.min(...manifest.fonts.map((f) => f.weight.min), 150);
  const weightMax = Math.max(...manifest.fonts.map((f) => f.weight.max), 700);
  const surface = previewSurfaceHex(color);
  const galleryVars = {
    '--icon-wght': weight,
    '--icon-size': `${size}px`,
    '--icon-color': color,
    '--icon-surface': surface,
  } as CSSProperties;

  useEffect(() => {
    const styleId = 'hyperos-symbol-faces';
    let el = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = styleId;
      document.head.appendChild(el);
    }
    el.textContent = manifest.fonts
      .map((f) => {
        const fmt = f.path.endsWith('.woff2') ? 'woff2' : 'truetype';
        return `@font-face{font-family:${JSON.stringify(f.family)};src:url(${JSON.stringify(f.path)}) format(${JSON.stringify(fmt)});font-weight:${f.weight.min} ${f.weight.max};font-style:normal;font-display:block;}`;
      })
      .join('\n');
  }, [manifest.fonts]);

  const filtered = useMemo(
    () => filterIcons(manifest.icons, { fontId, query }),
    [manifest.icons, fontId, query],
  );

  const flashCopied = useCallback((key: string) => {
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 1500);
  }, []);

  const onCopy = useCallback(
    async (key: string, text: string) => {
      try {
        await copyText(text);
        flashCopied(`${key}:ok`);
      } catch {
        flashCopied(`${key}:err`);
      }
    },
    [flashCopied],
  );

  const showSuiteLabel = fontId === ALL_FONTS;
  const chipClass = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      active
        ? 'border-fd-foreground bg-fd-foreground text-fd-background'
        : 'border-fd-border text-fd-muted-foreground hover:border-fd-foreground/40 hover:text-fd-foreground'
    }`;

  return (
    <div className="my-6 not-prose space-y-4" style={galleryVars}>
      <div className="sr-only" aria-live="polite">
        {copyFeedback(copiedKey)}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={chipClass(fontId === ALL_FONTS)} onClick={() => setFontId(ALL_FONTS)}>
          全部
        </button>
        {manifest.fonts.map((font) => (
          <button
            key={font.id}
            type="button"
            className={chipClass(fontId === font.id)}
            onClick={() => setFontId(font.id)}
          >
            {font.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-fd-border p-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索名称、Unicode、Glyph Index"
          className="w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                title={preset.label}
                onClick={() => {
                  setColor(preset.hex);
                  setHexDraft(preset.hex);
                }}
                className="size-6 rounded-full border border-fd-border"
                style={{ backgroundColor: preset.hex }}
              />
            ))}
            <input
              value={hexDraft}
              onChange={(e) => {
                const next = e.target.value;
                setHexDraft(next);
                setColor((prev) => parseHexColor(next, prev));
              }}
              className="w-28 rounded-md border border-fd-border bg-fd-background px-2 py-1 font-mono text-xs"
              aria-label="自定义颜色"
            />
          </div>
          <label className="flex min-w-40 flex-1 items-center gap-2 text-xs text-fd-muted-foreground">
            粗细 {weight}
            <input
              type="range"
              min={weightMin}
              max={weightMax}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="flex-1"
            />
          </label>
          <label className="flex min-w-40 flex-1 items-center gap-2 text-xs text-fd-muted-foreground">
            字号 {size}
            <input
              type="range"
              min={16}
              max={64}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="flex-1"
            />
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-fd-border p-8 text-center text-sm text-fd-muted-foreground">
          没有匹配的图标
        </div>
      ) : (
        <IconGrid
          manifest={manifest}
          icons={filtered}
          showSuiteLabel={showSuiteLabel}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
      )}
    </div>
  );
}

export function IconGallery({ manifest: manifestProp }: IconGalleryProps) {
  const [manifest, setManifest] = useState<IconManifest | null>(manifestProp ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (manifestProp) {
      setManifest(manifestProp);
      return;
    }

    // Tina / 无 SSR 时没有服务端清单，才请求公开的 /icons/manifest.json
    let cancelled = false;
    void fetch(`/icons/manifest.json?t=${Date.now()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<IconManifest>;
      })
      .then((data) => {
        if (!cancelled) setManifest(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '加载失败');
      });
    return () => {
      cancelled = true;
    };
  }, [manifestProp]);

  if (error) {
    return (
      <div className="my-6 rounded-xl border border-dashed border-fd-border p-6 text-sm text-fd-muted-foreground">
        无法加载图标清单：{error}
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="my-6 rounded-xl border border-dashed border-fd-border p-6 text-sm text-fd-muted-foreground">
        正在加载图标…
      </div>
    );
  }

  return <GalleryBody manifest={manifest} />;
}
