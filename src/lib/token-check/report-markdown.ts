/**
 * 把检查报告导出为中文 Markdown。
 */
import type {
  BindableProperty,
  BindingState,
  CoverageStat,
  ExclusionReason,
  FindingSeverity,
  PropertyCategory,
  TokenCheckReport,
  TokenTier,
  Uncertain,
} from './types';

export const CATEGORY_LABELS: Record<PropertyCategory, string> = {
  fill: '填充',
  'text-color': '文字颜色',
  stroke: '描边',
  typography: '字体样式',
  radius: '圆角',
  spacing: '间距',
};

export const STATE_LABELS: Record<BindingState, string> = {
  hyperos: 'HyperOS Token',
  legacy: '旧版 Kit 变量',
  other: '非 HyperOS 库',
  unbound: '未绑定',
};

export const EXCLUSION_LABELS: Record<ExclusionReason, string> = {
  'miuix-instance': 'MIUIX 组件实例',
  illustration: '插图 / 矢量 / 图片',
  annotation: '标注说明',
  hidden: '隐藏图层',
};

export const TIER_LABELS: Record<TokenTier, string> = {
  reference: 'Reference',
  semantic: 'Semantic',
  component: 'Component',
};

export const UNCERTAIN_LABELS: Record<Uncertain['kind'], string> = {
  'possible-illustration': '可能是插图',
  'possible-detached-component': '可能是分离的组件',
};

export const SEVERITY_LABELS: Record<FindingSeverity, string> = {
  error: '错误',
  warning: '警告',
  info: '提示',
};

/** 表格单元格转义：竖线与换行 */
function cell(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '—';
  return String(value).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function link(label: string, url: string): string {
  return `[${label.replace(/[[\]]/g, '\\$&')}](${url})`;
}

export function formatRate(rate: number | null): string {
  return rate === null ? '—' : `${(rate * 100).toFixed(1)}%`;
}

function coverageRow(label: string, stat: CoverageStat): string {
  return `| ${label} | ${formatRate(stat.rate)} | ${stat.total} | ${stat.hyperos} | ${stat.legacy} | ${stat.other} | ${stat.unbound} |`;
}

const COVERAGE_HEADER = ['| 范围 | 覆盖率 | 可绑定属性 | HyperOS Token | 旧版 Kit 变量 | 非 HyperOS 库 | 未绑定 |', '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'];

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

export function reportToMarkdown(
  report: TokenCheckReport,
  options: { waived?: BindableProperty[] } = {},
): string {
  const waived = options.waived ?? [];
  const lines: string[] = [];
  const push = (...rows: string[]) => lines.push(...rows);

  push('# Figma Token 绑定检查报告', '');
  push(`- 生成时间：${formatDate(report.generatedAt)}`);
  push(`- Token 库：${report.library.fileName}（快照导出于 ${formatDate(report.library.exportedAt)}）`);
  push(`- 准确性检查：${report.checksRun.length ? report.checksRun.join('、') : '无'}`, '');

  if (report.warnings.length) {
    push('> **提示**', ...report.warnings.map((warning) => `> - ${warning}`), '');
  }

  // 总览
  push('## 总览', '', ...COVERAGE_HEADER, coverageRow('**全部**', report.coverage.overall));
  for (const summary of report.targets) {
    push(coverageRow(`${link(cell(summary.nodeName), summary.target.url)}（${summary.nodeType}）`, summary.coverage));
  }
  push('', '覆盖率 = 绑定到 HyperOS Token 的属性 / 可绑定属性。非 HyperOS 库与未绑定都算未覆盖。', '');

  // 分类覆盖率
  push('## 分类覆盖率', '', ...COVERAGE_HEADER.map((row, i) => (i === 0 ? row.replace('范围', '类别') : row)));
  for (const [category, label] of Object.entries(CATEGORY_LABELS) as [PropertyCategory, string][]) {
    push(coverageRow(label, report.coverage.byCategory[category]));
  }
  push('');

  const tierTotal = Object.values(report.coverage.byTier).reduce((sum, count) => sum + count, 0);
  if (tierTotal) {
    push('### HyperOS Token 层级分布', '', '| 层级 | 属性数 | 占比 |', '| --- | ---: | ---: |');
    for (const [tier, label] of Object.entries(TIER_LABELS) as [TokenTier, string][]) {
      const count = report.coverage.byTier[tier];
      push(`| ${label} | ${count} | ${formatRate(count / tierTotal)} |`);
    }
    push('', '样式（文字 / 颜色样式）不区分层级，不计入此表。', '');
  }

  // 排除统计
  push('## 排除统计', '', '| 原因 | 排除次数 | 涉及图层 |', '| --- | ---: | ---: |');
  for (const [reason, label] of Object.entries(EXCLUSION_LABELS) as [ExclusionReason, string][]) {
    const { count, nodeCount } = report.exclusionSummary[reason];
    push(`| ${label} | ${count} | ${nodeCount} |`);
  }
  push('');
  if (report.exclusions.length) {
    push('<details>', '<summary>排除明细</summary>', '', '| 图层 | 原因 | 依据 | 图层数 |', '| --- | --- | --- | ---: |');
    for (const item of report.exclusions) {
      push(`| ${link(cell(item.path.join(' / ')), item.figmaUrl)} | ${EXCLUSION_LABELS[item.reason]} | ${cell(item.detail)} | ${item.nodeCount} |`);
    }
    push('', '</details>', '');
  }

  if (report.uncertain.length) {
    push('## 需要人工确认', '', '以下图层仍计入统计，但规则拿不准，请抽查。', '', '| 图层 | 类型 | 依据 |', '| --- | --- | --- |');
    for (const item of report.uncertain) {
      push(`| ${link(cell(item.path.join(' / ')), item.figmaUrl)} | ${UNCERTAIN_LABELS[item.kind]} | ${cell(item.detail)} |`);
    }
    push('');
  }

  // 问题清单
  push(`## 问题清单（${report.issues.length}）`, '');
  if (report.issues.length) {
    push('| 图层 | 类别 | 字段 | 状态 | 当前值 |', '| --- | --- | --- | --- | --- |');
    for (const issue of report.issues) {
      const suffix = issue.fromInstanceOverride ? '（实例覆写）' : '';
      push(
        `| ${link(cell(issue.path.join(' / ')), issue.figmaUrl)} | ${CATEGORY_LABELS[issue.category]}${suffix} | \`${cell(issue.field)}\` | ${STATE_LABELS[issue.state]} | ${cell(issue.value)}${issue.state === 'legacy' && issue.token ? `（${cell(`${issue.token.collection} / ${issue.token.name}`)}）` : ''} |`,
      );
    }
  } else {
    push('没有发现未绑定或绑定到非 HyperOS 库的属性。');
  }
  push('');

  // 有意保留：不计入覆盖率，但公开列出，供评审核对
  if (waived.length) {
    push(`## 有意保留（${waived.length}）`, '', '设计师标记为有意不绑定 Token 的属性，已从覆盖率分母中移除。', '', '| 图层 | 类别 | 字段 | 原状态 | 当前值 |', '| --- | --- | --- | --- | --- |');
    for (const issue of waived) {
      push(
        `| ${link(cell(issue.path.join(' / ')), issue.figmaUrl)} | ${CATEGORY_LABELS[issue.category]} | \`${cell(issue.field)}\` | ${STATE_LABELS[issue.state]} | ${cell(issue.value)} |`,
      );
    }
    push('');
  }

  // 准确性发现
  push(`## 准确性发现（${report.findings.length}）`, '');
  if (report.findings.length) {
    push('| 图层 | 级别 | 检查 | 字段 | 说明 | 当前 Token | 建议 |', '| --- | --- | --- | --- | --- | --- | --- |');
    for (const finding of report.findings) {
      push(
        `| ${link(cell(finding.path.join(' / ')), finding.figmaUrl)} | ${SEVERITY_LABELS[finding.severity]} | ${finding.checkId} | \`${cell(finding.field)}\` | ${cell(finding.message)} | ${cell(finding.current)} | ${cell(finding.suggestion)} |`,
      );
    }
  } else {
    push('没有发现准确性问题。');
  }
  push('');

  return lines.join('\n');
}
