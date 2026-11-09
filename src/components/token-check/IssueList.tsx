'use client';

import { ChevronRight } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import type {
  BindableProperty,
  BindingState,
  PropertyCategory,
  TokenCheckReport,
} from '@/lib/token-check/types';
import { categoryLabels, categoryOrder } from './labels';
import {
  FigmaLink,
  MonoPath,
  NodeIdTag,
  nodeIdOf,
  Panel,
  StateBadge,
  ValueText,
} from './primitives';

const PAGE_SIZE = 20;

type CategoryFilter = PropertyCategory | 'all';
type StateFilter = Exclude<BindingState, 'hyperos'> | 'all';

/** 同一检查目标内、同一图层的问题合并成一行 */
type NodeRow = {
  key: string;
  nodeId?: string;
  nodeName: string;
  path: string[];
  figmaUrl: string;
  issues: BindableProperty[];
};

type IssueGroup = { key: string; title: string; nodeId?: string; rows: NodeRow[]; count: number };

function fileKeyOf(url: string) {
  return url.match(/figma\.com\/(?:design|file)\/(?:[^/]+\/branch\/)?([0-9a-zA-Z]+)/)?.[1];
}

function toRows(issues: BindableProperty[]): NodeRow[] {
  const rows = new Map<string, NodeRow>();
  for (const issue of issues) {
    const id = nodeIdOf(issue.nodeId, issue.figmaUrl);
    const key = id ?? `${issue.path.join('/')}`;
    const row = rows.get(key);
    if (row) row.issues.push(issue);
    else
      rows.set(key, {
        key,
        nodeId: id,
        nodeName: issue.nodeName,
        path: issue.path,
        figmaUrl: issue.figmaUrl,
        issues: [issue],
      });
  }
  return [...rows.values()];
}

/**
 * 优先用引擎填充的 targetIndex 分组；缺失时按 figmaUrl 的 fileKey 匹配，
 * 同一文件有多个目标时再用路径首段（检查根节点名）区分。
 */
function groupByTarget(report: TokenCheckReport, issues: BindableProperty[]): IssueGroup[] {
  const buckets: { key: string; title: string; nodeId?: string; issues: BindableProperty[] }[] =
    report.targets.map((t, i) => ({
      key: `${t.target.url}-${i}`,
      title: t.nodeName,
      nodeId: t.target.nodeId,
      issues: [],
    }));
  const rest: BindableProperty[] = [];

  for (const issue of issues) {
    if (issue.targetIndex !== undefined && buckets[issue.targetIndex]) {
      buckets[issue.targetIndex].issues.push(issue);
      continue;
    }
    const key = fileKeyOf(issue.figmaUrl);
    const candidates = report.targets
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => !key || t.target.fileKey === key);
    const hit =
      candidates.length === 1
        ? candidates[0]
        : candidates.find(({ t }) => t.nodeName === issue.path[0]);
    if (hit) buckets[hit.i].issues.push(issue);
    else rest.push(issue);
  }

  if (rest.length > 0) buckets.push({ key: 'rest', title: '其他', issues: rest });
  return buckets
    .filter((b) => b.issues.length > 0)
    .map((b) => ({ key: b.key, title: b.title, nodeId: b.nodeId, rows: toRows(b.issues), count: b.issues.length }));
}

type SegmentOption<T extends string> = { value: T; label: string; count: number };

/** 宽屏为分段控件，窄屏收成 select；两者共用同一份状态 */
function FilterControl<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
}) {
  const selectId = useId();
  return (
    <>
      <div className="hidden min-w-0 items-center gap-3 sm:flex">
        <span className="shrink-0 text-xs text-fd-muted-foreground" aria-hidden>
          {label}
        </span>
        <div role="group" aria-label={`按${label}筛选`} className="tc-segmented">
          {options.map((o) => {
            const active = value === o.value;
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(o.value)}
                disabled={o.count === 0 && !active}
                className="tc-segment"
              >
                {o.label}
                <span className="tc-segment-count">{o.count}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:hidden">
        <label htmlFor={selectId} className="text-xs text-fd-muted-foreground">
          {label}
        </label>
        <select
          id={selectId}
          className="tc-select"
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.count === 0 && o.value !== value}>
              {o.label}（{o.count}）
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

function IssueProp({ issue }: { issue: BindableProperty }) {
  const note =
    issue.state === 'legacy' && issue.token
      ? `${issue.token.collection ? `${issue.token.collection} / ` : ''}${issue.token.name}`
      : null;
  return (
    <li className="tc-prop tc-prop-grid">
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="shrink-0 text-fd-foreground">{categoryLabels[issue.category]}</span>
        <span aria-hidden className="text-fd-muted-foreground">·</span>
        <span className="truncate font-mono text-fd-muted-foreground">{issue.field}</span>
      </span>
      <span className="min-w-0">
        <ValueText value={issue.value} />
      </span>
      <span className="flex justify-end md:justify-start">
        <StateBadge state={issue.state} />
      </span>
      <span className="flex min-w-0 flex-wrap items-center gap-2 text-fd-muted-foreground">
        {issue.fromInstanceOverride ? <span className="tc-tag">实例覆写</span> : null}
        {note ? (
          <span className="min-w-0 truncate font-mono" title={note}>
            {note}
          </span>
        ) : null}
        {!note && !issue.fromInstanceOverride ? (
          <span aria-hidden className="hidden md:inline">
            —
          </span>
        ) : null}
      </span>
    </li>
  );
}

function IssueNodeRow({ row }: { row: NodeRow }) {
  return (
    <li className="tc-node">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium text-fd-foreground">{row.nodeName}</span>
            <NodeIdTag id={row.nodeId} />
            <span className="shrink-0 text-xs tabular-nums text-fd-muted-foreground">
              {row.issues.length} 项
            </span>
          </div>
          <MonoPath path={row.path} className="mt-0.5" />
        </div>
        <FigmaLink href={row.figmaUrl} label={row.nodeName} />
      </div>
      <ul className="tc-props" aria-label={`${row.nodeName} 的问题字段`}>
        {row.issues.map((issue, i) => (
          <IssueProp key={`${issue.field}-${issue.category}-${i}`} issue={issue} />
        ))}
      </ul>
    </li>
  );
}

function IssueGroupBlock({ group, defaultOpen }: { group: IssueGroup; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const contentId = useId();
  const shown = group.rows.slice(0, visible);
  const remaining = group.rows.length - shown.length;

  return (
    <div className="tc-group">
      <h3 className="tc-group-sticky">
        <button
          type="button"
          className="tc-group-head"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronRight aria-hidden className="tc-chevron size-4" strokeWidth={1.5} />
          <span className="min-w-0 truncate text-sm font-medium text-fd-foreground">
            {group.title}
          </span>
          <NodeIdTag id={group.nodeId} />
          <span className="ml-auto shrink-0 text-xs tabular-nums text-fd-muted-foreground">
            {group.rows.length} 个图层 · {group.count} 项
          </span>
        </button>
      </h3>
      <div id={contentId} hidden={!open}>
        <div className="tc-prop-head tc-prop-grid" aria-hidden>
          <span>类别 · 字段</span>
          <span>当前值</span>
          <span>状态</span>
          <span>备注</span>
        </div>
        <ul>
          {shown.map((row) => (
            <IssueNodeRow key={row.key} row={row} />
          ))}
        </ul>
        {remaining > 0 ? (
          <div className="border-t border-[var(--tc-line)] px-5 py-2">
            <button
              type="button"
              className="tc-button tc-button--ghost w-full"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
            >
              再显示 {Math.min(PAGE_SIZE, remaining)} 个图层（剩余 {remaining} 个）
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function IssueList({ report }: { report: TokenCheckReport }) {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [state, setState] = useState<StateFilter>('all');

  const byState = useMemo(
    () => report.issues.filter((i) => state === 'all' || i.state === state),
    [report.issues, state],
  );
  const filtered = useMemo(
    () => byState.filter((i) => category === 'all' || i.category === category),
    [byState, category],
  );
  const groups = useMemo(() => groupByTarget(report, filtered), [report, filtered]);
  const allRows = useMemo(
    () => groupByTarget(report, report.issues).reduce((s, g) => s + g.rows.length, 0),
    [report],
  );
  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(categoryOrder.map((c) => [c, 0])) as Record<
      PropertyCategory,
      number
    >;
    for (const i of byState) counts[i.category] += 1;
    return counts;
  }, [byState]);
  const stateCounts = useMemo(() => {
    const scoped = report.issues.filter((i) => category === 'all' || i.category === category);
    return {
      all: scoped.length,
      unbound: scoped.filter((i) => i.state === 'unbound').length,
      legacy: scoped.filter((i) => i.state === 'legacy').length,
      other: scoped.filter((i) => i.state === 'other').length,
    };
  }, [report.issues, category]);

  if (report.issues.length === 0) {
    return (
      <Panel id="tc-issues" title="问题清单" flush>
        <p className="tc-empty">所有可绑定属性都已绑定到 HyperOS Token。</p>
      </Panel>
    );
  }

  const filterKey = `${category}-${state}`;
  const rowCount = groups.reduce((s, g) => s + g.rows.length, 0);

  return (
    <Panel
      id="tc-issues"
      title={
        <span className="flex items-center gap-2">
          问题清单
          <span className="tc-count">{report.issues.length}</span>
        </span>
      }
      description="旧版 Kit 变量需要迁移，非 HyperOS 库和未绑定需要重新绑定。按检查目标分组，同一图层的问题合并在一行。"
      actions={
        <span className="text-xs tabular-nums text-fd-muted-foreground">
          {allRows} 个图层 · {report.issues.length} 项
        </span>
      }
      flush
    >
      <div className="tc-toolbar">
        <FilterControl<CategoryFilter>
          label="类别"
          value={category}
          onChange={setCategory}
          options={[
            { value: 'all', label: '全部', count: byState.length },
            ...categoryOrder.map((c) => ({
              value: c,
              label: categoryLabels[c],
              count: categoryCounts[c],
            })),
          ]}
        />
        <FilterControl<StateFilter>
          label="状态"
          value={state}
          onChange={setState}
          options={[
            { value: 'all', label: '全部', count: stateCounts.all },
            { value: 'unbound', label: '未绑定', count: stateCounts.unbound },
            { value: 'legacy', label: '旧版 Kit 变量', count: stateCounts.legacy },
            { value: 'other', label: '非 HyperOS 库', count: stateCounts.other },
          ]}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        筛选结果 {filtered.length} 项，涉及 {rowCount} 个图层
      </p>

      {groups.length === 0 ? (
        <div className="tc-empty">
          <p>当前筛选条件下没有问题。</p>
          <button
            type="button"
            className="tc-button tc-button--secondary tc-button--sm mt-3"
            onClick={() => {
              setCategory('all');
              setState('all');
            }}
          >
            清除筛选
          </button>
        </div>
      ) : (
        <div>
          {groups.map((group, index) => (
            <IssueGroupBlock
              key={`${filterKey}-${group.key}`}
              group={group}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}
