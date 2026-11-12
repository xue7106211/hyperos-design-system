'use client';

import { useState, type ReactNode } from 'react';
import { Accordion } from '@/components/arc/accordion/accordion';
import { EmptyState } from '@/components/arc/empty-state/empty-state';
import { waiverKey } from '@/lib/token-check/review-state';
import type { BindableProperty, Exclusion, TokenCheckReport } from '@/lib/token-check/types';
import {
  categoryLabels,
  checkLabel,
  exclusionHints,
  exclusionLabels,
  exclusionOrder,
  formatDateTime,
  stateLabels,
  uncertainLabels,
} from './labels';
import {
  FigmaLink,
  LayerPath,
  NodeIdTag,
  nodeIdOf,
  Section,
  SeverityBadge,
} from './primitives';

const PAGE_SIZE = 20;

export function AccuracySection({ report }: { report: TokenCheckReport }) {
  const { findings } = report;
  return (
    <Section
      id="tc-accuracy"
      title="准确性检查"
      count={findings.length}
      description="已绑定的 Token 用得对不对。业务稿应绑定 Semantic 或 Component 层，不直接用 Reference 色板"
    >
      <div className="tc-box">
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
      </div>
    </Section>
  );
}

function MoreLink({ remaining, onClick }: { remaining: number; onClick: () => void }) {
  if (remaining <= 0) return null;
  return (
    <button type="button" className="tc-fine-more" onClick={onClick}>
      再显示 {Math.min(PAGE_SIZE, remaining)} 条（剩余 {remaining} 条）
    </button>
  );
}

/** 附录里的一行：图层名 + 说明 + 位置。全部用正文小字，不用标签和卡片 */
function FineRow({
  name,
  note,
  nodeId,
  href,
  action,
}: {
  name: string;
  note: ReactNode;
  nodeId?: string;
  href: string;
  action?: ReactNode;
}) {
  return (
    <li className="tc-fine-row">
      <span className="tc-fine-row-text">
        <span className="tc-fine-name">{name}</span>
        <span>{note}</span>
      </span>
      <span className="tc-fine-row-end">
        {action}
        <NodeIdTag id={nodeId} />
        <FigmaLink href={href} label={name} />
      </span>
    </li>
  );
}

function ExclusionItems({ reason, items }: { reason: Exclusion['reason']; items: Exclusion[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  if (items.length === 0) return <p className="tc-fine-empty">没有明细</p>;
  return (
    <>
      <ul className="tc-fine-list">
        {items.slice(0, visible).map((ex) => (
          <FineRow
            key={`${reason}-${ex.nodeId}`}
            name={ex.path[ex.path.length - 1] ?? ex.nodeName}
            note={
              <>
                {ex.detail} · <span className="tabular-nums">{ex.nodeCount}</span> 个图层
              </>
            }
            nodeId={nodeIdOf(ex.nodeId, ex.figmaUrl)}
            href={ex.figmaUrl}
          />
        ))}
      </ul>
      <MoreLink remaining={items.length - visible} onClick={() => setVisible((v) => v + PAGE_SIZE)} />
    </>
  );
}

function WaivedItems({
  waived,
  onWaive,
}: {
  waived: BindableProperty[];
  onWaive: (keys: string[], waived: boolean) => void;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  return (
    <>
      <ul className="tc-fine-list">
        {waived.slice(0, visible).map((issue, i) => (
          <FineRow
            key={`${waiverKey(issue)}-${i}`}
            name={issue.nodeName}
            note={
              <>
                {categoryLabels[issue.category]} · {stateLabels[issue.state]} · {issue.value}
              </>
            }
            nodeId={nodeIdOf(issue.nodeId, issue.figmaUrl)}
            href={issue.figmaUrl}
            action={
              <button type="button" className="tc-fine-link" onClick={() => onWaive([waiverKey(issue)], false)}>
                撤销
              </button>
            }
          />
        ))}
      </ul>
      <MoreLink remaining={waived.length - visible} onClick={() => setVisible((v) => v + PAGE_SIZE)} />
    </>
  );
}

/**
 * 校对说明：像产品页底部的参考说明。小字、弱色、连续段落，只在读者想核对时才去看。
 * 明细收在小号折叠里，不再和正文区块争夺注意力。
 */
export function Appendix({
  report,
  waived,
  onWaive,
}: {
  report: TokenCheckReport;
  waived: BindableProperty[];
  onWaive: (keys: string[], waived: boolean) => void;
}) {
  const { exclusionSummary, exclusions, uncertain, checksRun } = report;
  const totalNodes = exclusionOrder.reduce((s, r) => s + exclusionSummary[r].nodeCount, 0);
  const exclusionParts = exclusionOrder
    .filter((r) => exclusionSummary[r].count > 0)
    .map((r) => `${exclusionLabels[r]} ${exclusionSummary[r].count} 处（${exclusionSummary[r].nodeCount} 个图层）`);

  return (
    <section id="tc-appendix" aria-labelledby="tc-appendix-title" className="tc-fine">
      <h2 id="tc-appendix-title" tabIndex={-1} className="tc-fine-title">
        校对说明
      </h2>

      <p>
        覆盖率 = 绑定 HyperOS Token 的属性 ÷ 可绑定属性。统计填充、文字颜色、描边、文字样式、圆角和间距 6
        类属性；阴影等效果不在 Design Token 范围内，不统计。
      </p>
      <p>
        对照 {report.library.fileName}，{formatDateTime(report.library.exportedAt)} 导出的快照。本次准确性检查运行了
        {checksRun.length > 0 ? checksRun.map(checkLabel).join('、') : '：无'}；作用域、取值匹配和语义检查会在后续版本提供。
      </p>

      <p>
        共排除 <span className="tabular-nums">{totalNodes}</span> 个图层，不计入覆盖率
        {exclusionParts.length > 0 ? `：${exclusionParts.join('、')}` : ''}。
        {exclusionOrder.map((r) => exclusionHints[r]).join('；')}。
      </p>
      {exclusions.length > 0 ? (
        <Accordion
          className="tc-fine-accordion"
          defaultOpen={-1}
          items={exclusionOrder
            .filter((r) => exclusionSummary[r].count > 0)
            .map((reason) => ({
              id: reason,
              title: `${exclusionLabels[reason]}明细`,
              meta: `${exclusionSummary[reason].count} 处`,
              content: <ExclusionItems reason={reason} items={exclusions.filter((e) => e.reason === reason)} />,
            }))}
        />
      ) : null}

      <div id="tc-waived">
        {waived.length === 0 ? (
          <p>没有标为有意保留的值。在问题清单的「按修复」视图里展开一条，可以把整组标为有意保留。</p>
        ) : (
          <>
            <p>
              <span className="tabular-nums">{waived.length}</span> 处值被标为有意保留，例如给开发看的标注。它们不计入覆盖率，导出报告时会一并列出；标记只存在这台电脑的浏览器里。
              <button type="button" className="tc-fine-link" onClick={() => onWaive(waived.map(waiverKey), false)}>
                全部撤销
              </button>
            </p>
            <Accordion
              className="tc-fine-accordion"
              defaultOpen={-1}
              items={[
                {
                  id: 'waived',
                  title: '有意保留明细',
                  meta: `${waived.length} 处`,
                  content: <WaivedItems waived={waived} onWaive={onWaive} />,
                },
              ]}
            />
          </>
        )}
      </div>

      {uncertain.length > 0 ? (
        <>
          <p>
            <span className="tabular-nums">{uncertain.length}</span> 个图层规则拿不准，照常计入统计，建议人工看一眼：
          </p>
          <ul className="tc-fine-list">
            {uncertain.map((u) => (
              <FineRow
                key={`${u.kind}-${u.nodeId}`}
                name={u.path[u.path.length - 1] ?? u.nodeName}
                note={`${uncertainLabels[u.kind]} · ${u.detail}`}
                nodeId={nodeIdOf(u.nodeId, u.figmaUrl)}
                href={u.figmaUrl}
              />
            ))}
          </ul>
        </>
      ) : null}

      <p>
        键盘：在「按修复」视图里，J / K 切换到下一条或上一条并展开，O 在 Figma 中打开当前这条的第一处，Enter 展开或收起。
      </p>
    </section>
  );
}
