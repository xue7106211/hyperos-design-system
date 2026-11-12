/**
 * 值匹配（规格里的 L3）：给一个没绑定 HyperOS Token 的取值，找出库里值最接近的几个 Token。
 * 只摆出候选，不替设计师做决定；没有足够接近的候选也是一条信息（库里可能缺这个值）。
 * 颜色按 OKLab 距离（含透明度），间距和圆角按数值差。Reference 层不作为候选，业务稿应绑 Semantic / Component。
 */
import type { BindableProperty, LibrarySnapshot, PropertyCategory, SnapshotVariable, TokenTier } from './types';

export type TokenSuggestion = {
  name: string;
  tier: TokenTier;
  /** 每个模式下的值（颜色为 #RRGGBB / #RRGGBBAA，数值为 number） */
  values: Record<string, string | number>;
  /** 和当前值最接近的模式 */
  matchedMode: string;
  /** 颜色：OKLab 距离；数值：绝对差 */
  distance: number;
  /** 写给设计师的差距说明，如「完全一致」「略深」「大 2」 */
  note: string;
  /** 颜色 Token 的用途（从名字读出），和当前属性的用途不同时界面会标出来 */
  role?: 'text' | 'fill' | 'stroke';
};

export type SuggestionMap = Record<string, TokenSuggestion[]>;

export const suggestionKey = (category: PropertyCategory, value: string) => `${category}|${value}`;

/* ---------- 解析 ---------- */

type Rgba = { r: number; g: number; b: number; a: number };

const HEX_LEAD = /^\s*#([0-9a-f]{6})([0-9a-f]{2})?\b(?:\s+(\d{1,3})%)?/i;

/** 取值开头的颜色：`#RRGGBB`、`#RRGGBB 90%`、描边的 `#RRGGBB 1px`、快照里的 `#RRGGBBAA` */
export function parseColor(value: string): Rgba | null {
  const match = value.match(HEX_LEAD);
  if (!match) return null;
  const [, rgb, aa, pct] = match;
  const n = Number.parseInt(rgb, 16);
  const a = aa ? Number.parseInt(aa, 16) / 255 : pct ? Number(pct) / 100 : 1;
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a };
}

/** 间距 / 圆角：`16`；四角不同的 `8/8/0/0` 无法对应单个 Token，返回 null */
export function parseNumber(value: string): number | null {
  const parts = value.split('/').map((p) => Number(p.trim()));
  if (!parts.length || parts.some((p) => !Number.isFinite(p))) return null;
  return parts.every((p) => p === parts[0]) ? parts[0] : null;
}

/* ---------- 色差 ---------- */

function toLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function toOklab({ r, g, b }: Rgba): [number, number, number] {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** 两种主题下的页面底色：带透明度的颜色要叠到底色上比较，看到的才是设计师眼里的颜色 */
const PAGE_BG: Record<string, Rgba> = {
  Light: { r: 1, g: 1, b: 1, a: 1 },
  Dark: { r: 0, g: 0, b: 0, a: 1 },
};

function over(color: Rgba, bg: Rgba): Rgba {
  const mix = (c: number, b: number) => c * color.a + b * (1 - color.a);
  return { r: mix(color.r, bg.r), g: mix(color.g, bg.g), b: mix(color.b, bg.b), a: 1 };
}

/**
 * 叠到该模式的页面底色上再算 OKLab 距离，所以 #8C8C8C 和「黑色 45%」在白底上算接近；
 * 透明度差另加一点权重，同样观感时优先透明度也一致的 Token。
 */
function colorDistance(x: Rgba, y: Rgba, mode: string) {
  const bg = PAGE_BG[mode] ?? PAGE_BG.Light;
  const [l1, a1, b1] = toOklab(over(x, bg));
  const [l2, a2, b2] = toOklab(over(y, bg));
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2) + Math.abs(x.a - y.a) * 0.1;
}

/** 超过这个距离就不算「接近」 */
const COLOR_LIMIT = 0.25;

function colorNote(current: Rgba, token: Rgba, distance: number) {
  if (distance < 0.001) return '完全一致';
  if (distance < 0.02) return '几乎一致';
  const [l1, a1, b1] = toOklab(over(current, PAGE_BG.Light));
  const [l2, a2, b2] = toOklab(over(token, PAGE_BG.Light));
  const lightGap = l2 - l1;
  const hueGap = Math.hypot(a2 - a1, b2 - b1);
  const far = distance > 0.1;
  if (hueGap > 0.02 && hueGap > Math.abs(lightGap)) return far ? '颜色差别明显' : '色相略有不同';
  if (Math.abs(lightGap) < 0.01 && Math.abs(token.a - current.a) >= 0.05) return '观感接近，透明度不同';
  return lightGap > 0 ? (far ? '明显更浅' : '略浅') : far ? '明显更深' : '略深';
}

function numberNote(current: number, token: number) {
  const gap = token - current;
  if (gap === 0) return '完全一致';
  return `${gap > 0 ? '大' : '小'} ${Math.round(Math.abs(gap) * 100) / 100}`;
}

/* ---------- 候选池 ---------- */

const CANDIDATE_TIERS: TokenTier[] = ['semantic', 'component'];

const NUMBER_SCOPES: Partial<Record<PropertyCategory, string[]>> = {
  spacing: ['GAP', 'ALL_SCOPES'],
  radius: ['CORNER_RADIUS', 'ALL_SCOPES'],
};

const COLOR_CATEGORIES = new Set<PropertyCategory>(['fill', 'text-color', 'stroke']);

/** Token 名里表示用途的片段：文字色、填充 / 背景、描边 */
const COLOR_ROLES: Partial<Record<PropertyCategory, RegExp>> = {
  'text-color': /_color_text_/,
  fill: /_color_(fill|bg)_/,
  stroke: /_color_(stroke|border|divider|line)_/,
};

function roleOf(name: string): TokenSuggestion['role'] {
  if (/_color_text_/.test(name)) return 'text';
  if (/_color_(fill|bg)_/.test(name)) return 'fill';
  if (/_color_(stroke|border|divider|line)_/.test(name)) return 'stroke';
  return undefined;
}

/** 只服务单个应用的 Semantic 分组（日历、时钟、录音机），通用场景排在后面 */
const APP_GROUPS = /^(calendar|clock|recorder)\//;

/** 排序时的偏好（只影响先后，不改差距说明）：用途对得上的在前，应用专属分组靠后 */
const PENALTY = { role: 0.03, app: 0.01 };

function usable(variable: SnapshotVariable) {
  return !variable.hiddenFromPublishing && CANDIDATE_TIERS.includes(variable.tier);
}

/** 短名：去掉分组路径 */
export function shortName(name: string) {
  return name.slice(name.lastIndexOf('/') + 1);
}

function modeValues(variable: SnapshotVariable) {
  return Object.fromEntries(
    Object.entries(variable.resolved).filter(([, v]) => typeof v === 'string' || typeof v === 'number'),
  ) as Record<string, string | number>;
}

/**
 * 给一个取值找候选。同一个值可能被多个 Token 共用（同色不同语义），
 * 这时都列出来，让设计师按语义选，而不是由工具挑一个。
 */
export function nearestTokens(
  category: PropertyCategory,
  value: string,
  snapshot: LibrarySnapshot,
  limit = 3,
): TokenSuggestion[] | null {
  const out: (TokenSuggestion & { fullName?: string })[] = [];
  const scores = new Map<string, number>();

  if (COLOR_CATEGORIES.has(category)) {
    const current = parseColor(value);
    if (!current) return null;
    for (const variable of snapshot.variables) {
      if (variable.type !== 'COLOR' || !usable(variable)) continue;
      // 默认业务稿按亮色绘制：只和 Light 模式比较；暗色下的样子交给界面的主题对比去看
      const raw = variable.resolved.Light;
      const color = typeof raw === 'string' ? parseColor(raw) : null;
      if (!color) continue;
      const distance = colorDistance(current, color, 'Light');
      const best = { mode: 'Light', distance, score: distance, color };
      if (best.distance > COLOR_LIMIT) continue;
      const role = COLOR_ROLES[category];
      const score =
        best.score +
        (role && !role.test(variable.name) ? PENALTY.role : 0) +
        (APP_GROUPS.test(variable.name) ? PENALTY.app : 0);
      scores.set(variable.name, score);
      out.push({
        name: shortName(variable.name),
        fullName: variable.name,
        tier: variable.tier,
        values: modeValues(variable),
        matchedMode: best.mode,
        distance: best.distance,
        note: colorNote(current, best.color, best.distance),
        role: roleOf(variable.name),
      });
    }
  } else if (NUMBER_SCOPES[category]) {
    const current = parseNumber(value);
    if (current === null) return null;
    const scopes = NUMBER_SCOPES[category]!;
    const limitGap = Math.max(4, current * 0.25);
    for (const variable of snapshot.variables) {
      if (variable.type !== 'FLOAT' || !usable(variable)) continue;
      if (!variable.scopes.some((scope) => scopes.includes(scope))) continue;
      const [mode, raw] = Object.entries(variable.resolved)[0] ?? [];
      if (typeof raw !== 'number' || !mode) continue;
      const distance = Math.abs(raw - current);
      if (distance > limitGap) continue;
      scores.set(variable.name, distance);
      out.push({
        name: shortName(variable.name),
        fullName: variable.name,
        tier: variable.tier,
        values: modeValues(variable),
        matchedMode: mode,
        distance,
        note: numberNote(current, raw),
      });
    }
  } else {
    return null;
  }

  // 排序分优先；同分时 Semantic 在前（更通用），再按名字稳定排序
  const scoreOf = (s: { fullName?: string }) => scores.get(s.fullName ?? '') ?? Infinity;
  out.sort(
    (x, y) =>
      scoreOf(x) - scoreOf(y) ||
      CANDIDATE_TIERS.indexOf(x.tier) - CANDIDATE_TIERS.indexOf(y.tier) ||
      x.name.localeCompare(y.name),
  );
  return out.slice(0, limit).map(({ fullName: _fullName, ...rest }) => rest);
}

/**
 * 为问题清单里每个不同的「类别 + 取值」算一次候选。
 * 无法比较的值（文字样式、渐变、四角不同的圆角）不写入，界面就不显示这一段；
 * 写入空数组表示比较过但没有接近的值。
 */
export function suggestForIssues(issues: BindableProperty[], snapshot: LibrarySnapshot): SuggestionMap {
  const map: SuggestionMap = {};
  for (const issue of issues) {
    const key = suggestionKey(issue.category, issue.value);
    if (key in map) continue;
    const found = nearestTokens(issue.category, issue.value, snapshot);
    if (found) map[key] = found;
  }
  return map;
}
