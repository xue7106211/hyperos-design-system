import { ArrowDown } from "lucide-react";
import type { ReactNode } from "react";
import { Alert } from "@/components/arc/alert/alert";
import { cn } from "@/lib/cn";
import type { FixGroup } from "@/lib/token-check/fix-groups";
import { fixGain, type RunDiff } from "@/lib/token-check/review-state";
import type {
  BindingState,
  CoverageStat,
  TokenCheckReport,
} from "@/lib/token-check/types";
import {
  categoryLabels,
  categoryOrder,
  formatDateTime,
  formatGain,
  formatRate,
  stateLabels,
  tierLabels,
  tierOrder,
} from "./labels";
import {
  barStates,
  CoverageBar,
  FigmaLink,
  LegendDot,
  NodeIdTag,
  RateText,
  Section,
  ValueText,
} from "./primitives";

function share(n: number, total: number) {
  return total > 0 ? formatRate(n / total) : "—";
}

const TOP_FIXES = 3;

type PendingState = Exclude<BindingState, "hyperos">;

/** 交接备注：把没绑定、要迁移、绑错库分开说，因为三者的处理方式不同 */
function pendingParts(stat: CoverageStat) {
  const parts: { state: PendingState; text: ReactNode }[] = [];
  if (stat.unbound > 0)
    parts.push({
      state: "unbound",
      text: (
        <>
          <b>{stat.unbound}</b> 处没有绑定
        </>
      ),
    });
  if (stat.legacy > 0)
    parts.push({
      state: "legacy",
      text: (
        <>
          <b>{stat.legacy}</b> 处是旧版 Kit 变量（需要迁移）
        </>
      ),
    });
  if (stat.other > 0)
    parts.push({
      state: "other",
      text: (
        <>
          <b>{stat.other}</b> 处绑的是其他库
        </>
      ),
    });
  return parts;
}

function joinParts(parts: ReactNode[]) {
  return parts.map((part, i) => (
    // 顿号放在分句末尾：顿号前不能断行，放在开头会把相邻两句粘成一整段不可断的长串
    <span key={i} className="tc-phrase">
      {part}
      {i < parts.length - 1 ? "、" : null}
    </span>
  ));
}

function DiffLine({ diff, waived }: { diff: RunDiff; waived: boolean }) {
  const when = formatDateTime(diff.previousAt);
  const rate =
    diff.rateDelta === null || Math.abs(diff.rateDelta) < 0.05
      ? null
      : `覆盖率 ${diff.rateDelta > 0 ? "+" : "−"}${Math.abs(
          diff.rateDelta
        ).toFixed(1)} 个百分点`;
  let text: string;
  if (diff.pendingDelta < 0)
    text = `比上次检查（${when}）少了 ${-diff.pendingDelta} 处待改`;
  else if (diff.pendingDelta > 0)
    text = `比上次检查（${when}）多了 ${diff.pendingDelta} 处待改`;
  else text = `待改处数和上次检查（${when}）相同`;
  return (
    <p className={cn("tc-diff", diff.pendingDelta < 0 && "tc-diff--better")}>
      {text}
      {rate ? `，${rate}` : ""}
      {waived ? "（按检查结果计，不扣除有意保留）" : ""}
    </p>
  );
}

/**
 * 结论：报告第一屏唯一的「亮处」。覆盖率大数字 + 四档比例条 + 一句交接备注 + 先改这几处。
 * 四档的数量和占比只在这里完整列一次；未覆盖的几档可以点，直接筛选问题清单。
 */
export function Verdict({
  report,
  fixes,
  waivedCount,
  diff,
  onFocusFix,
  onFilterState,
}: {
  report: TokenCheckReport;
  fixes: FixGroup[];
  waivedCount: number;
  diff: RunDiff | null;
  onFocusFix: (key: string) => void;
  onFilterState: (state: PendingState) => void;
}) {
  const { overall } = report.coverage;
  const pending = overall.total - overall.hyperos;
  const clear = overall.total > 0 && pending === 0;
  const top = fixes.slice(0, TOP_FIXES);

  return (
    <section
      id="tc-verdict"
      aria-labelledby="tc-verdict-title"
      className={cn("tc-section tc-verdict", clear && "tc-verdict--clear")}
    >
      <h2 id="tc-verdict-title" tabIndex={-1} className="sr-only">
        结论
      </h2>
      <div className="tc-verdict-main">
        <div className="min-w-0">
          <p className="tc-verdict-label">HyperOS Token 覆盖率</p>
          <p className="tc-figure">{formatRate(overall.rate)}</p>
        </div>
        <div className="tc-verdict-note">
          {overall.total === 0 ? (
            <p className="tc-verdict-sentence">
              {waivedCount > 0
                ? "可绑定的值都已标为有意保留，没有可统计的属性"
                : "所选范围里没有可绑定的属性"}
            </p>
          ) : clear ? (
            <>
              <p className="tc-verdict-clear">
                {waivedCount > 0 ? "其余的值都有了出处" : "每个值都有了出处"}
              </p>
              <p className="tc-verdict-sentence">
                {waivedCount > 0 ? "除有意保留的值外，" : ""}
                <b>{overall.total}</b> 处可绑定的值都能追溯到 HyperOS Token
              </p>
              <p className="tc-meta tabular-nums">
                {formatDateTime(report.generatedAt)} 检查
              </p>
            </>
          ) : (
            <p className="tc-verdict-sentence">
              <b>{overall.total}</b> 处可绑定的值里，<b>{overall.hyperos}</b>{" "}
              处已绑定 HyperOS Token；另外{" "}
              {joinParts(pendingParts(overall).map((p) => p.text))}
              。相同的值合并后，共 <b>{fixes.length}</b> 处要改
            </p>
          )}
          {diff ? <DiffLine diff={diff} waived={waivedCount > 0} /> : null}
          {waivedCount > 0 ? (
            <p className="tc-meta">
              另有 <span className="tabular-nums">{waivedCount}</span>{" "}
              处标为有意保留，不计入覆盖率，
              <a href="#tc-waived" className="tc-text-link">
                在校对说明里查看
              </a>
            </p>
          ) : null}
        </div>
      </div>

      <CoverageBar
        stat={overall}
        size="lg"
        className="mt-6"
        onSelect={clear ? undefined : onFilterState}
      />
      {clear ? null : (
        <dl className="tc-states">
          {barStates.map((state) => {
            const value = (
              <>
                <span className="tc-state-value">{overall[state]}</span>
                <span className="tc-meta">
                  {share(overall[state], overall.total)}
                </span>
              </>
            );
            const filterable = state !== "hyperos" && overall[state] > 0;
            return (
              <div key={state} className="tc-state">
                <dt>
                  <LegendDot state={state} />
                  {stateLabels[state]}
                </dt>
                <dd>
                  {filterable ? (
                    <button
                      type="button"
                      className="tc-state-button"
                      aria-label={`${stateLabels[state]} ${overall[state]} 处，筛选问题清单`}
                      onClick={() => onFilterState(state as PendingState)}
                    >
                      {value}
                    </button>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      )}

      {report.warnings.length > 0 ? (
        <Alert
          tone="warning"
          title={`本次结果有 ${report.warnings.length} 条提示`}
          className="mt-6"
        >
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
          <p className="tc-section-desc">按改完后覆盖率能提升多少排序</p>
          <ol>
            {top.map((fix) => (
              <li key={fix.key}>
                <button
                  type="button"
                  className="tc-top-fix"
                  onClick={() => onFocusFix(fix.key)}
                >
                  <span className="tc-top-fix-value">
                    <ValueText value={fix.value} />
                  </span>
                  <span className="tc-top-fix-meta">
                    {categoryLabels[fix.category]} · {fix.issues.length} 处
                  </span>
                  <span className="tc-top-fix-count">
                    <span>
                      {formatGain(fixGain(fix.issues.length, overall.total))}
                      <span className="tc-top-fix-unit"> 个百分点</span>
                    </span>
                    <ArrowDown
                      aria-hidden
                      className="size-4"
                      strokeWidth={1.5}
                    />
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
                <tr
                  key={category}
                  className={empty ? "text-fd-muted-foreground" : undefined}
                >
                  <th scope="row">{categoryLabels[category]}</th>
                  <td>
                    {empty ? (
                      <span className="text-xs text-fd-muted-foreground">
                        无此类属性
                      </span>
                    ) : (
                      <CoverageBar stat={stat} />
                    )}
                  </td>
                  <td className="tc-num font-medium text-fd-foreground">
                    <RateText stat={stat} />
                  </td>
                  <td className="tc-num hidden text-fd-muted-foreground sm:table-cell">
                    {empty ? "—" : `${stat.hyperos} / ${stat.total}`}
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
                      <span className="truncate font-medium text-fd-foreground">
                        {summary.nodeName}
                      </span>
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
                    <FigmaLink
                      href={summary.target.url}
                      label={summary.nodeName}
                    />
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
                  <dd className="font-medium text-fd-foreground">
                    {byTier[tier]}
                  </dd>
                  <dd className="text-xs">
                    {formatRate(byTier[tier] / tierTotal)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </Section>
  );
}
