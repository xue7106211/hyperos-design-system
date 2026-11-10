/**
 * 「按修复」视图：把同一类别、同一状态、同一取值的问题归成一条修改。
 * 设计师绑一次 Token（或替换一次旧变量）就能修好整组，所以按影响面从大到小排。
 */
import type { BindableProperty, BindingState, PropertyCategory } from './types';

export type FixState = Exclude<BindingState, 'hyperos'>;

export type FixGroup = {
  /** 稳定 key：类别 + 状态 + 取值 + 旧版变量名 */
  key: string;
  category: PropertyCategory;
  state: FixState;
  value: string;
  /** 旧版 Kit 变量的「集合 / 变量名」，便于对照迁移 */
  tokenLabel?: string;
  issues: BindableProperty[];
  /** 涉及的图层数（同一图层多个字段只算一次） */
  nodeCount: number;
  /** 其中来自 MIUIX 实例覆写的属性数 */
  overrideCount: number;
};

const categoryRank: Record<PropertyCategory, number> = {
  fill: 0,
  'text-color': 1,
  stroke: 2,
  typography: 3,
  radius: 4,
  spacing: 5,
};

function tokenLabelOf(issue: BindableProperty) {
  if (issue.state !== 'legacy' || !issue.token) return undefined;
  return issue.token.collection ? `${issue.token.collection} / ${issue.token.name}` : issue.token.name;
}

export function groupIssuesByFix(issues: BindableProperty[]): FixGroup[] {
  const groups = new Map<string, FixGroup & { nodes: Set<string> }>();
  for (const issue of issues) {
    if (issue.state === 'hyperos') continue;
    const tokenLabel = tokenLabelOf(issue);
    const key = [issue.category, issue.state, issue.value.trim(), tokenLabel ?? ''].join('|');
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        category: issue.category,
        state: issue.state,
        value: issue.value.trim(),
        tokenLabel,
        issues: [],
        nodeCount: 0,
        overrideCount: 0,
        nodes: new Set(),
      };
      groups.set(key, group);
    }
    group.issues.push(issue);
    group.nodes.add(`${issue.targetIndex ?? ''}:${issue.nodeId}`);
    if (issue.fromInstanceOverride) group.overrideCount += 1;
  }

  return [...groups.values()]
    .map(({ nodes, ...group }) => ({ ...group, nodeCount: nodes.size }))
    .sort(
      (a, b) =>
        b.issues.length - a.issues.length ||
        b.nodeCount - a.nodeCount ||
        categoryRank[a.category] - categoryRank[b.category] ||
        a.value.localeCompare(b.value),
    );
}
