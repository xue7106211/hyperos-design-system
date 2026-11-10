import { AlertTriangle } from 'lucide-react';
import type { BindingState, TokenCheckReport } from '@/lib/token-check/types';
import {
  categoryLabels,
  categoryOrder,
  exclusionOrder,
  formatRate,
  stateLabels,
  tierLabels,
  tierOrder,
} from './labels';
import {
  barStates,
  Count,
  CoverageBar,
  FigmaLink,
  Legend,
  LegendDot,
  NodeIdTag,
  Panel,
  RateText,
} from './primitives';

const stateHints: Record<BindingState, string> = {
  hyperos: '已覆盖',
  legacy: '需迁移',
  other: '需改绑',
  unbound: '需绑定',
};

function share(n: number, total: number) {
  return total > 0 ? formatRate(n / total) : '—';
}

function Conclusion({ report }: { report: TokenCheckReport }) {
  const { overall } = report.coverage;
  if (overall.total === 0) return <>没有可绑定的属性</>;
  const pending = overall.total - overall.hyperos;
  if (pending === 0) return <>全部 <span className="tabular-nums">{overall.total}</span> 项可绑定属性都已绑定 HyperOS Token。</>;
  return (
    <>
      <span className="tabular-nums">{overall.total}</span> 项可绑定属性中，
      <span className="tabular-nums">{overall.hyperos}</span> 项已绑定 HyperOS Token，还有{' '}
      <span className="tabular-nums font-medium text-fd-foreground">{pending}</span> 项需要处理。
    </>
  );
}

export function CoverageOverview({ report }: { report: TokenCheckReport }) {
  const { overall } = report.coverage;
  const excludedNodes = exclusionOrder.reduce((s, r) => s + report.exclusionSummary[r].nodeCount, 0);

  return (
    <Panel
      id="tc-overview"
      title="总览"
      description="覆盖率 = 绑定到 HyperOS Token 的属性 ÷ 可绑定属性，排除的图层不计入"
      flush
      footer={
        report.warnings.length > 0 ? (
          <div role="status" className="flex items-start gap-2">
            <AlertTriangle
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-[var(--tc-warn-fg)]"
              strokeWidth={1.5}
            />
            <div className="min-w-0">
              <p className="text-fd-foreground">本次结果有 {report.warnings.length} 条提示</p>
              <ul className="mt-1 space-y-1">
                {report.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : undefined
      }
    >
      <div className="tc-kpis">
        <div className="tc-kpi-main min-w-0">
          <p className="text-sm text-fd-muted-foreground">Token 覆盖率</p>
          <p className="tc-figure mt-3">{formatRate(overall.rate)}</p>
          <CoverageBar stat={overall} size="lg" className="mt-4" />
          <p className="mt-3 text-sm text-fd-muted-foreground">
            <Conclusion report={report} />
          </p>
          <p className="mt-1 text-xs tabular-nums text-fd-muted-foreground">
            另排除 {excludedNodes} 个图层 · 准确性发现 {report.findings.length} 项
          </p>
        </div>
        {barStates.map((state) => (
          <div key={state} className="min-w-0">
            <p className="flex items-center gap-2 text-sm text-fd-muted-foreground">
              <LegendDot state={state} />
              <span className="truncate">{stateLabels[state]}</span>
            </p>
            <p className="tc-stat-value mt-3">{overall[state]}</p>
            <p className="mt-1 text-xs tabular-nums text-fd-muted-foreground">
              占 {share(overall[state], overall.total)}
            </p>
            <p className="mt-1 text-xs text-fd-muted-foreground">{stateHints[state]}</p>
          </div>
        ))}
      </div>

      <h3 className="tc-subhead">
        检查目标
        <Count n={report.targets.length} />
      </h3>
      <table className="tc-table">
        <caption className="sr-only">各检查目标的覆盖率</caption>
        <thead>
          <tr>
            <th scope="col">名称</th>
            <th scope="col" className="hidden sm:table-cell">
              类型
            </th>
            <th scope="col" className="hidden md:table-cell">
              节点
            </th>
            <th scope="col" className="hidden w-[28%] sm:table-cell">
              分布
            </th>
            <th scope="col" className="tc-num">
              覆盖率
            </th>
            <th scope="col" className="hidden tc-num md:table-cell">
              属性数
            </th>
            <th scope="col" className="w-12">
              <span className="sr-only">打开</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {report.targets.map((summary) => (
            <tr key={summary.target.url}>
              <td className="max-w-0 sm:max-w-none">
                <span className="block truncate font-medium text-fd-foreground">{summary.nodeName}</span>
              </td>
              <td className="hidden text-xs text-fd-muted-foreground sm:table-cell">
                {summary.nodeType}
              </td>
              <td className="hidden md:table-cell">
                <NodeIdTag id={summary.target.nodeId} />
              </td>
              <td className="hidden sm:table-cell">
                <CoverageBar stat={summary.coverage} />
              </td>
              <td className="tc-num font-medium text-fd-foreground">
                <RateText stat={summary.coverage} />
              </td>
              <td className="hidden tc-num text-fd-muted-foreground md:table-cell">
                {summary.coverage.hyperos}/{summary.coverage.total}
              </td>
              <td className="text-right">
                <FigmaLink href={summary.target.url} label={summary.nodeName} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

export function CategoryCoverage({ report }: { report: TokenCheckReport }) {
  const { byCategory, byTier, overall } = report.coverage;
  const tierTotal = tierOrder.reduce((sum, tier) => sum + byTier[tier], 0);

  return (
    <Panel
      id="tc-categories"
      title="分类覆盖率"
      description="旧版 Kit 变量、非 HyperOS 库和未绑定的属性都算未覆盖"
      actions={<Legend />}
      flush
      footer={
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="text-fd-foreground">已绑定 Token 的层级</span>
          {tierTotal === 0 ? (
            <span>没有绑定 HyperOS Token 的属性</span>
          ) : (
            <>
              <dl className="flex flex-wrap gap-x-6 gap-y-1 tabular-nums">
                {tierOrder.map((tier) => (
                  <div key={tier} className="flex items-baseline gap-2">
                    <dt>{tierLabels[tier]}</dt>
                    <dd className="font-medium text-fd-foreground">{byTier[tier]}</dd>
                    <dd className="text-xs">{formatRate(byTier[tier] / tierTotal)}</dd>
                  </div>
                ))}
              </dl>
              {byTier.reference > 0 ? (
                <span className="basis-full text-xs">
                  业务稿应优先绑定 Semantic / Component 层，Reference 层的使用见「准确性检查」。
                </span>
              ) : null}
            </>
          )}
        </div>
      }
    >
      <table className="tc-table">
        <caption className="sr-only">各属性类别的 Token 覆盖率</caption>
        <thead>
          <tr>
            <th scope="col" className="w-24">
              类别
            </th>
            <th scope="col">分布</th>
            <th scope="col" className="tc-num w-20">
              覆盖率
            </th>
            <th scope="col" className="tc-num hidden w-24 sm:table-cell">
              已绑定/总数
            </th>
            {barStates.slice(1).map((state) => (
              <th key={state} scope="col" className="tc-num hidden w-24 lg:table-cell">
                {stateLabels[state]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categoryOrder.map((category) => {
            const stat = byCategory[category];
            const empty = stat.total === 0;
            return (
              <tr key={category} className={empty ? 'text-fd-muted-foreground' : undefined}>
                <th scope="row">
                  {categoryLabels[category]}
                </th>
                <td>
                  {empty ? (
                    <span className="text-xs text-fd-muted-foreground">无此类属性</span>
                  ) : (
                    <CoverageBar stat={stat} />
                  )}
                </td>
                <td className="tc-num font-medium text-fd-foreground">
                  <RateText stat={stat} />
                </td>
                <td className="tc-num hidden text-fd-muted-foreground sm:table-cell">
                  {empty ? '—' : `${stat.hyperos}/${stat.total}`}
                </td>
                {barStates.slice(1).map((state) => (
                  <td key={state} className="tc-num hidden lg:table-cell">
                    <span className={stat[state] > 0 ? 'text-fd-foreground' : 'text-fd-muted-foreground'}>
                      {empty ? '—' : stat[state]}
                    </span>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>合计</td>
            <td>
              <CoverageBar stat={overall} />
            </td>
            <td className="tc-num">
              <RateText stat={overall} />
            </td>
            <td className="tc-num hidden sm:table-cell">
              {overall.hyperos}/{overall.total}
            </td>
            {barStates.slice(1).map((state) => (
              <td key={state} className="tc-num hidden lg:table-cell">
                {overall[state]}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </Panel>
  );
}
