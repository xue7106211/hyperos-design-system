'use client';

/**
 * 悬停详情卡的内容：不替设计师下结论，而是把一个值放回它的处境里——
 * 它出现在哪儿、库里有哪些值离它最近、换到暗色主题时它会变成什么样。
 * 卡片只读，操作（标为有意保留等）留在列表里。
 */
import { createContext, useContext } from 'react';
import { parseColor, suggestionKey, type SuggestionMap, type TokenSuggestion } from '@/lib/token-check/nearest';
import type { BindingState, PropertyCategory } from '@/lib/token-check/types';
import { categoryLabels, stateLabels } from './labels';
import { ValueText } from './primitives';

export const SuggestionsContext = createContext<SuggestionMap | undefined>(undefined);

export function useSuggestions(category: PropertyCategory, value: string) {
  const map = useContext(SuggestionsContext);
  return map?.[suggestionKey(category, value)];
}

const COLOR_CATEGORIES = new Set<PropertyCategory>(['fill', 'text-color', 'stroke']);

const EXPECTED_ROLE: Partial<Record<PropertyCategory, TokenSuggestion['role']>> = {
  'text-color': 'text',
  fill: 'fill',
  stroke: 'stroke',
};

const ROLE_LABELS: Record<NonNullable<TokenSuggestion['role']>, string> = {
  text: '文字',
  fill: '填充',
  stroke: '描边',
};

/** 展示用：去掉人人都有的 miuix_sys_ / miuix_comp_ 前缀，完整名留在 title 里 */
function displayName(name: string) {
  return name.replace(/^miuix_(sys|comp)_/, '');
}

/** 两种主题下页面的底色，用来摆放对比样本 */
const PAGE = { Light: '#FFFFFF', Dark: '#000000' } as const;

function cssColor(value: string | number | undefined) {
  if (typeof value !== 'string') return undefined;
  const color = parseColor(value);
  if (!color) return undefined;
  const c = (n: number) => Math.round(n * 255);
  return `rgb(${c(color.r)} ${c(color.g)} ${c(color.b)} / ${Math.round(color.a * 1000) / 1000})`;
}

/* ---------- 它在哪儿 ---------- */

/** 图层路径：越靠近根越淡，末端是图层名；分隔符用 ›，因为 Figma 图层名本身常带 / */
export function Crumbs({ path }: { path: string[] }) {
  const parents = path.slice(0, -1);
  const leaf = path[path.length - 1] ?? '';
  return (
    <p className="tc-dc-crumbs">
      {parents.map((segment, i) => (
        <span
          key={`${segment}-${i}`}
          className="tc-dc-crumb"
          style={{ opacity: 0.4 + (0.45 * (i + 1)) / Math.max(parents.length, 1) }}
        >
          {segment}
        </span>
      ))}
      <span className="tc-dc-leaf">{leaf}</span>
    </p>
  );
}

export type CardLayer = { nodeName: string; path: string[] };

/** 同一个父级下的同名图层合成一行，避免「头部 / 时间」连着出现三次 */
function groupLayers(layers: CardLayer[]) {
  const rows: { parent?: string; name: string; count: number }[] = [];
  for (const layer of layers) {
    const parent = layer.path.at(-2);
    const hit = rows.find((r) => r.parent === parent && r.name === layer.nodeName);
    if (hit) hit.count += 1;
    else rows.push({ parent, name: layer.nodeName, count: 1 });
  }
  return rows;
}

function Where({ layers, total }: { layers: CardLayer[]; total: number }) {
  const rows = groupLayers(layers);
  const shown = rows.slice(0, 3);
  const shownCount = shown.reduce((n, r) => n + r.count, 0);
  return (
    <section className="tc-dc-section">
      <p className="tc-dc-label">出现在</p>
      <ul className="tc-dc-where">
        {shown.map((row, i) => (
          <li key={`${row.name}-${i}`}>
            {row.parent ? <span className="tc-dc-where-parent">{row.parent}</span> : null}
            <span className="tc-dc-leaf">{row.name}</span>
            {row.count > 1 ? <span className="tc-dc-times">×{row.count}</span> : null}
          </li>
        ))}
      </ul>
      {total > shownCount ? <p className="tc-dc-more">另 {total - shownCount} 处</p> : null}
    </section>
  );
}

/* ---------- 离哪些 Token 最近 ---------- */

function Near({
  category,
  suggestions,
}: {
  category: PropertyCategory;
  suggestions: TokenSuggestion[] | undefined;
}) {
  if (suggestions === undefined) return null;
  const isColor = COLOR_CATEGORIES.has(category);
  return (
    <section className="tc-dc-section">
      <p className="tc-dc-label">库里最接近的值（右侧为 Token 相对当前值）</p>
      {suggestions.length === 0 ? (
        <p className="tc-dc-none">
          库里没有接近的值。可能是库缺了这一档，也可能这里本来就是特例
        </p>
      ) : (
        <ul className="tc-dc-near">
          {suggestions.map((s) => (
            <li key={s.name}>
              {isColor ? (
                <span aria-hidden className="tc-swatch">
                  <span style={{ backgroundColor: cssColor(s.values[s.matchedMode]) }} />
                </span>
              ) : (
                <span className="tc-dc-num">{s.values[s.matchedMode]}</span>
              )}
              <span className="tc-dc-token" title={s.name}>
                {displayName(s.name)}
              </span>
              <span className="tc-dc-note">
                {s.note}
                {s.role && EXPECTED_ROLE[category] && s.role !== EXPECTED_ROLE[category] ? (
                  <span className="tc-dc-role">原用于{ROLE_LABELS[s.role]}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------- 换到暗色时 ---------- */

function Sample({ category, color }: { category: PropertyCategory; color: string | undefined }) {
  if (category === 'text-color') {
    return (
      <span className="tc-dc-sample-text" style={{ color }}>
        Aa
      </span>
    );
  }
  if (category === 'stroke') return <span className="tc-dc-sample-stroke" style={{ borderColor: color }} />;
  return <span className="tc-dc-sample-fill" style={{ backgroundColor: color }} />;
}

function Themes({
  category,
  value,
  token,
}: {
  category: PropertyCategory;
  value: string;
  token: TokenSuggestion | undefined;
}) {
  if (!COLOR_CATEGORIES.has(category) || !token) return null;
  const current = cssColor(value);
  if (!current) return null;
  return (
    <section className="tc-dc-section">
      <p className="tc-dc-label">切到暗色时</p>
      <div className="tc-dc-themes">
        {(['Light', 'Dark'] as const).map((mode) => (
          <div key={mode} className="tc-dc-page" data-mode={mode} style={{ backgroundColor: PAGE[mode] }}>
            <span className="tc-dc-pair">
              <Sample category={category} color={current} />
              <span className="tc-dc-cap">写死</span>
            </span>
            <span className="tc-dc-pair">
              <Sample category={category} color={cssColor(token.values[mode])} />
              <span className="tc-dc-cap">Token</span>
            </span>
          </div>
        ))}
      </div>
      <p className="tc-dc-more">写死的值不随主题变化，Token 会</p>
    </section>
  );
}

/* ---------- 组合 ---------- */

export function ValueCard({
  category,
  state,
  value,
  layers,
  total,
  footer,
}: {
  category: PropertyCategory;
  state: Exclude<BindingState, 'hyperos'>;
  value: string;
  /** 涉及的图层，给「按修复」条目用；按图层视图里已经在行上，不传 */
  layers?: CardLayer[];
  total?: number;
  /** 末尾一行补充：旧版变量名、收益、实例覆写等 */
  footer?: string[];
}) {
  const suggestions = useSuggestions(category, value);
  const notes = (footer ?? []).filter(Boolean);
  return (
    <div className="tc-dc">
      <p className="tc-dc-head">
        <span className="tc-dc-value">
          <ValueText value={value} />
        </span>
        <span className="tc-dc-meta">
          {categoryLabels[category]} · {stateLabels[state]}
        </span>
      </p>
      {layers?.length ? <Where layers={layers} total={total ?? layers.length} /> : null}
      <Near category={category} suggestions={suggestions} />
      <Themes category={category} value={value} token={suggestions?.[0]} />
      {notes.length ? <p className="tc-dc-foot">{notes.join(' · ')}</p> : null}
    </div>
  );
}

export function LayerCard({ path, meta }: { path: string[]; meta: (string | null | undefined)[] }) {
  const notes = meta.filter(Boolean) as string[];
  return (
    <div className="tc-dc">
      <section className="tc-dc-section">
        <p className="tc-dc-label">图层位置</p>
        <Crumbs path={path} />
      </section>
      {notes.length ? <p className="tc-dc-foot">{notes.join(' · ')}</p> : null}
    </div>
  );
}
