/**
 * 可绑定属性提取与绑定判定（规格第 6 节）。
 */
import type {
  FigmaBoundValue,
  FigmaColor,
  FigmaNode,
  FigmaNodeEntry,
  FigmaPaint,
  FigmaVariableAlias,
} from './figma-api-types';
import { lookupLegacyVariable, lookupVariable, type LibraryIndex } from './library';
import type { BindableProperty, PropertyCategory } from './types';

export type PropertyContext = {
  fileKey: string;
  entry: FigmaNodeEntry;
  library: LibraryIndex;
  path: string[];
  figmaUrl: string;
  /** MIUIX 实例内部节点：只统计这些被覆写的字段；正常节点为 undefined */
  overriddenFields?: ReadonlySet<string>;
  /** 画板（模拟设备屏幕的顶层 Frame）：圆角是屏幕外形，不统计 */
  isArtboard?: boolean;
};

type Binding = Pick<BindableProperty, 'state' | 'token'>;

const TYPOGRAPHY_VARIABLE_FIELDS = [
  'fontSize',
  'fontFamily',
  'fontWeight',
  'fontStyle',
  'lineHeight',
  'letterSpacing',
  'paragraphSpacing',
  'paragraphIndent',
];
const PADDING_FIELDS = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'] as const;
const RADIUS_FIELDS = ['cornerRadius', 'topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius', 'rectangleCornerRadii'];

/** overrides.overriddenFields 中的字段 → 受影响的属性类别 */
const OVERRIDE_CATEGORIES: Record<string, PropertyCategory[]> = {
  fills: ['fill', 'text-color'],
  fillStyleId: ['fill', 'text-color'],
  strokes: ['stroke'],
  strokeStyleId: ['stroke'],
  strokeWeight: ['stroke'],
  textStyleId: ['typography'],
  fontName: ['typography'],
  ...Object.fromEntries(TYPOGRAPHY_VARIABLE_FIELDS.map((field) => [field, ['typography']])),
  ...Object.fromEntries(RADIUS_FIELDS.map((field) => [field, ['radius']])),
};

const STYLE_KEY_CATEGORIES: Record<string, PropertyCategory[]> = {
  fill: ['fill', 'text-color'],
  stroke: ['stroke'],
  text: ['typography'],
};

/* ---------- 绑定判定 ---------- */

function isAlias(value: unknown): value is FigmaVariableAlias {
  return !!value && typeof value === 'object' && typeof (value as FigmaVariableAlias).id === 'string';
}

/** 展开 boundVariables 值：单个别名、别名数组或一层嵌套对象 */
export function collectAliases(value: unknown): FigmaVariableAlias[] {
  if (!value) return [];
  if (isAlias(value)) return [value];
  if (Array.isArray(value)) return value.filter(isAlias);
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).flatMap(collectAliases);
  return [];
}

function bindingFromVariables(aliases: FigmaVariableAlias[], ctx: PropertyContext): Binding | null {
  if (!aliases.length) return null;
  for (const alias of aliases) {
    const variable = lookupVariable(ctx.library, alias.id, ctx.fileKey);
    if (variable) return { state: 'hyperos', token: { name: variable.name, tier: variable.tier, kind: 'variable' } };
  }
  for (const alias of aliases) {
    const legacy = lookupLegacyVariable(ctx.library, alias.id, ctx.fileKey);
    if (legacy) return { state: 'legacy', token: { name: legacy.name, kind: 'variable', collection: legacy.collection } };
  }
  return { state: 'other' };
}

function bindingFromStyle(styleId: string | undefined, ctx: PropertyContext): Binding | null {
  if (!styleId) return null;
  const meta = ctx.entry.styles?.[styleId];
  const style = meta ? ctx.library.styleByKey.get(meta.key) : undefined;
  if (style) return { state: 'hyperos', token: { name: style.name, kind: 'style' } };
  return { state: 'other' };
}

/** 优先级：hyperos > legacy > other；都没有为 unbound */
function resolveBinding(...candidates: (Binding | null)[]): Binding {
  const present = candidates.filter((candidate): candidate is Binding => !!candidate);
  return (
    present.find((candidate) => candidate.state === 'hyperos') ??
    present.find((candidate) => candidate.state === 'legacy') ??
    present[0] ?? { state: 'unbound' }
  );
}

function boundAt(value: FigmaBoundValue | Record<string, FigmaBoundValue> | undefined, index: number): FigmaVariableAlias[] {
  if (Array.isArray(value)) return collectAliases(value[index]);
  return [];
}

/* ---------- 值格式化 ---------- */

function round(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function hex(color: FigmaColor): string {
  const channel = (value: number) =>
    Math.round(Math.min(1, Math.max(0, value)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`.toUpperCase();
}

function formatColor(color: FigmaColor | undefined, opacity = 1): string {
  if (!color) return '—';
  const alpha = (color.a ?? 1) * opacity;
  return alpha < 0.995 ? `${hex(color)} ${Math.round(alpha * 100)}%` : hex(color);
}

const GRADIENT_LABELS: Record<string, string> = {
  GRADIENT_LINEAR: '线性渐变',
  GRADIENT_RADIAL: '径向渐变',
  GRADIENT_ANGULAR: '角度渐变',
  GRADIENT_DIAMOND: '菱形渐变',
};

export function formatPaint(paint: FigmaPaint): string {
  if (paint.type === 'SOLID') return formatColor(paint.color, paint.opacity ?? 1);
  const label = GRADIENT_LABELS[paint.type] ?? paint.type;
  const stops = (paint.gradientStops ?? []).map((stop) => formatColor(stop.color, paint.opacity ?? 1));
  return stops.length ? `${label} ${stops.join(' → ')}` : label;
}

function formatTypography(node: FigmaNode): string {
  const style = node.style ?? {};
  const family = style.fontFamily ?? '—';
  const weight = style.fontStyle ?? (style.fontWeight !== undefined ? String(style.fontWeight) : '');
  const size = style.fontSize !== undefined ? round(style.fontSize) : '—';
  const lineHeight = style.lineHeightPx !== undefined ? round(style.lineHeightPx) : 'auto';
  return `${family}${weight ? ` ${weight}` : ''} ${size}/${lineHeight}`;
}

/* ---------- 提取 ---------- */

function isPaintVisible(paint: FigmaPaint): boolean {
  return paint.visible !== false && paint.opacity !== 0;
}

function isColorPaint(paint: FigmaPaint): boolean {
  return paint.type === 'SOLID' || paint.type.startsWith('GRADIENT_');
}

function paintAliases(paint: FigmaPaint): FigmaVariableAlias[] {
  return [...collectAliases(paint.boundVariables), ...(paint.gradientStops ?? []).flatMap((stop) => collectAliases(stop.boundVariables))];
}

function strokeWeightOf(node: FigmaNode): number {
  if (typeof node.strokeWeight === 'number') return node.strokeWeight;
  const individual = node.individualStrokeWeights;
  return individual ? Math.max(individual.top, individual.right, individual.bottom, individual.left) : 0;
}

/** 被覆写字段 → 允许统计的类别与间距字段 */
function overrideScope(node: FigmaNode, fields: ReadonlySet<string>) {
  const categories = new Set<PropertyCategory>();
  const spacingFields = new Set<string>();
  for (const field of fields) {
    for (const category of OVERRIDE_CATEGORIES[field] ?? []) categories.add(category);
    if (field === 'itemSpacing' || (PADDING_FIELDS as readonly string[]).includes(field)) spacingFields.add(field);
    if (field === 'styles') {
      for (const styleKey of Object.keys(node.styles ?? {})) {
        for (const category of STYLE_KEY_CATEGORIES[styleKey] ?? []) categories.add(category);
      }
    }
    if (field === 'boundVariables') {
      for (const [key, value] of Object.entries(node.boundVariables ?? {})) {
        if (!collectAliases(value).length) continue;
        if (key === 'fills') ['fill', 'text-color'].forEach((c) => categories.add(c as PropertyCategory));
        else if (key === 'strokes') categories.add('stroke');
        else if (/Radius$/.test(key)) categories.add('radius');
        else if (key === 'itemSpacing' || (PADDING_FIELDS as readonly string[]).includes(key)) spacingFields.add(key);
        else if (TYPOGRAPHY_VARIABLE_FIELDS.includes(key)) categories.add('typography');
      }
    }
  }
  return { categories, spacingFields };
}

export function extractProperties(node: FigmaNode, ctx: PropertyContext): BindableProperty[] {
  const scope = ctx.overriddenFields ? overrideScope(node, ctx.overriddenFields) : null;
  const allows = (category: PropertyCategory) => !scope || scope.categories.has(category);
  const allowsSpacing = (field: string) => !scope || scope.spacingFields.has(field);

  const props: BindableProperty[] = [];
  const bound = node.boundVariables ?? {};
  const styles = node.styles ?? {};
  const push = (category: PropertyCategory, field: string, value: string, binding: Binding) => {
    const prop: BindableProperty = {
      nodeId: node.id,
      nodeName: node.name,
      path: ctx.path,
      category,
      field,
      state: binding.state,
      value,
      figmaUrl: ctx.figmaUrl,
    };
    if (binding.token) prop.token = binding.token;
    if (scope) prop.fromInstanceOverride = true;
    props.push(prop);
  };

  // 区块本身的背景属于画布组织，不是界面内容
  const isSection = node.type === 'SECTION';
  const isText = node.type === 'TEXT';

  // fill / text-color
  const fillCategory: PropertyCategory = isText ? 'text-color' : 'fill';
  if (!isSection && allows(fillCategory)) {
    (node.fills ?? []).forEach((paint, index) => {
      if (!isPaintVisible(paint) || !isColorPaint(paint)) return;
      const binding = resolveBinding(
        bindingFromStyle(styles.fill, ctx),
        bindingFromVariables([...boundAt(bound.fills, index), ...paintAliases(paint)], ctx),
      );
      push(fillCategory, `fills[${index}]`, formatPaint(paint), binding);
    });
  }

  // stroke
  if (!isSection && allows('stroke') && strokeWeightOf(node) > 0) {
    (node.strokes ?? []).forEach((paint, index) => {
      if (!isPaintVisible(paint) || !isColorPaint(paint)) return;
      const binding = resolveBinding(
        bindingFromStyle(styles.stroke, ctx),
        bindingFromVariables([...boundAt(bound.strokes, index), ...paintAliases(paint)], ctx),
      );
      push('stroke', `strokes[${index}]`, `${formatPaint(paint)} ${round(strokeWeightOf(node))}px`, binding);
    });
  }

  // typography
  if (isText && allows('typography')) {
    const aliases = TYPOGRAPHY_VARIABLE_FIELDS.flatMap((field) => collectAliases(bound[field]));
    const binding = resolveBinding(bindingFromStyle(styles.text, ctx), bindingFromVariables(aliases, ctx));
    push('typography', 'text', formatTypography(node), binding);
  }

  // radius：画板圆角模拟的是设备屏幕外形，不属于界面内容
  if (!isText && !ctx.isArtboard && allows('radius')) {
    const corners = node.rectangleCornerRadii;
    const hasCorners = !!corners?.some((value) => value > 0);
    if ((node.cornerRadius ?? 0) > 0 || hasCorners) {
      const mixed = !!corners && hasCorners && corners.some((value) => value !== corners[0]);
      const aliases = Object.entries(bound)
        .filter(([key]) => /Radius$/.test(key) || key === 'rectangleCornerRadii')
        .flatMap(([, value]) => collectAliases(value));
      push(
        'radius',
        mixed ? 'rectangleCornerRadii' : 'cornerRadius',
        mixed ? corners!.map(round).join('/') : round(node.cornerRadius ?? corners![0]),
        resolveBinding(bindingFromVariables(aliases, ctx)),
      );
    }
  }

  // spacing
  if (node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL') {
    const flowChildren = (node.children ?? []).filter(
      (child) => child.visible !== false && child.layoutPositioning !== 'ABSOLUTE',
    );
    const spacingFields: string[] = [];
    if (flowChildren.length >= 2 && node.primaryAxisAlignItems !== 'SPACE_BETWEEN' && (node.itemSpacing ?? 0) !== 0) {
      spacingFields.push('itemSpacing');
    }
    for (const field of PADDING_FIELDS) if ((node[field] ?? 0) !== 0) spacingFields.push(field);
    for (const field of spacingFields) {
      if (!allowsSpacing(field)) continue;
      const value = node[field as 'itemSpacing'] ?? 0;
      push('spacing', field, round(value), resolveBinding(bindingFromVariables(collectAliases(bound[field]), ctx)));
    }
  }

  // 效果（阴影 / 模糊）不属于 Design Token 范围，不统计

  return props;
}
