'use client';

import { useState } from 'react';
import { Accordion } from '@/components/arc/accordion/accordion';
import { Button } from '@/components/arc/button/button';
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
  Count,
  FigmaLink,
  LayerPath,
  NodeIdTag,
  nodeIdOf,
  Section,
  SeverityBadge,
  Tag,
  ValueText,
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

/** 有意保留：公开列出，任何人都能看到哪些值被跳过，并可撤销 */
function WaivedList({
  waived,
  onWaive,
}: {
  waived: BindableProperty[];
  onWaive: (keys: string[], waived: boolean) => void;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const remaining = waived.length - visible;
  return (
    <>
      <div className="tc-waived-head">
        <p className="tc-section-desc">
          设计师标记为故意不绑定 Token 的值，例如给开发看的标注。它们不计入覆盖率，导出报告时会一并列出。标记只存在这台电脑的浏览器里
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={() => onWaive(waived.map(waiverKey), false)}>
          全部撤销
        </Button>
      </div>
      <ul className="tc-rows tc-rows--appendix">
        {waived.slice(0, visible).map((issue, i) => (
          <li key={`${waiverKey(issue)}-${i}`} className="tc-row">
            <div className="tc-node-head">
              <div className="min-w-0 flex-1">
                <LayerPath path={issue.path} />
                <div className="tc-waived-value">
                  <span className="tc-meta shrink-0">
                    {categoryLabels[issue.category]} · {stateLabels[issue.state]}
                  </span>
                  <ValueText value={issue.value} />
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => onWaive([waiverKey(issue)], false)}>
                  撤销
                </Button>
                <FigmaLink href={issue.figmaUrl} label={issue.nodeName} />
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

/** 校对说明：数字从哪来、哪些被排除、哪些拿不准。读者想核对时才会看，排版更轻 */
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

  return (
    <Section id="tc-appendix" title="校对说明" appendix>
      <dl className="tc-notes">
        <div>
          <dt>统计口径</dt>
          <dd>
            统计填充、文字颜色、描边、文字样式、圆角和间距 6 类可绑定属性。覆盖率 = 绑定 HyperOS Token 的属性 ÷
            可绑定属性。阴影等效果不在 Design Token 范围内，不统计
          </dd>
        </div>
        <div>
          <dt>对照的 Token 库</dt>
          <dd>
            {report.library.fileName}，{formatDateTime(report.library.exportedAt)} 导出的快照
          </dd>
        </div>
        <div>
          <dt>准确性检查</dt>
          <dd>
            本次运行{checksRun.length > 0 ? checksRun.map(checkLabel).join('、') : '：无'}。作用域、取值匹配和语义检查会在后续版本提供
          </dd>
        </div>
        <div>
          <dt>键盘</dt>
          <dd>在「按修复」视图里，J / K 切换到下一条或上一条并展开，O 在 Figma 中打开当前这条的第一处，Enter 展开或收起</dd>
        </div>
      </dl>

      <h3 className="tc-subtitle">
        排除的图层
        <Count n={totalNodes} />
      </h3>
      <p className="tc-section-desc">不计入覆盖率。展开可以抽查判定是否合理</p>
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

      <h3 id="tc-waived" className="tc-subtitle">
        有意保留
        <Count n={waived.length} />
      </h3>
      {waived.length === 0 ? (
        <p className="tc-row-text">
          没有标为有意保留的值。在问题清单的「按修复」视图里展开一条，可以把整组标为有意保留
        </p>
      ) : (
        <WaivedList waived={waived} onWaive={onWaive} />
      )}

      <h3 className="tc-subtitle">
        待确认
        <Count n={uncertain.length} />
      </h3>
      <p className="tc-section-desc">规则拿不准的图层，照常计入统计，建议人工看一眼</p>
      {uncertain.length === 0 ? (
        <p className="tc-row-text">没有待确认的图层</p>
      ) : (
        <ul className="tc-rows tc-rows--appendix">
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
    </Section>
  );
}
