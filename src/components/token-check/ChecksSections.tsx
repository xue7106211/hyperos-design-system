'use client';

import { ChevronRight } from 'lucide-react';
import { useId, useState } from 'react';
import type { Exclusion, TokenCheckReport } from '@/lib/token-check/types';
import {
  checkLabel,
  exclusionHints,
  exclusionLabels,
  exclusionOrder,
  severityLabels,
  uncertainLabels,
} from './labels';
import { FigmaLink, LayerPath, NodeIdTag, nodeIdOf, Panel } from './primitives';

const PAGE_SIZE = 20;

export function AccuracySection({ report }: { report: TokenCheckReport }) {
  const { findings, checksRun } = report;
  return (
    <Panel
      id="tc-accuracy"
      title={
        <span className="flex items-center gap-2">
          准确性检查
          <span className="tc-count">{findings.length}</span>
        </span>
      }
      description={<>本次运行：{checksRun.length > 0 ? checksRun.map(checkLabel).join('、') : '无'}</>}
      flush
      footer="作用域、取值匹配和语义检查会在后续版本提供。"
    >
      {findings.length === 0 ? (
        <p className="tc-empty">没有发现问题。</p>
      ) : (
        <ul className="tc-rows">
          {findings.map((f, i) => (
            <li key={`${f.checkId}-${f.nodeId}-${f.field}-${i}`} className="tc-row">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`tc-severity tc-severity--${f.severity}`}>
                      <span aria-hidden className="tc-severity-dot" />
                      {severityLabels[f.severity]}
                    </span>
                    <span className="text-xs text-fd-muted-foreground">
                      {checkLabel(f.checkId)} · <span className="font-mono">{f.field}</span>
                    </span>
                  </div>
                  <div className="mt-2">
                    <LayerPath path={f.path} />
                  </div>
                  <p className="mt-2 text-sm text-fd-muted-foreground">{f.message}</p>
                  {f.current || f.suggestion ? (
                    <dl className="mt-2 grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
                      {f.current ? (
                        <>
                          <dt className="text-fd-muted-foreground">当前</dt>
                          <dd className="break-all font-mono text-fd-foreground">{f.current}</dd>
                        </>
                      ) : null}
                      {f.suggestion ? (
                        <>
                          <dt className="text-fd-muted-foreground">建议</dt>
                          <dd className="break-all font-mono text-fd-foreground">{f.suggestion}</dd>
                        </>
                      ) : null}
                    </dl>
                  ) : null}
                </div>
                <span className="flex shrink-0 items-center gap-2">
                  <NodeIdTag id={nodeIdOf(f.nodeId, f.figmaUrl)} />
                  <FigmaLink href={f.figmaUrl} label={f.nodeName} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function ExclusionItems({ reason, items }: { reason: Exclusion['reason']; items: Exclusion[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const remaining = items.length - visible;
  return (
    <ul className="tc-rows border-t border-[var(--tc-line)]">
      {items.slice(0, visible).map((ex) => (
        <li key={`${reason}-${ex.nodeId}`} className="tc-row tc-row--indent">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <LayerPath path={ex.path} />
              <p className="mt-1 text-xs text-fd-muted-foreground">
                {ex.detail} · <span className="tabular-nums">{ex.nodeCount}</span> 个图层
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-2">
              <NodeIdTag id={nodeIdOf(ex.nodeId, ex.figmaUrl)} />
              <FigmaLink href={ex.figmaUrl} label={ex.nodeName} />
            </span>
          </div>
        </li>
      ))}
      {remaining > 0 ? (
        <li className="px-5 py-2">
          <button
            type="button"
            className="tc-button tc-button--ghost w-full"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            再显示 {Math.min(PAGE_SIZE, remaining)} 条（剩余 {remaining} 条）
          </button>
        </li>
      ) : null}
    </ul>
  );
}

function ExclusionGroup({
  reason,
  items,
  count,
  nodeCount,
}: {
  reason: Exclusion['reason'];
  items: Exclusion[];
  count: number;
  nodeCount: number;
}) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  const head = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-fd-foreground">{exclusionLabels[reason]}</span>
        <span className="mt-0.5 block text-xs text-fd-muted-foreground">{exclusionHints[reason]}</span>
      </span>
      <span className="shrink-0 text-right text-xs tabular-nums text-fd-muted-foreground">
        {count} 处 · {nodeCount} 个图层
      </span>
    </>
  );

  if (items.length === 0) {
    return (
      <div className="tc-disclosure">
        <span aria-hidden className="size-4 shrink-0" />
        {head}
      </div>
    );
  }

  return (
    <div>
      <h3>
        <button
          type="button"
          className="tc-disclosure"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronRight aria-hidden className="tc-chevron size-4" strokeWidth={1.5} />
          {head}
        </button>
      </h3>
      <div id={contentId} hidden={!open}>
        <ExclusionItems reason={reason} items={items} />
      </div>
    </div>
  );
}

export function ExclusionSection({ report }: { report: TokenCheckReport }) {
  const { exclusionSummary, exclusions, uncertain } = report;
  const totalNodes = exclusionOrder.reduce((s, r) => s + exclusionSummary[r].nodeCount, 0);

  return (
    <Panel
      id="tc-exclusions"
      title="排除与待确认"
      description={`共排除 ${totalNodes} 个图层，不计入覆盖率。展开可抽查判定是否合理。`}
      flush
    >
      <div className="tc-rows">
        {exclusionOrder.map((reason) => (
          <ExclusionGroup
            key={reason}
            reason={reason}
            items={exclusions.filter((e) => e.reason === reason)}
            count={exclusionSummary[reason].count}
            nodeCount={exclusionSummary[reason].nodeCount}
          />
        ))}
      </div>

      <h3 className="tc-subhead">
        待确认
        <span className="tc-count">{uncertain.length}</span>
        <span className="ml-auto truncate text-xs">照常计入统计，建议人工看一眼</span>
      </h3>
      {uncertain.length === 0 ? (
        <p className="tc-empty">没有待确认的图层。</p>
      ) : (
        <ul className="tc-rows">
          {uncertain.map((u) => (
            <li key={`${u.kind}-${u.nodeId}`} className="tc-row">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="tc-tag mb-2">{uncertainLabels[u.kind]}</span>
                  <LayerPath path={u.path} />
                  <p className="mt-1 text-xs text-fd-muted-foreground">{u.detail}</p>
                </div>
                <span className="flex shrink-0 items-center gap-2">
                  <NodeIdTag id={nodeIdOf(u.nodeId, u.figmaUrl)} />
                  <FigmaLink href={u.figmaUrl} label={u.nodeName} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
