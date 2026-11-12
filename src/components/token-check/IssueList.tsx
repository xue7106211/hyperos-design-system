'use client';

import { BookmarkCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Accordion } from '@/components/arc/accordion/accordion';
import { Button } from '@/components/arc/button/button';
import { EmptyState } from '@/components/arc/empty-state/empty-state';
import SegmentedControl from '@/components/arc/segmented-control/segmented-control';
import { groupIssuesByFix, type FixGroup } from '@/lib/token-check/fix-groups';
import { fixGain, waiverKey } from '@/lib/token-check/review-state';
import type {
  BindableProperty,
  BindingState,
  PropertyCategory,
  TokenCheckReport,
} from '@/lib/token-check/types';
import { categoryLabels, categoryOrder, formatGain, stateLabels } from './labels';
import { LayerCard, SuggestionsContext, ValueCard } from './DetailCards';
import {
  DetailTip,
  FigmaLink,
  NodeIdTag,
  nodeIdOf,
  Section,
  StateMark,
  ValueText,
} from './primitives';

const PAGE_SIZE = 20;

type View = 'fix' | 'layer';
type CategoryFilter = PropertyCategory | 'all';
type StateFilter = Exclude<BindingState, 'hyperos'> | 'all';

/** 由「结论 · 先改这几处」发起：切到按修复视图、清空筛选、展开并滚到该条 */
export type FixFocusRequest = { key: string; seq: number };

/** 由结论区的比例条 / 数量发起：只看某一档 */
export type StateFilterRequest = { state: Exclude<BindingState, 'hyperos'>; seq: number };

type WaiveHandler = (keys: string[], waived: boolean) => void;

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

function focusFixTrigger(index: number, block: ScrollLogicalPosition, smooth: boolean) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const trigger = document.getElementById(`tc-fix-${index}`)?.closest('button');
  trigger?.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto', block });
  trigger?.focus({ preventScroll: true });
}

function tokenLabelOf(issue: BindableProperty) {
  return issue.state === 'legacy' && issue.token
    ? `${issue.token.collection ? `${issue.token.collection} / ` : ''}${issue.token.name}`
    : null;
}

function layerMeta(issue: { nodeId?: string; figmaUrl: string }, extra: (string | null)[] = []) {
  return [nodeIdOf(issue.nodeId, issue.figmaUrl), ...extra];
}

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
  const rank = (c: PropertyCategory) => categoryOrder.indexOf(c);
  return [...rows.values()].map((row) => ({
    ...row,
    issues: [...row.issues].sort((a, b) => rank(a.category) - rank(b.category)),
  }));
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

function FixTitle({ fix, index, total }: { fix: FixGroup; index: number; total: number }) {
  return (
    <DetailTip
      clickToOpen={false}
      row="h3"
      content={
        <ValueCard
          category={fix.category}
          state={fix.state}
          value={fix.value}
          layers={fix.issues}
          total={fix.issues.length}
          footer={[
            fix.tokenLabel ?? '',
            `${fix.issues.length} 处 · ${fix.nodeCount} 个图层`,
            `改完覆盖率 ${formatGain(fixGain(fix.issues.length, total))}`,
          ]}
        />
      }
    >
      <span id={`tc-fix-${index}`} className="tc-fix-title">
        <span className="tc-fix-value">
          <ValueText value={fix.value} />
        </span>
        <span className="tc-fix-cat">{categoryLabels[fix.category]}</span>
      </span>
    </DetailTip>
  );
}

function FixLayers({ fix, onWaive }: { fix: FixGroup; onWaive: WaiveHandler }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = fix.issues.slice(0, visible);
  return (
    <>
      <ul className="tc-fix-layers">
        {shown.map((issue, i) => (
          <li key={`${issue.nodeId}-${issue.field}-${i}`} className="tc-fix-layer">
            <DetailTip
              row=".tc-fix-layer"
              content={
                <LayerCard
                  path={issue.path}
                  meta={layerMeta(issue, [issue.field, issue.fromInstanceOverride ? '实例覆写' : null])}
                />
              }
            >
              <span className="tc-layer-name" tabIndex={0}>
                {issue.nodeName}
              </span>
            </DetailTip>
            <FigmaLink href={issue.figmaUrl} label={issue.nodeName} />
          </li>
        ))}
      </ul>
      <MoreButton
        remaining={fix.issues.length - shown.length}
        unit="处"
        onClick={() => setVisible((v) => v + PAGE_SIZE)}
      />
      <div className="tc-fix-actions">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onWaive(fix.issues.map(waiverKey), true)}
        >
          <BookmarkCheck aria-hidden className="size-4" strokeWidth={1.5} />
          标为有意保留
        </Button>
      </div>
    </>
  );
}

function FixView({
  fixes,
  total,
  open,
  instant,
  onOpenChange,
  visible,
  onMore,
  onWaive,
}: {
  fixes: FixGroup[];
  /** 覆盖率分母，用来换算每条修改的收益 */
  total: number;
  open: number;
  /** 键盘或跳转定位触发的展开不播放动画 */
  instant: boolean;
  onOpenChange: (index: number) => void;
  visible: number;
  onMore: () => void;
  onWaive: WaiveHandler;
}) {
  const shown = fixes.slice(0, visible);
  return (
    <>
      <Accordion
        className="tc-fixes"
        value={open}
        instant={instant}
        onValueChange={onOpenChange}
        items={shown.map((fix, index) => ({
          id: fix.key,
          title: <FixTitle fix={fix} index={index} total={total} />,
          meta: (
            <span className="tc-fix-meta">
              <StateMark state={fix.state} />
              <span className="tc-fix-count">
                <b>{fix.issues.length}</b> 处
              </span>
            </span>
          ),
          content: <FixLayers fix={fix} onWaive={onWaive} />,
        }))}
      />
      <MoreButton remaining={fixes.length - shown.length} unit="条" onClick={onMore} />
    </>
  );
}

/* ---------- 按图层 ---------- */

function IssueProp({ issue }: { issue: BindableProperty }) {
  return (
    <li className="tc-prop">
      <span className="tc-prop-field">{categoryLabels[issue.category]}</span>
      <DetailTip
        row=".tc-prop"
        content={
          issue.state === 'hyperos' ? (
            <LayerCard path={issue.path} meta={[issue.field]} />
          ) : (
            <ValueCard
              category={issue.category}
              state={issue.state}
              value={issue.value}
              footer={[tokenLabelOf(issue) ?? '', issue.field, issue.fromInstanceOverride ? '实例覆写' : '']}
            />
          )
        }
      >
        <span className="tc-prop-value" tabIndex={0}>
          <ValueText value={issue.value} />
        </span>
      </DetailTip>
      <span className="tc-prop-state">
        <StateMark state={issue.state} />
      </span>
    </li>
  );
}

function IssueNodeRow({ row }: { row: NodeRow }) {
  return (
    <li className="tc-node">
      <div className="tc-node-head">
        <DetailTip row=".tc-node-head" content={<LayerCard path={row.path} meta={layerMeta(row)} />}>
          <span className="tc-layer-name" tabIndex={0}>
            {row.nodeName}
          </span>
        </DetailTip>
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
  filterRequest,
  onWaive,
  waivedCount,
}: {
  report: TokenCheckReport;
  /** 全量（未筛选）的修复分组，与「结论」共用同一份 */
  fixes: FixGroup[];
  focusRequest?: FixFocusRequest;
  filterRequest?: StateFilterRequest;
  onWaive: WaiveHandler;
  /** 已标为有意保留的处数，用于空状态文案 */
  waivedCount: number;
}) {
  const [view, setView] = useState<View>('fix');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [state, setState] = useState<StateFilter>('all');
  const [openFix, setOpenFixState] = useState(0);
  // 只有鼠标点开的那一下播放展开动画；键盘逐条浏览、跳转定位、筛选重置都直接到位，
  // 否则上一条收起、下一条展开的高度变化会和滚动定位同时进行，滚动会落空
  const [instantOpen, setInstantOpen] = useState(false);
  const setOpenFix = (index: number, instant = true) => {
    setInstantOpen(instant);
    setOpenFixState(index);
  };
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

  // 结论区「先改这几处」：定位到对应的修改。只处理新的请求；
  // fixes 会因标记有意保留而变化，不能让旧请求再触发一次定位
  const handledFocus = useRef(0);
  useEffect(() => {
    if (!focusRequest || focusRequest.seq === handledFocus.current) return;
    handledFocus.current = focusRequest.seq;
    const index = fixes.findIndex((f) => f.key === focusRequest.key);
    if (index < 0) return;
    setView('fix');
    setCategory('all');
    setState('all');
    setVisibleFixes((v) => Math.max(v, index + 1));
    setOpenFix(index);
    requestAnimationFrame(() => focusFixTrigger(index, 'start', true));
  }, [focusRequest, fixes]);

  // 结论区的比例条 / 数量：切到这一档，滚到清单开头
  useEffect(() => {
    if (!filterRequest) return;
    setState(filterRequest.state);
    setCategory('all');
    setOpenFix(0);
    setVisibleFixes(PAGE_SIZE);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      const section = document.getElementById('tc-issues');
      section?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      section?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
    });
  }, [filterRequest]);

  // 键盘逐条处理（按修复视图）：J / K 上下一条并展开，O 在 Figma 中打开当前这条的第一处
  const keyState = useRef({ view, openFix, shownFixes, visibleFixes });
  keyState.current = { view, openFix, shownFixes, visibleFixes };
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      const { view, openFix, shownFixes, visibleFixes } = keyState.current;
      if (view !== 'fix' || shownFixes.length === 0) return;
      const key = e.key.toLowerCase();
      if (key === 'j' || key === 'k') {
        e.preventDefault();
        const next =
          key === 'j'
            ? Math.min(openFix < 0 ? 0 : openFix + 1, shownFixes.length - 1)
            : Math.max(openFix < 0 ? 0 : openFix - 1, 0);
        if (next >= visibleFixes) setVisibleFixes(next + 1);
        setOpenFix(next);
        requestAnimationFrame(() => focusFixTrigger(next, 'nearest', false));
      } else if (key === 'o' && openFix >= 0) {
        const url = shownFixes[openFix]?.issues[0]?.figmaUrl;
        if (!url) return;
        e.preventDefault();
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
          <EmptyState
            title="没有需要处理的属性"
            description={
              waivedCount > 0
                ? `其余属性都已绑定到 HyperOS Token，另有 ${waivedCount} 处标为有意保留`
                : '所有可绑定属性都已绑定到 HyperOS Token'
            }
          />
        </div>
      </Section>
    );
  }

  const filterKey = `${category}-${state}`;
  const layerCount = groups.reduce((s, g) => s + g.rows.length, 0);

  return (
    <SuggestionsContext.Provider value={report.suggestions}>
    <Section
      id="tc-issues"
      title="问题清单"
      count={report.issues.length}
      description={
        view === 'fix'
          ? '相同的值归成一条，按类别聚合，类别内按影响处数排序'
          : '按检查目标和图层列出'
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
            total={report.coverage.overall.total}
            onWaive={(keys, waived) => {
              // 被标记的组会移出列表；收起展开项，避免下一组顶上来被自动展开
              setOpenFix(-1);
              onWaive(keys, waived);
            }}
            open={openFix}
            instant={instantOpen}
            onOpenChange={(index) => setOpenFix(index, false)}
            visible={visibleFixes}
            onMore={() => setVisibleFixes((v) => v + PAGE_SIZE)}
          />
        ) : (
          <LayerView groups={groups} filterKey={filterKey} />
        )}
      </div>
    </Section>
    </SuggestionsContext.Provider>
  );
}
