/**
 * 报告的「复核状态」：设计师标为有意保留的属性，以及与上一次检查的对比。
 * 都是纯函数；持久化（localStorage）在 UI 层做，这里只负责口径。
 */
import type { BindableProperty, BindingState, CoverageStat, TokenCheckReport } from './types';

/* ---------- 有意保留 ---------- */

function fileKeyOf(url: string) {
  return url.match(/figma\.com\/(?:design|file)\/(?:[^/]+\/branch\/)?([0-9a-zA-Z]+)/)?.[1] ?? '';
}

/** 一处属性的稳定标识：文件 + 节点 + 类别 + 字段。同一图层换了值仍视为同一处 */
export function waiverKey(issue: Pick<BindableProperty, 'figmaUrl' | 'nodeId' | 'category' | 'field'>) {
  return [fileKeyOf(issue.figmaUrl), issue.nodeId, issue.category, issue.field].join('|');
}

function withRate(stat: CoverageStat): CoverageStat {
  return { ...stat, rate: stat.total > 0 ? stat.hyperos / stat.total : null };
}

function minus(stat: CoverageStat, state: BindingState): CoverageStat {
  return withRate({ ...stat, total: stat.total - 1, [state]: stat[state] - 1 });
}

/**
 * 把有意保留的属性移出问题清单和覆盖率分母（不计入已覆盖，也不计入未覆盖）。
 * 被保留的属性原样返回在 waived 里，报告附录会公开列出，避免被用来刷高覆盖率。
 */
export function applyWaivers(
  report: TokenCheckReport,
  waivers: ReadonlySet<string>,
): { report: TokenCheckReport; waived: BindableProperty[] } {
  if (waivers.size === 0) return { report, waived: [] };

  const issues: BindableProperty[] = [];
  const waived: BindableProperty[] = [];
  for (const issue of report.issues) {
    if (issue.state !== 'hyperos' && waivers.has(waiverKey(issue))) waived.push(issue);
    else issues.push(issue);
  }
  if (waived.length === 0) return { report, waived };

  let overall = report.coverage.overall;
  const byCategory = { ...report.coverage.byCategory };
  const targets = report.targets.map((t) => ({ ...t, coverage: t.coverage }));
  for (const issue of waived) {
    overall = minus(overall, issue.state);
    byCategory[issue.category] = minus(byCategory[issue.category], issue.state);
    const target = issue.targetIndex !== undefined ? targets[issue.targetIndex] : undefined;
    if (target) target.coverage = minus(target.coverage, issue.state);
  }

  return {
    report: { ...report, issues, targets, coverage: { ...report.coverage, overall, byCategory } },
    waived,
  };
}

/** 修好 count 处后覆盖率上升多少个百分点（相对当前分母） */
export function fixGain(count: number, total: number) {
  return total > 0 ? (count / total) * 100 : 0;
}

/* ---------- 与上一次检查对比 ---------- */

export type RunSnapshot = {
  generatedAt: string;
  total: number;
  hyperos: number;
  /** 还没绑定 HyperOS Token 的属性数（未扣除有意保留，口径与引擎一致） */
  pending: number;
  rate: number | null;
};

export type RunHistory = { latest: RunSnapshot; previous?: RunSnapshot };

/** 同一组检查目标（与顺序、链接里的其他参数无关）共用一份历史 */
export function historyKey(report: TokenCheckReport) {
  return report.targets
    .map((t) => `${t.target.fileKey}:${t.target.nodeId}`)
    .sort()
    .join(',');
}

export function snapshotOf(report: TokenCheckReport): RunSnapshot {
  const { overall } = report.coverage;
  return {
    generatedAt: report.generatedAt,
    total: overall.total,
    hyperos: overall.hyperos,
    pending: overall.total - overall.hyperos,
    rate: overall.rate,
  };
}

/**
 * 记录一次检查。同一份报告重复打开（刷新、返回报告）不会把自己当成「上一次」。
 */
export function recordRun(history: RunHistory | undefined, current: RunSnapshot): RunHistory {
  if (!history) return { latest: current };
  if (history.latest.generatedAt === current.generatedAt) return history;
  return { latest: current, previous: history.latest };
}

export type RunDiff = {
  previousAt: string;
  /** 待改的处数变化，负数表示减少 */
  pendingDelta: number;
  /** 覆盖率变化，单位为百分点；任一次没有可绑定属性时为 null */
  rateDelta: number | null;
};

export function diffRuns(history: RunHistory | undefined, current: RunSnapshot): RunDiff | null {
  const previous =
    history?.latest.generatedAt === current.generatedAt ? history.previous : history?.latest;
  if (!previous) return null;
  return {
    previousAt: previous.generatedAt,
    pendingDelta: current.pending - previous.pending,
    rateDelta:
      previous.rate !== null && current.rate !== null ? (current.rate - previous.rate) * 100 : null,
  };
}
