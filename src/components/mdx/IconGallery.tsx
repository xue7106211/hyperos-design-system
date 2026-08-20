'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
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
import { IconInspector } from './IconInspector';

type IconGalleryProps = {
  categories?: string[];
  manifest?: IconManifest;
  /** `app`：独立页一级套件导航；`embed`：文档 / Tina 内嵌 */
  variant?: 'embed' | 'app';
};

function fontOf(manifest: IconManifest, fontId: string): IconFont | undefined {
  return manifest.fonts.find((f) => f.id === fontId);
}

function GlyphPreview({
  icon,
  font,
  tone = 'default',
}: {
  icon: IconEntry;
  font: IconFont | undefined;
  tone?: 'default' | 'on-selected';
}) {
  if (!font) {
    return <span className="text-[10px] text-fd-muted-foreground">字体缺失</span>;
  }

  return (
    <span
      aria-hidden
      className="leading-none [font-synthesis:none]"
      style={{
        fontFamily: `"${font.family}", sans-serif`,
        fontWeight: 'var(--icon-wght)',
        fontVariationSettings: '"wght" var(--icon-wght)',
        fontSize: 'var(--icon-size)',
        color: tone === 'on-selected' ? 'currentColor' : 'var(--icon-color)',
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
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
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

const IconPickerGrid = memo(function IconPickerGrid({
  manifest,
  icons,
  selectedId,
  onSelect,
}: {
  manifest: IconManifest;
  icons: IconEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = icons.findIndex((icon) => icon.id === selectedId);
    if (index < 0) return;
    const container = scrollerRef.current;
    const first = container?.querySelector<HTMLElement>('[data-icon-cell]');
    if (!container || !first) return;
    const cols = Math.max(1, Math.round(container.clientWidth / first.offsetWidth));
    let next = index;
    if (event.key === 'ArrowRight') next = Math.min(icons.length - 1, index + 1);
    else if (event.key === 'ArrowLeft') next = Math.max(0, index - 1);
    else if (event.key === 'ArrowDown') next = Math.min(icons.length - 1, index + cols);
    else if (event.key === 'ArrowUp') next = Math.max(0, index - cols);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = icons.length - 1;
    else return;
    event.preventDefault();
    onSelect(icons[next].id);
  };

  return (
    <div
      ref={scrollerRef}
      role="listbox"
      aria-label="图标"
      aria-activedescendant={selectedId ? `icon-cell-${selectedId}` : undefined}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] content-start outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      style={{ '--icon-size': '1.35rem' } as CSSProperties}
    >
      {icons.map((icon) => {
        const selected = icon.id === selectedId;
        const font = fontOf(manifest, icon.fontId);
        return (
          <button
            key={icon.id}
            id={`icon-cell-${icon.id}`}
            data-icon-cell
            type="button"
            role="option"
            aria-selected={selected}
            aria-label={icon.name}
            tabIndex={-1}
            onClick={() => onSelect(icon.id)}
            className={`flex min-h-11 touch-manipulation items-center justify-center rounded-lg transition-colors duration-150 ${
              selected
                ? 'bg-fd-foreground text-fd-background'
                : 'text-fd-foreground [@media(hover:hover)]:hover:bg-fd-accent/70'
            }`}
          >
            <GlyphPreview icon={icon} font={font} tone="on-selected" />
          </button>
        );
      })}
    </div>
  );
});

function GalleryBody({
  manifest,
  variant,
}: {
  manifest: IconManifest;
  variant: 'embed' | 'app';
}) {
  const [fontId, setFontId] = useState(ALL_FONTS);
  const [query, setQuery] = useState('');
  const [color, setColor] = useState(COLOR_PRESETS[0].hex);
  const [hexDraft, setHexDraft] = useState(COLOR_PRESETS[0].hex);
  const [weight, setWeight] = useState(330);
  const [size, setSize] = useState(32);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(manifest.icons[0]?.id ?? null);

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

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((current) => (current && filtered.some((icon) => icon.id === current) ? current : filtered[0].id));
  }, [filtered]);

  useEffect(() => {
    if (!selectedId) return;
    document.getElementById(`icon-cell-${selectedId}`)?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  const selected = filtered.find((icon) => icon.id === selectedId) ?? null;

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
  const isApp = variant === 'app';
  const suiteItems = [{ id: ALL_FONTS, label: '全部' }, ...manifest.fonts.map((font) => ({ id: font.id, label: font.label }))];
  const suiteTitle =
    fontId === ALL_FONTS ? '全部' : (manifest.fonts.find((font) => font.id === fontId)?.label ?? fontId);

  const suiteNav = isApp ? (
    <nav aria-label="图标套件" className="flex min-w-0 flex-1 items-stretch gap-0.5 overflow-x-auto">
      {suiteItems.map((item) => {
        const active = fontId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            className={`relative shrink-0 px-3 py-2 text-sm font-medium transition-colors ${
              active ? 'text-fd-foreground' : 'text-fd-muted-foreground hover:text-fd-foreground'
            }`}
            onClick={() => setFontId(item.id)}
          >
            {item.label}
            {active ? <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-fd-foreground" /> : null}
          </button>
        );
      })}
    </nav>
  ) : (
    <nav aria-label="图标套件" className="flex flex-wrap items-center gap-2">
      {suiteItems.map((item) => {
        const active = fontId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? 'border-fd-foreground bg-fd-foreground text-fd-background'
                : 'border-fd-border text-fd-muted-foreground hover:border-fd-foreground/40 hover:text-fd-foreground'
            }`}
            onClick={() => setFontId(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  const tools = (
    <div className={`flex flex-col gap-3 ${isApp ? '' : 'rounded-xl border border-fd-border p-3'}`}>
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
        {isApp ? null : (
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
        )}
      </div>
    </div>
  );

  if (isApp) {
    return (
      <div className="not-prose flex h-dvh flex-col overflow-hidden" style={galleryVars}>
        <div className="sr-only" aria-live="polite">
          {copyFeedback(copiedKey)}
        </div>
        <header className="sticky top-0 z-40 border-b border-fd-border bg-fd-background/90 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-2 sm:px-4">
            {suiteNav}
            <ThemeSwitch mode="light-dark" className="ms-auto shrink-0 border-0 bg-transparent" />
          </div>
        </header>
        <div className="shrink-0 border-b border-fd-border px-4 py-3">{tools}</div>
        {filtered.length === 0 ? (
          <div className="m-4 rounded-xl border border-dashed border-fd-border p-8 text-center text-sm text-fd-muted-foreground">
            没有匹配的图标
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 overflow-hidden max-lg:flex-col">
            <section className="flex min-h-0 w-full flex-col overflow-hidden max-lg:h-[min(48vh,28rem)] lg:w-[40%] lg:max-w-[38rem]">
              {selected ? (
                <IconInspector
                  icon={selected}
                  font={fontOf(manifest, selected.fontId)}
                  weight={weight}
                  color={color}
                  showSuiteLabel={showSuiteLabel}
                  copiedKey={copiedKey}
                  onCopy={onCopy}
                />
              ) : null}
            </section>
            <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-t border-fd-border lg:border-t-0 lg:border-l">
              <p className="shrink-0 px-4 py-3 text-sm text-fd-muted-foreground">
                {suiteTitle} · {filtered.length} glyphs
              </p>
              <div className="min-h-0 flex-1 overflow-auto px-2 pb-6">
                <IconPickerGrid
                  manifest={manifest}
                  icons={filtered}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>
            </section>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="my-6 not-prose space-y-4" style={galleryVars}>
      <div className="sr-only" aria-live="polite">
        {copyFeedback(copiedKey)}
      </div>
      {suiteNav}
      {tools}
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

export function IconGallery({ manifest: manifestProp, variant = 'embed' }: IconGalleryProps) {
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

  return <GalleryBody variant={variant} manifest={manifest} />;
}
