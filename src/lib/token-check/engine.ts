/**
 * Token 绑定检查引擎：纯函数，不做网络请求。
 * 输入为已获取的 Figma /nodes 响应、MIUIX 组件 key 与 Token 库快照，输出 TokenCheckReport。
 */
import { ACCURACY_CHECKS, type AccuracyCheck } from './checks/index';
import { classifyNode, countNodes, isVisible, type StatsCache } from './classify';
import { TokenCheckError } from './errors';
import type { FigmaNode, FigmaNodeEntry, FigmaNodesResponse } from './figma-api-types';
import { buildFigmaUrl } from './figma-url';
import { createLibraryIndex, type LibraryIndex } from './library';
import { suggestForIssues } from './nearest';
import { createNodeIndex } from './node-index';
import { extractProperties } from './properties';
import type {
  BindableProperty,
  CheckTarget,
  CoverageStat,
  Exclusion,
  ExclusionReason,
  Finding,
  LegacySnapshot,
  LibrarySnapshot,
  PropertyCategory,
  TargetSummary,
  TokenCheckReport,
  TokenTier,
  Uncertain,
} from './types';

export const MAX_NODES = 30_000;

export const PROPERTY_CATEGORIES: PropertyCategory[] = ['fill', 'text-color', 'stroke', 'typography', 'radius', 'spacing'];
export const EXCLUSION_REASONS: ExclusionReason[] = ['miuix-instance', 'illustration', 'annotation', 'hidden'];
const TOKEN_TIERS: TokenTier[] = ['reference', 'semantic', 'component'];
const REJECTED_TYPES = new Set(['CANVAS', 'DOCUMENT']);
const SUPPORTED_TYPES = new Set(['SECTION', 'FRAME', 'COMPONENT', 'COMPONENT_SET', 'GROUP', 'INSTANCE']);

export type RunTokenCheckInput = {
  targets: CheckTarget[];
  /** fileKey → GET /v1/files/:key/nodes 响应 */
  nodesResponses: Record<string, FigmaNodesResponse>;
  /** MIUIX UI Kit 已发布组件与组件集的 key */
  kitComponentKeys: Iterable<string>;
  /** MIUIX 组件名，用于提示可能分离的组件 */
  kitComponentNames?: Iterable<string>;
  snapshot: LibrarySnapshot;
  /** 旧版 Kit 变量清单；缺省时旧变量归入 other */
  legacySnapshot?: LegacySnapshot;
  checks?: AccuracyCheck[];
  maxNodes?: number;
  /** 调用方已知的提示（如组件库读取失败） */
  warnings?: string[];
  now?: Date;
};

type TargetResult = {
  props: BindableProperty[];
  exclusions: Exclusion[];
  uncertain: Uncertain[];
};

export function coverageOf(props: BindableProperty[]): CoverageStat {
  const stat: CoverageStat = { total: props.length, hyperos: 0, legacy: 0, other: 0, unbound: 0, rate: null };
  for (const prop of props) stat[prop.state] += 1;
  stat.rate = stat.total ? stat.hyperos / stat.total : null;
  return stat;
}

function dedupe<T>(items: T[], keyOf: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyOf(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** 收集 MIUIX 实例（含嵌套实例）声明的覆写：节点 id → 被覆写字段 */
function collectOverrides(node: FigmaNode, into = new Map<string, Set<string>>()): Map<string, Set<string>> {
  if (node.type === 'INSTANCE') {
    for (const override of node.overrides ?? []) {
      const fields = into.get(override.id) ?? new Set<string>();
      override.overriddenFields.forEach((field) => fields.add(field));
      into.set(override.id, fields);
    }
  }
  for (const child of node.children ?? []) collectOverrides(child, into);
  return into;
}

/**
 * 画板：Section 里的顶层 Frame，或父级未知的根 Frame（直接选中画板）。
 * 它们的圆角模拟设备屏幕外形（如 58px），不需要绑定圆角 Token。
 * `parentType` 为 null 表示父级未知。
 */
export function isArtboard(node: FigmaNode, parentType: string | null): boolean {
  return node.type === 'FRAME' && (parentType === null || parentType === 'SECTION');
}

/** 所有目标子树内的 `fileKey|nodeId` → 父节点类型；用于确定被其他目标包含的根节点的真实父级 */
function collectParentTypes(entries: { fileKey: string; root: FigmaNode }[]): Map<string, string> {
  const map = new Map<string, string>();
  const visit = (fileKey: string, node: FigmaNode) => {
    for (const child of node.children ?? []) {
      map.set(`${fileKey}|${child.id}`, node.type);
      visit(fileKey, child);
    }
  };
  for (const { fileKey, root } of entries) visit(fileKey, root);
  return map;
}

function analyzeTarget(
  target: CheckTarget,
  entry: FigmaNodeEntry,
  library: LibraryIndex,
  kitKeys: ReadonlySet<string>,
  kitNames: ReadonlySet<string>,
  /** 根节点的父级类型：根节点同时出现在其他目标里时可知，否则为 null */
  rootParentType: string | null,
): TargetResult {
  const result: TargetResult = { props: [], exclusions: [], uncertain: [] };
  const statsCache: StatsCache = new WeakMap();
  const urlOf = (id: string) => buildFigmaUrl(target.fileKey, id);
  const propertyContext = (
    node: FigmaNode,
    path: string[],
    overriddenFields?: ReadonlySet<string>,
    isArtboard?: boolean,
  ) => ({
    fileKey: target.fileKey,
    entry,
    library,
    path,
    figmaUrl: urlOf(node.id),
    overriddenFields,
    isArtboard,
  });

  const walkOverrides = (node: FigmaNode, path: string[], overrides: Map<string, Set<string>>) => {
    if (!isVisible(node)) return;
    const fields = overrides.get(node.id);
    if (fields?.size) result.props.push(...extractProperties(node, propertyContext(node, path, fields)));
    for (const child of node.children ?? []) walkOverrides(child, [...path, child.name], overrides);
  };

  const walk = (node: FigmaNode, parent: FigmaNode | null, path: string[], insidePossibleIllustration: boolean) => {
    const classification = classifyNode(node, {
      parent,
      isRoot: parent === null,
      entry,
      kitKeys,
      kitNames,
      statsCache,
      insidePossibleIllustration,
    });

    if (classification.kind === 'excluded') {
      result.exclusions.push({
        nodeId: node.id,
        nodeName: node.name,
        path,
        reason: classification.reason,
        detail: classification.detail,
        nodeCount: countNodes(node),
        figmaUrl: urlOf(node.id),
      });
      if (classification.reason === 'miuix-instance') walkOverrides(node, path, collectOverrides(node));
      return;
    }

    let flagged = insidePossibleIllustration;
    if (classification.uncertain) {
      result.uncertain.push({
        nodeId: node.id,
        nodeName: node.name,
        path,
        kind: classification.uncertain.kind,
        detail: classification.uncertain.detail,
        figmaUrl: urlOf(node.id),
      });
      if (classification.uncertain.kind === 'possible-illustration') flagged = true;
    }

    result.props.push(...extractProperties(node, propertyContext(node, path, undefined, isArtboard(node, parent ? parent.type : rootParentType))));
    for (const child of node.children ?? []) walk(child, node, [...path, child.name], flagged);
  };

  walk(entry.document, null, [entry.document.name], false);
  return result;
}

export async function runTokenCheck(input: RunTokenCheckInput): Promise<TokenCheckReport> {
  const { targets, nodesResponses, snapshot } = input;
  const maxNodes = input.maxNodes ?? MAX_NODES;
  const checks = input.checks ?? ACCURACY_CHECKS;
  const library = createLibraryIndex(snapshot, input.legacySnapshot);
  const kitKeys = new Set(input.kitComponentKeys);
  const kitNames = new Set(input.kitComponentNames ?? []);
  const warnings = [...(input.warnings ?? [])];

  // 1. 校验节点与规模
  const entries: FigmaNodeEntry[] = [];
  let nodeTotal = 0;
  for (const target of targets) {
    const entry = nodesResponses[target.fileKey]?.nodes?.[target.nodeId];
    if (!entry?.document) throw new TokenCheckError('figma-not-found', undefined, target.url);
    const { type, name } = entry.document;
    if (REJECTED_TYPES.has(type)) throw new TokenCheckError('unsupported-node-type', undefined, target.url);
    if (!SUPPORTED_TYPES.has(type)) {
      warnings.push(`「${name}」是 ${type} 图层，建议选中所在的 Section 或 Frame 检查。`);
    }
    nodeTotal += countNodes(entry.document);
    if (nodeTotal > maxNodes) {
      throw new TokenCheckError(
        'too-large',
        `选中的范围包含超过 ${maxNodes.toLocaleString('en-US')} 个图层。请缩小到单个 Section 或几个 Frame 后再检查。`,
        target.url,
      );
    }
    entries.push(entry);
  }
  if (kitKeys.size === 0) warnings.push('未读取到 MIUIX 组件列表，组件实例未被排除，覆盖率可能偏低。');

  // 2. 逐个目标分析并运行准确性检查
  const summaries: TargetSummary[] = [];
  const allProps: { fileKey: string; prop: BindableProperty }[] = [];
  const allExclusions: { fileKey: string; item: Exclusion }[] = [];
  const allUncertain: { fileKey: string; item: Uncertain }[] = [];
  const allFindings: { fileKey: string; item: Finding }[] = [];

  // 重叠目标：内层目标的根节点按它在外层目标里的真实父级判定画板，保证两处口径一致
  const parentTypes = collectParentTypes(targets.map((t, i) => ({ fileKey: t.fileKey, root: entries[i].document })));

  for (const [i, target] of targets.entries()) {
    const entry = entries[i];
    const rootParentType = parentTypes.get(`${target.fileKey}|${entry.document.id}`) ?? null;
    const result = analyzeTarget(target, entry, library, kitKeys, kitNames, rootParentType);
    summaries.push({
      target,
      nodeName: entry.document.name,
      nodeType: entry.document.type,
      coverage: coverageOf(result.props),
    });
    const ctx = { target, library, nodes: createNodeIndex(entry.document) };
    for (const check of checks) {
      for (const finding of await check.run(result.props, ctx)) {
        allFindings.push({ fileKey: target.fileKey, item: { ...finding, targetIndex: i } });
      }
    }
    result.props.forEach((prop) => allProps.push({ fileKey: target.fileKey, prop: { ...prop, targetIndex: i } }));
    result.exclusions.forEach((item) => allExclusions.push({ fileKey: target.fileKey, item }));
    result.uncertain.forEach((item) => allUncertain.push({ fileKey: target.fileKey, item }));
  }

  // 3. 多个目标重叠时去重后汇总
  const props = dedupe(allProps, ({ fileKey, prop }) => `${fileKey}|${prop.nodeId}|${prop.category}|${prop.field}`).map(
    ({ prop }) => prop,
  );
  const exclusions = dedupe(allExclusions, ({ fileKey, item }) => `${fileKey}|${item.nodeId}`).map(({ item }) => item);
  const uncertain = dedupe(allUncertain, ({ fileKey, item }) => `${fileKey}|${item.nodeId}|${item.kind}`).map(
    ({ item }) => item,
  );
  const findings = dedupe(allFindings, ({ fileKey, item }) => `${fileKey}|${item.checkId}|${item.nodeId}|${item.field}`).map(
    ({ item }) => item,
  );

  const byCategory = Object.fromEntries(
    PROPERTY_CATEGORIES.map((category) => [category, coverageOf(props.filter((prop) => prop.category === category))]),
  ) as Record<PropertyCategory, CoverageStat>;
  const byTier = Object.fromEntries(TOKEN_TIERS.map((tier) => [tier, 0])) as Record<TokenTier, number>;
  for (const prop of props) if (prop.state === 'hyperos' && prop.token?.tier) byTier[prop.token.tier] += 1;

  const exclusionSummary = Object.fromEntries(
    EXCLUSION_REASONS.map((reason) => [reason, { count: 0, nodeCount: 0 }]),
  ) as TokenCheckReport['exclusionSummary'];
  for (const exclusion of exclusions) {
    exclusionSummary[exclusion.reason].count += 1;
    exclusionSummary[exclusion.reason].nodeCount += exclusion.nodeCount;
  }

  const issues = props.filter((prop) => prop.state !== 'hyperos');

  return {
    generatedAt: (input.now ?? new Date()).toISOString(),
    library: { fileName: snapshot.source.fileName, exportedAt: snapshot.source.exportedAt },
    targets: summaries,
    coverage: { overall: coverageOf(props), byCategory, byTier },
    issues,
    exclusions,
    exclusionSummary,
    uncertain,
    findings,
    checksRun: checks.map((check) => check.id),
    warnings,
    suggestions: suggestForIssues(issues, snapshot),
  };
}
