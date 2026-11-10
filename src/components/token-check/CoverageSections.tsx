import { ArrowDown } from 'lucide-react';
import { Alert } from '@/components/arc/alert/alert';
import type { FixGroup } from '@/lib/token-check/fix-groups';
import type { TokenCheckReport } from '@/lib/token-check/types';
import {
  categoryLabels,
  categoryOrder,
  fixActionLabels,
  formatRate,
  stateLabels,
  tierLabels,
  tierOrder,
} from './labels';
import {
  barStates,
  CoverageBar,
  FigmaLink,
  LegendDot,
  NodeIdTag,
  RateText,
  Section,
  ValueText,
} from './primitives';

function share(n: number, total: number) {
  return total > 0 ? formatRate(n / total) : '—';
}

const TOP_FIXES = 3;

/**
 * 结论：报告第一屏唯一的「亮处」。覆盖率大数字 + 四档比例条 + 一句结论 + 先改这几处。
 * 四档的数量和占比只在这里完整列一次。
 */
export function Verdict({
  report,
  fixes,
  onFocusFix,
}: {
  report: TokenCheckReport;
  fixes: FixGroup[];
  onFocusFix: (key: string) => void;
}) {
  const { overall } = report.coverage;
  const pending = overall.total - overall.hyperos;
  const top = fixes.slice(0, TOP_FIXES);

  return (
    <section id="tc-verdict" aria-labelledby="tc-verdict-title" className="tc-section tc-verdict">
      <h2 id="tc-verdict-title" tabIndex={-1} className="sr-only">
        结论
      </h2>
      <div className="tc-verdict-main">
        <div className="min-w-0">
          <p className="tc-verdict-label">HyperOS Token 覆盖率</p>
          <p className="tc-figure">{formatRate(overall.rate)}</p>
        </div>
        <p className="tc-verdict-sentence">
          {overall.total === 0 ? (
            '所选范围里没有可绑定的属性'
          ) : pending === 0 ? (
            <>
              全部 <b>{overall.total}</b> 处值都能追溯到 HyperOS Token
            </>
          ) : (
            <>
              <b>{overall.total}</b> 处可绑定的值里，<b>{pending}</b> 处还没有绑定 HyperOS Token。相同的值合并后，共 <b>{fixes.length}</b> 处要改
            </>
          )}
        </p>
      </div>

      <CoverageBar stat={overall} size="lg" className="mt-6" />
      <dl className="tc-states">
        {barStates.map((state) => (
          <div key={state} className="tc-state">
            <dt>
              <LegendDot state={state} />
              {stateLabels[state]}
            </dt>
            <dd>
              <span className="tc-state-value">{overall[state]}</span>
              <span className="tc-meta">{share(overall[state], overall.total)}</span>
            </dd>
          </div>
        ))}
      </dl>

      {report.warnings.length > 0 ? (
        <Alert tone="warning" title={`本次结果有 ${report.warnings.length} 条提示`} className="mt-6">
          {report.warnings.map((w, i) => (
            <span key={i} className="block">
              {w}
            </span>
          ))}
        </Alert>
      ) : null}

      {top.length > 0 ? (
        <div className="tc-top-fixes">
          <h3 className="tc-subtitle">先改这几处</h3>
          <ol>
            {top.map((fix) => (
              <li key={fix.key}>
                <button type="button" className="tc-top-fix" onClick={() => onFocusFix(fix.key)}>
                  <span className="tc-top-fix-value">
                    <ValueText value={fix.value} />
                  </span>
                  <span className="tc-top-fix-meta">
                    {categoryLabels[fix.category]} · {fixActionLabels[fix.state]}
                  </span>
                  <span className="tc-top-fix-count">
                    {fix.issues.length} 处
                    <ArrowDown aria-hidden className="size-4" strokeWidth={1.5} />
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

/** 分布：按类别、按检查目标两张表，外加已绑定 Token 的层级 */
export function Distribution({ report }: { report: TokenCheckReport }) {
  const { byCategory, byTier } = report.coverage;
  const tierTotal = tierOrder.reduce((sum, tier) => sum + byTier[tier], 0);

  return (
    <Section
      id="tc-distribution"
      title="分布"
      description="覆盖率 = 绑定 HyperOS Token 的属性 ÷ 可绑定属性。旧版 Kit 变量、非 HyperOS 库和未绑定都算未覆盖"
    >
      <div className="tc-box">
        <table className="tc-table">
          <caption className="sr-only">各属性类别的 Token 覆盖率</caption>
          <thead>
            <tr>
              <th scope="col" className="w-28">
                类别
              </th>
              <th scope="col">分布</th>
              <th scope="col" className="tc-num w-20">
                覆盖率
              </th>
              <th scope="col" className="tc-num hidden w-28 sm:table-cell">
                已绑定 / 总数
              </th>
            </tr>
          </thead>
          <tbody>
            {categoryOrder.map((category) => {
              const stat = byCategory[category];
              const empty = stat.total === 0;
              return (
                <tr key={category} className={empty ? 'text-fd-muted-foreground' : undefined}>
                  <th scope="row">{categoryLabels[category]}</th>
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
                    {empty ? '—' : `${stat.hyperos} / ${stat.total}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {report.targets.length > 1 ? (
          <table className="tc-table tc-table--sub">
            <caption className="sr-only">各检查目标的覆盖率</caption>
            <thead>
              <tr>
                <th scope="col">检查目标</th>
                <th scope="col" className="hidden w-[30%] sm:table-cell">
                  分布
                </th>
                <th scope="col" className="tc-num w-20">
                  覆盖率
                </th>
                <th scope="col" className="tc-num hidden w-28 md:table-cell">
                  已绑定 / 总数
                </th>
                <th scope="col" className="w-12">
                  <span className="sr-only">打开</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {report.targets.map((summary) => (
                <tr key={summary.target.url}>
                  <td className="max-w-0">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-medium text-fd-foreground">{summary.nodeName}</span>
                      <NodeIdTag id={summary.target.nodeId} />
                    </span>
                  </td>
                  <td className="hidden sm:table-cell">
                    <CoverageBar stat={summary.coverage} />
                  </td>
                  <td className="tc-num font-medium text-fd-foreground">
                    <RateText stat={summary.coverage} />
                  </td>
                  <td className="tc-num hidden text-fd-muted-foreground md:table-cell">
                    {summary.coverage.hyperos} / {summary.coverage.total}
                  </td>
                  <td className="text-right">
                    <FigmaLink href={summary.target.url} label={summary.nodeName} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        <div className="tc-box-foot">
          <span className="text-fd-foreground">已绑定 Token 的层级</span>
          {tierTotal === 0 ? (
            <span>没有绑定 HyperOS Token 的属性</span>
          ) : (
            <dl className="flex flex-wrap gap-x-6 gap-y-1 tabular-nums">
              {tierOrder.map((tier) => (
                <div key={tier} className="flex items-baseline gap-2">
                  <dt>{tierLabels[tier]}</dt>
                  <dd className="font-medium text-fd-foreground">{byTier[tier]}</dd>
                  <dd className="text-xs">{formatRate(byTier[tier] / tierTotal)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </Section>
  );
}
