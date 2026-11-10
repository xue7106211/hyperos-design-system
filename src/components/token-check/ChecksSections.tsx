'use client';

import { useState } from 'react';
import { Accordion } from '@/components/arc/accordion/accordion';
import { Button } from '@/components/arc/button/button';
import { EmptyState } from '@/components/arc/empty-state/empty-state';
import type { Exclusion, TokenCheckReport } from '@/lib/token-check/types';
import { checkLabel, exclusionHints, exclusionLabels, exclusionOrder, uncertainLabels } from './labels';
import { Count, FigmaLink, LayerPath, NodeIdTag, nodeIdOf, Panel, SeverityBadge, Tag } from './primitives';

const PAGE_SIZE = 20;

export function AccuracySection({ report }: { report: TokenCheckReport }) {
  const { findings, checksRun } = report;
  return (
    <Panel
      id="tc-accuracy"
      title={
        <>
          准确性检查
          <Count n={findings.length} />
        </>
      }
      description={<>本次运行：{checksRun.length > 0 ? checksRun.map(checkLabel).join('、') : '无'}</>}
      flush
      footer="作用域、取值匹配和语义检查会在后续版本提供"
    >
      {findings.length === 0 ? (
        <EmptyState title="没有发现问题" description="已绑定的 Token 都用在了合适的层级" />
      ) : (
        <ul className="tc-rows">
          {findings.map((f, i) => (
            <li key={`${f.checkId}-${f.nodeId}-${f.field}-${i}`} className="tc-row">
              <div className="tc-node-head">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={f.severity} />
                    <span className="tc-meta">
                      {checkLabel(f.checkId)} · {f.field}
                    </span>
                  </div>
                  <div className="mt-2">
                    <LayerPath path={f.path} />
                  </div>
                  <p className="tc-row-text">{f.message}</p>
                  {f.current || f.suggestion ? (
                    <dl className="tc-kv">
                      {f.current ? (
                        <>
                          <dt>当前</dt>
                          <dd>{f.current}</dd>
                        </>
                      ) : null}
                      {f.suggestion ? (
                        <>
                          <dt>建议</dt>
                          <dd>{f.suggestion}</dd>
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
  if (items.length === 0) return <p className="tc-row-text">没有明细</p>;
  return (
    <>
      <ul className="tc-rows">
        {items.slice(0, visible).map((ex) => (
          <li key={`${reason}-${ex.nodeId}`} className="tc-row tc-row--inset">
            <div className="tc-node-head">
              <div className="min-w-0 flex-1">
                <LayerPath path={ex.path} />
                <p className="tc-meta mt-1">
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
      </ul>
      {remaining > 0 ? (
        <div className="tc-more">
          <Button type="button" variant="ghost" size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            再显示 {Math.min(PAGE_SIZE, remaining)} 条（剩余 {remaining} 条）
          </Button>
        </div>
      ) : null}
    </>
  );
}

export function ExclusionSection({ report }: { report: TokenCheckReport }) {
  const { exclusionSummary, exclusions, uncertain } = report;
  const totalNodes = exclusionOrder.reduce((s, r) => s + exclusionSummary[r].nodeCount, 0);

  return (
    <Panel
      id="tc-exclusions"
      title="排除与待确认"
      description={`共排除 ${totalNodes} 个图层，不计入覆盖率。展开可抽查判定是否合理`}
      flush
    >
      <Accordion
        className="tc-exclusion-groups"
        defaultOpen={-1}
        items={exclusionOrder.map((reason) => ({
          id: reason,
          title: (
            <span className="block min-w-0">
              <span className="block">{exclusionLabels[reason]}</span>
              <span className="tc-meta mt-0.5 block font-normal">{exclusionHints[reason]}</span>
            </span>
          ),
          meta: `${exclusionSummary[reason].count} 处 · ${exclusionSummary[reason].nodeCount} 个图层`,
          content: <ExclusionItems reason={reason} items={exclusions.filter((e) => e.reason === reason)} />,
        }))}
      />

      <h3 className="tc-subhead">
        待确认
        <Count n={uncertain.length} />
        <span className="ml-auto truncate">照常计入统计，建议人工看一眼</span>
      </h3>
      {uncertain.length === 0 ? (
        <p className="tc-row tc-row-text">没有待确认的图层</p>
      ) : (
        <ul className="tc-rows">
          {uncertain.map((u) => (
            <li key={`${u.kind}-${u.nodeId}`} className="tc-row">
              <div className="tc-node-head">
                <div className="min-w-0 flex-1">
                  <div className="mb-2">
                    <Tag>{uncertainLabels[u.kind]}</Tag>
                  </div>
                  <LayerPath path={u.path} />
                  <p className="tc-meta mt-1">{u.detail}</p>
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
