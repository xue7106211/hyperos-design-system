/**
 * 排除与存疑规则（规格第 5 节）。按顺序判定，命中即排除整棵子树。
 */
import type { FigmaNode, FigmaNodeEntry } from './figma-api-types';
import type { ExclusionReason, Uncertain } from './types';

// 英文词要求两侧不是字母，避免误伤 Spectrum、Notes 之类的业务图层名
export const ANNOTATION_NAME = /标注|说明|注释|备注|交互|(?<![a-z])(?:annotations?|redlines?|specs?|notes?)(?![a-z])/i;
/** `pic(?!ker)`：避免把 Picker 类组件误判为图片 */
export const ILLUSTRATION_NAME = /icon|illus|插图|插画|图标|logo|svg|img|image|pic(?!ker)/i;

const ANNOTATION_TYPES = new Set(['STICKY', 'CONNECTOR', 'SHAPE_WITH_TEXT', 'WIDGET', 'EMBED', 'LINK_UNFURL']);
export const VECTOR_TYPES = new Set([
  'VECTOR',
  'BOOLEAN_OPERATION',
  'STAR',
  'LINE',
  'ELLIPSE',
  'REGULAR_POLYGON',
  'POLYGON',
  'RECTANGLE',
]);
const CONTAINER_TYPES = new Set(['GROUP', 'FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'SECTION']);

/** 路径类矢量：真正的插图 / 图标笔画。RECTANGLE、ELLIPSE、LINE 常用来拼 UI（进度条、分割线），不算 */
const PATH_VECTOR_TYPES = new Set(['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'REGULAR_POLYGON', 'POLYGON']);

export type SubtreeStats = {
  vectors: number;
  /** 其中的路径类矢量 */
  pathVectors: number;
  texts: number;
  others: number;
  /** 子树（含自身）中的自动布局容器数；有自动布局说明是界面结构 */
  autoLayouts: number;
};
export type StatsCache = WeakMap<FigmaNode, SubtreeStats>;

export function isVisible(node: FigmaNode): boolean {
  return node.visible !== false;
}

/** 子树节点总数（含自身，含隐藏节点） */
export function countNodes(node: FigmaNode): number {
  let count = 1;
  for (const child of node.children ?? []) count += countNodes(child);
  return count;
}

/** 统计可见子树中的矢量、文字与其他叶子节点（容器本身不计） */
export function subtreeStats(node: FigmaNode, cache: StatsCache): SubtreeStats {
  const cached = cache.get(node);
  if (cached) return cached;
  const stats: SubtreeStats = { vectors: 0, pathVectors: 0, texts: 0, others: 0, autoLayouts: 0 };
  if (isVisible(node)) {
    if (node.layoutMode && node.layoutMode !== 'NONE') stats.autoLayouts += 1;
    if (VECTOR_TYPES.has(node.type)) {
      stats.vectors += 1;
      if (PATH_VECTOR_TYPES.has(node.type)) stats.pathVectors += 1;
    } else if (node.type === 'TEXT') stats.texts += 1;
    else if (!CONTAINER_TYPES.has(node.type) && !node.children?.length) stats.others += 1;
    for (const child of node.children ?? []) {
      const sub = subtreeStats(child, cache);
      stats.vectors += sub.vectors;
      stats.pathVectors += sub.pathVectors;
      stats.autoLayouts += sub.autoLayouts;
      stats.texts += sub.texts;
      stats.others += sub.others;
    }
  }
  cache.set(node, stats);
  return stats;
}

export type ClassifyContext = {
  parent: FigmaNode | null;
  /** 检查根节点：设计师明确选中，不做隐藏 / 标注 / 插图排除 */
  isRoot: boolean;
  entry: FigmaNodeEntry;
  kitKeys: ReadonlySet<string>;
  kitNames: ReadonlySet<string>;
  statsCache: StatsCache;
  /** 祖先已被标为 possible-illustration 时不再重复提示 */
  insidePossibleIllustration: boolean;
};

export type Classification =
  | { kind: 'excluded'; reason: ExclusionReason; detail: string }
  | { kind: 'included'; uncertain?: { kind: Uncertain['kind']; detail: string } };

/** MIUIX 实例：主组件或其组件集的 key 属于 UI Kit。返回判定依据，否则 null */
export function miuixInstanceDetail(
  node: FigmaNode,
  entry: FigmaNodeEntry,
  kitKeys: ReadonlySet<string>,
): string | null {
  if (node.type !== 'INSTANCE' || !node.componentId) return null;
  const component = entry.components?.[node.componentId];
  if (!component) return null;
  const set = component.componentSetId ? entry.componentSets?.[component.componentSetId] : undefined;
  if (kitKeys.has(component.key) || (set && kitKeys.has(set.key))) {
    const label = set ? `${set.name} / ${component.name}` : component.name;
    return `MIUIX 组件实例：${label}`;
  }
  return null;
}

export function classifyNode(node: FigmaNode, ctx: ClassifyContext): Classification {
  if (!ctx.isRoot) {
    if (!isVisible(node)) return { kind: 'excluded', reason: 'hidden', detail: '图层已隐藏' };

    if (ANNOTATION_TYPES.has(node.type)) {
      return { kind: 'excluded', reason: 'annotation', detail: `${node.type} 类型的标注元素` };
    }
    const annotationMatch = node.name.match(ANNOTATION_NAME);
    if (annotationMatch) {
      return { kind: 'excluded', reason: 'annotation', detail: `名称含「${annotationMatch[0]}」` };
    }
    if (node.type === 'TEXT' && ctx.parent?.type === 'SECTION') {
      return { kind: 'excluded', reason: 'annotation', detail: 'Section 下的游离文字说明' };
    }
  }

  const miuix = miuixInstanceDetail(node, ctx.entry, ctx.kitKeys);
  if (miuix) return { kind: 'excluded', reason: 'miuix-instance', detail: miuix };

  if (!ctx.isRoot) {
    const stats = subtreeStats(node, ctx.statsCache);
    // 纯矢量子树：路径类矢量要占一半以上，且没有自动布局，避免把形状拼出的控件当成插图
    if (
      stats.texts === 0 &&
      stats.others === 0 &&
      stats.vectors >= 2 &&
      stats.pathVectors * 2 >= stats.vectors &&
      stats.autoLayouts === 0
    ) {
      return { kind: 'excluded', reason: 'illustration', detail: `由 ${stats.vectors} 个矢量图层组成，不含文字` };
    }
    if (node.fills?.some((paint) => paint.type === 'IMAGE' && paint.visible !== false)) {
      return { kind: 'excluded', reason: 'illustration', detail: '含图片填充' };
    }
    if (node.exportSettings?.length) {
      return { kind: 'excluded', reason: 'illustration', detail: '设置了导出' };
    }
    const nameMatch = node.name.match(ILLUSTRATION_NAME);
    if (nameMatch) {
      return { kind: 'excluded', reason: 'illustration', detail: `名称含「${nameMatch[0]}」` };
    }
  }

  if (!ctx.isRoot && !ctx.insidePossibleIllustration && node.children?.length) {
    const stats = subtreeStats(node, ctx.statsCache);
    const leaves = stats.vectors + stats.texts + stats.others;
    if (stats.texts > 0 && stats.vectors >= 2 && stats.vectors / leaves >= 0.7) {
      const percent = Math.round((stats.vectors / leaves) * 100);
      return {
        kind: 'included',
        uncertain: {
          kind: 'possible-illustration',
          detail: `矢量图层占 ${percent}%（${stats.vectors}/${leaves}），但含 ${stats.texts} 个文字图层`,
        },
      };
    }
  }

  if (node.type === 'FRAME' && ctx.kitNames.has(node.name)) {
    return {
      kind: 'included',
      uncertain: { kind: 'possible-detached-component', detail: `名称与 MIUIX 组件「${node.name}」相同，可能是分离后的组件` },
    };
  }

  return { kind: 'included' };
}
