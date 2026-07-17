'use client';

import { useEffect, useMemo, useState } from 'react';
import type { IconEntry, IconManifest } from '@/lib/icons';

type IconGalleryProps = {
  /** Limit to these category ids; empty = all */
  categories?: string[];
  /** When omitted (e.g. Tina), fetch `/icons/manifest.json` */
  manifest?: IconManifest;
};

function IconPreview({ icon }: { icon: IconEntry }) {
  if (icon.multicolor) {
    return (
      <img
        src={icon.path}
        alt=""
        width={28}
        height={28}
        loading="lazy"
        className="size-7 object-contain"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="size-7 shrink-0"
      style={{
        backgroundColor: '#111111',
        WebkitMaskImage: `url(${icon.path})`,
        maskImage: `url(${icon.path})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
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

function GalleryBody({
  categories: categoryFilter = [],
  manifest,
}: {
  categories?: string[];
  manifest: IconManifest;
}) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const availableCategories = useMemo(() => {
    if (categoryFilter.length === 0) return manifest.categories;
    const allow = new Set(categoryFilter);
    return manifest.categories.filter((c) => allow.has(c.id));
  }, [manifest.categories, categoryFilter]);

  const filtered = useMemo(() => {
    return manifest.icons.filter((icon) => {
      if (categoryFilter.length > 0 && !categoryFilter.includes(icon.category)) {
        return false;
      }
      if (activeCategory !== 'all' && icon.category !== activeCategory) {
        return false;
      }
      return true;
    });
  }, [manifest.icons, activeCategory, categoryFilter]);

  const flashCopied = (key: string) => {
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 1500);
  };

  const onCopyName = async (icon: IconEntry) => {
    await copyText(icon.name);
    flashCopied(`${icon.id}:name`);
  };

  const onCopyId = async (icon: IconEntry) => {
    await copyText(icon.id);
    flashCopied(`${icon.id}:id`);
  };

  const onCopySvg = async (icon: IconEntry) => {
    const res = await fetch(icon.path);
    if (!res.ok) throw new Error(`Failed to load ${icon.path}`);
    const svg = await res.text();
    await copyText(svg);
    flashCopied(`${icon.id}:svg`);
  };

  return (
    <div className="my-6 not-prose space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            activeCategory === 'all'
              ? 'border-fd-foreground bg-fd-foreground text-fd-background'
              : 'border-fd-border text-fd-muted-foreground hover:border-fd-foreground/40 hover:text-fd-foreground'
          }`}
        >
          全部
        </button>
        {availableCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === cat.id
                ? 'border-fd-foreground bg-fd-foreground text-fd-background'
                : 'border-fd-border text-fd-muted-foreground hover:border-fd-foreground/40 hover:text-fd-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-fd-border p-8 text-center text-sm text-fd-muted-foreground">
          没有匹配的图标，试试其他分类。
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((icon) => {
            const nameCopied = copiedKey === `${icon.id}:name`;
            const idCopied = copiedKey === `${icon.id}:id`;
            const svgCopied = copiedKey === `${icon.id}:svg`;

            return (
              <li
                key={icon.id}
                className="flex flex-col overflow-hidden rounded-xl border border-fd-border"
              >
                <div className="flex h-24 items-center justify-center bg-white">
                  <IconPreview icon={icon} />
                </div>
                <div className="flex flex-1 flex-col gap-2 border-t border-fd-border bg-fd-card p-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-normal" title={icon.name}>
                      {icon.name}
                    </p>
                    <p
                      className="truncate font-mono text-[10px] font-normal text-fd-muted-foreground"
                      title={icon.id}
                    >
                      {icon.id}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => void onCopyName(icon)}
                      className="rounded-md border border-fd-border px-2 py-1 text-[11px] text-fd-muted-foreground hover:border-fd-foreground/30 hover:text-fd-foreground"
                    >
                      {nameCopied ? '已复制' : '名称'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void onCopyId(icon)}
                      className="rounded-md border border-fd-border px-2 py-1 text-[11px] text-fd-muted-foreground hover:border-fd-foreground/30 hover:text-fd-foreground"
                    >
                      {idCopied ? '已复制' : 'ID'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void onCopySvg(icon).catch(() => flashCopied(`${icon.id}:err`))
                      }
                      className="rounded-md border border-fd-border px-2 py-1 text-[11px] text-fd-muted-foreground hover:border-fd-foreground/30 hover:text-fd-foreground"
                    >
                      {svgCopied ? '已复制' : 'SVG'}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function IconGallery({ categories, manifest: manifestProp }: IconGalleryProps) {
  const [manifest, setManifest] = useState<IconManifest | null>(manifestProp ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Prefer live public manifest so `icons:sync` shows up without a full reload race.
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
        if (manifestProp) {
          setManifest(manifestProp);
          return;
        }
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

  return <GalleryBody categories={categories} manifest={manifest} />;
}
