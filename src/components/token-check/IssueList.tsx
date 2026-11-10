'use client';

import { useMemo, useState } from 'react';
import { Accordion } from '@/components/arc/accordion/accordion';
import { Button } from '@/components/arc/button/button';
import { EmptyState } from '@/components/arc/empty-state/empty-state';
import SegmentedControl from '@/components/arc/segmented-control/segmented-control';
import type {
  BindableProperty,
  BindingState,
  PropertyCategory,
  TokenCheckReport,
} from '@/lib/token-check/types';
import { categoryLabels, categoryOrder } from './labels';
import {
  Count,
  FigmaLink,
  NodeIdTag,
  nodeIdOf,
  Panel,
  ParentPath,
  StateBadge,
  Tag,
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

/** 筛选：Arc 分段控件，窄屏在控件内横向滚动 */
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
  return (
    <div className="tc-filter">
      <span className="tc-filter-label" aria-hidden>
        {label}
      </span>
      <SegmentedControl
        label={`按${label}筛选`}
        value={value}
        onValueChange={(v) => onChange(v as T)}
        options={options.map((o) => ({
          value: o.value,
          label: o.label,
          accessory: <span className="tc-segment-count">{o.count}</span>,
        }))}
      />
    </div>
  );
}

function IssueProp({ issue }: { issue: BindableProperty }) {
  const note =
    issue.state === 'legacy' && issue.token
      ? `${issue.token.collection ? `${issue.token.collection} / ` : ''}${issue.token.name}`
      : null;
  return (
    <li className="tc-prop">
      <span className="tc-prop-field">
        {categoryLabels[issue.category]}
        <span className="tc-prop-key">{issue.field}</span>
      </span>
      <span className="tc-prop-value">
        <ValueText value={issue.value} />
        {note ? (
          <span className="tc-prop-note" title={note}>
            {note}
          </span>
        ) : null}
      </span>
      <span className="tc-prop-state">
        {issue.fromInstanceOverride ? <Tag>实例覆写</Tag> : null}
        <StateBadge state={issue.state} />
      </span>
    </li>
  );
}

function IssueNodeRow({ row }: { row: NodeRow }) {
  return (
    <li className="tc-node">
      <div className="tc-node-head">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="tc-layer-name">{row.nodeName}</span>
            <NodeIdTag id={row.nodeId} />
          </div>
          <ParentPath path={row.path} className="mt-0.5" />
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

function IssueGroupBody({ group }: { group: IssueGroup }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = group.rows.slice(0, visible);
  const remaining = group.rows.length - shown.length;
  return (
    <>
      <ul>
        {shown.map((row) => (
          <IssueNodeRow key={row.key} row={row} />
        ))}
      </ul>
      {remaining > 0 ? (
        <div className="tc-more">
          <Button type="button" variant="ghost" size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            再显示 {Math.min(PAGE_SIZE, remaining)} 个图层（剩余 {remaining} 个）
          </Button>
        </div>
      ) : null}
    </>
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
      <Panel id="tc-issues" title="问题清单">
        <EmptyState title="没有需要处理的属性" description="所有可绑定属性都已绑定到 HyperOS Token" />
      </Panel>
    );
  }

  const filterKey = `${category}-${state}`;
  const rowCount = groups.reduce((s, g) => s + g.rows.length, 0);

  return (
    <Panel
      id="tc-issues"
      title={
        <>
          问题清单
          <Count n={report.issues.length} />
        </>
      }
      description="旧版 Kit 变量需要迁移，非 HyperOS 库和未绑定需要重新绑定。同一图层的问题合并在一起"
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
        <EmptyState
          title="没有符合条件的问题"
          description="换一个类别或状态试试"
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setCategory('all');
                setState('all');
              }}
            >
              清除筛选
            </Button>
          }
        />
      ) : (
        <Accordion
          key={filterKey}
          className="tc-groups"
          defaultOpen={0}
          items={groups.map((group) => ({
            id: group.key,
            title: (
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate">{group.title}</span>
                <NodeIdTag id={group.nodeId} />
              </span>
            ),
            meta: `${group.rows.length} 个图层 · ${group.count} 项`,
            content: <IssueGroupBody group={group} />,
          }))}
        />
      )}
    </Panel>
  );
}
