'use client';

import { useEffect, useMemo, useState } from 'react';
import { Accordion } from '@/components/arc/accordion/accordion';
import { Button } from '@/components/arc/button/button';
import { EmptyState } from '@/components/arc/empty-state/empty-state';
import SegmentedControl from '@/components/arc/segmented-control/segmented-control';
import { groupIssuesByFix, type FixGroup } from '@/lib/token-check/fix-groups';
import type {
  BindableProperty,
  BindingState,
  PropertyCategory,
  TokenCheckReport,
} from '@/lib/token-check/types';
import { categoryLabels, categoryOrder, fixActionLabels } from './labels';
import {
  FigmaLink,
  NodeIdTag,
  nodeIdOf,
  ParentPath,
  Section,
  StateBadge,
  Tag,
  ValueText,
} from './primitives';

const PAGE_SIZE = 20;

type View = 'fix' | 'layer';
type CategoryFilter = PropertyCategory | 'all';
type StateFilter = Exclude<BindingState, 'hyperos'> | 'all';

/** 由「结论 · 先改这几处」发起：切到按修复视图、清空筛选、展开并滚到该条 */
export type FixFocusRequest = { key: string; seq: number };

/* ---------- 按图层：同一检查目标内、同一图层的问题合并成一行 ---------- */

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

/* ---------- 控件 ---------- */

type SegmentOption<T extends string> = { value: T; label: string; count?: number };

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
          accessory: o.count !== undefined ? <span className="tc-segment-count">{o.count}</span> : undefined,
        }))}
      />
    </div>
  );
}

function MoreButton({ remaining, unit, onClick }: { remaining: number; unit: string; onClick: () => void }) {
  if (remaining <= 0) return null;
  return (
    <div className="tc-more">
      <Button type="button" variant="ghost" size="sm" onClick={onClick}>
        再显示 {Math.min(PAGE_SIZE, remaining)} {unit}（剩余 {remaining} {unit}）
      </Button>
    </div>
  );
}

/* ---------- 按修复 ---------- */

function FixTitle({ fix, index }: { fix: FixGroup; index: number }) {
  return (
    <span id={`tc-fix-${index}`} className="tc-fix-title">
      <span className="tc-fix-value">
        <ValueText value={fix.value} />
      </span>
      <span className="tc-fix-sub">
        <span>{categoryLabels[fix.category]}</span>
        <span aria-hidden>·</span>
        <span>{fixActionLabels[fix.state]}</span>
        {fix.tokenLabel ? (
          <span className="tc-fix-token" title={fix.tokenLabel}>
            {fix.tokenLabel}
          </span>
        ) : null}
      </span>
    </span>
  );
}

function FixLayers({ fix }: { fix: FixGroup }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = fix.issues.slice(0, visible);
  return (
    <>
      <ul className="tc-fix-layers">
        {shown.map((issue, i) => (
          <li key={`${issue.nodeId}-${issue.field}-${i}`} className="tc-fix-layer">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="tc-layer-name">{issue.nodeName}</span>
                <NodeIdTag id={nodeIdOf(issue.nodeId, issue.figmaUrl)} />
                <span className="tc-prop-key">{issue.field}</span>
                {issue.fromInstanceOverride ? <Tag>实例覆写</Tag> : null}
              </div>
              <ParentPath path={issue.path} className="mt-0.5" />
            </div>
            <FigmaLink href={issue.figmaUrl} label={issue.nodeName} />
          </li>
        ))}
      </ul>
      <MoreButton
        remaining={fix.issues.length - shown.length}
        unit="处"
        onClick={() => setVisible((v) => v + PAGE_SIZE)}
      />
    </>
  );
}

function FixView({
  fixes,
  open,
  onOpenChange,
  visible,
  onMore,
}: {
  fixes: FixGroup[];
  open: number;
  onOpenChange: (index: number) => void;
  visible: number;
  onMore: () => void;
}) {
  const shown = fixes.slice(0, visible);
  return (
    <>
      <Accordion
        className="tc-fixes"
        value={open}
        onValueChange={onOpenChange}
        items={shown.map((fix, index) => ({
          id: fix.key,
          title: <FixTitle fix={fix} index={index} />,
          meta: (
            <span className="tc-fix-meta">
              <StateBadge state={fix.state} />
              <span className="tc-fix-count">
                <b>{fix.issues.length}</b> 处 · {fix.nodeCount} 个图层
              </span>
            </span>
          ),
          content: <FixLayers fix={fix} />,
        }))}
      />
      <MoreButton remaining={fixes.length - shown.length} unit="条" onClick={onMore} />
    </>
  );
}

/* ---------- 按图层 ---------- */

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
  return (
    <>
      <ul>
        {shown.map((row) => (
          <IssueNodeRow key={row.key} row={row} />
        ))}
      </ul>
      <MoreButton
        remaining={group.rows.length - shown.length}
        unit="个图层"
        onClick={() => setVisible((v) => v + PAGE_SIZE)}
      />
    </>
  );
}

function LayerView({ groups, filterKey }: { groups: IssueGroup[]; filterKey: string }) {
  return (
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
  );
}

/* ---------- 问题清单 ---------- */

export function IssueList({
  report,
  fixes,
  focusRequest,
}: {
  report: TokenCheckReport;
  /** 全量（未筛选）的修复分组，与「结论」共用同一份 */
  fixes: FixGroup[];
  focusRequest?: FixFocusRequest;
}) {
  const [view, setView] = useState<View>('fix');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [state, setState] = useState<StateFilter>('all');
  const [openFix, setOpenFix] = useState(0);
  const [visibleFixes, setVisibleFixes] = useState(PAGE_SIZE);

  const byState = useMemo(
    () => report.issues.filter((i) => state === 'all' || i.state === state),
    [report.issues, state],
  );
  const filtered = useMemo(
    () => byState.filter((i) => category === 'all' || i.category === category),
    [byState, category],
  );
  const filtering = category !== 'all' || state !== 'all';
  const shownFixes = useMemo(
    () => (filtering ? groupIssuesByFix(filtered) : fixes),
    [filtering, filtered, fixes],
  );
  const groups = useMemo(() => groupByTarget(report, filtered), [report, filtered]);
  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(categoryOrder.map((c) => [c, 0])) as Record<PropertyCategory, number>;
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

  // 结论区「先改这几处」：定位到对应的修改
  useEffect(() => {
    if (!focusRequest) return;
    const index = fixes.findIndex((f) => f.key === focusRequest.key);
    if (index < 0) return;
    setView('fix');
    setCategory('all');
    setState('all');
    setVisibleFixes((v) => Math.max(v, index + 1));
    setOpenFix(index);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      const title = document.getElementById(`tc-fix-${index}`);
      const trigger = title?.closest('button');
      trigger?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      trigger?.focus({ preventScroll: true });
    });
  }, [focusRequest, fixes]);

  function changeFilter<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v);
      setOpenFix(0);
      setVisibleFixes(PAGE_SIZE);
    };
  }

  if (report.issues.length === 0) {
    return (
      <Section id="tc-issues" title="问题清单">
        <div className="tc-box">
          <EmptyState title="没有需要处理的属性" description="所有可绑定属性都已绑定到 HyperOS Token" />
        </div>
      </Section>
    );
  }

  const filterKey = `${category}-${state}`;
  const layerCount = groups.reduce((s, g) => s + g.rows.length, 0);

  return (
    <Section
      id="tc-issues"
      title="问题清单"
      count={report.issues.length}
      description={
        view === 'fix'
          ? '相同的值归成一条，从影响面最大的开始改。绑一次 Token，整组都会修好'
          : '按检查目标和图层列出，同一图层的问题合并在一起'
      }
      actions={
        <SegmentedControl
          label="问题清单的视图"
          value={view}
          onValueChange={(v) => setView(v as View)}
          options={[
            { value: 'fix', label: '按修复' },
            { value: 'layer', label: '按图层' },
          ]}
        />
      }
    >
      <div className="tc-box">
        <div className="tc-toolbar">
          <FilterControl<CategoryFilter>
            label="类别"
            value={category}
            onChange={changeFilter(setCategory)}
            options={[
              { value: 'all', label: '全部', count: byState.length },
              ...categoryOrder.map((c) => ({ value: c, label: categoryLabels[c], count: categoryCounts[c] })),
            ]}
          />
          <FilterControl<StateFilter>
            label="状态"
            value={state}
            onChange={changeFilter(setState)}
            options={[
              { value: 'all', label: '全部', count: stateCounts.all },
              { value: 'unbound', label: '未绑定', count: stateCounts.unbound },
              { value: 'legacy', label: '旧版 Kit 变量', count: stateCounts.legacy },
              { value: 'other', label: '非 HyperOS 库', count: stateCounts.other },
            ]}
          />
        </div>

        <p className="sr-only" aria-live="polite">
          {view === 'fix'
            ? `筛选结果 ${filtered.length} 项，合并为 ${shownFixes.length} 处修改`
            : `筛选结果 ${filtered.length} 项，涉及 ${layerCount} 个图层`}
        </p>

        {filtered.length === 0 ? (
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
        ) : view === 'fix' ? (
          <FixView
            fixes={shownFixes}
            open={openFix}
            onOpenChange={setOpenFix}
            visible={visibleFixes}
            onMore={() => setVisibleFixes((v) => v + PAGE_SIZE)}
          />
        ) : (
          <LayerView groups={groups} filterKey={filterKey} />
        )}
      </div>
    </Section>
  );
}
