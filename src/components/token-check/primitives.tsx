import { ArrowUpRight } from 'lucide-react';
import type { AriaRole, ReactNode, Ref } from 'react';
import { Badge, type BadgeTone } from '@/components/arc/badge/badge';
import { Tooltip } from '@/components/arc/tooltip/tooltip';
import { cn } from '@/lib/cn';
import type { BindingState, CoverageStat, FindingSeverity } from '@/lib/token-check/types';
import { formatRate, severityLabels, stateLabels } from './labels';

/**
 * 一级区块：Header（标题 + 一句说明 + 右侧操作）/ Body / 可选 Footer。
 * 面板内的子分组只用 hairline 行、表格或浅底分组头（.tc-subhead），不再嵌套带框卡片。
 */
export function Panel({
  id,
  title,
  description,
  actions,
  footer,
  children,
  flush = false,
  headingRef,
  className,
  role,
}: {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  /** Body 不留内边距：表格、行列表自己处理左右 20px */
  flush?: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
  className?: string;
  role?: AriaRole;
}) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} role={role} className={cn('tc-panel', className)}>
      <div className="tc-panel-head">
        <div className="min-w-0">
          <h2 id={headingId} ref={headingRef} tabIndex={-1} className="tc-heading">
            {title}
          </h2>
          {description ? <p className="tc-panel-desc">{description}</p> : null}
        </div>
        {actions ? <div className="tc-panel-actions">{actions}</div> : null}
      </div>
      {children !== undefined && children !== null ? (
        <div className={flush ? undefined : 'tc-panel-body'}>{children}</div>
      ) : null}
      {footer ? <div className="tc-panel-foot">{footer}</div> : null}
    </section>
  );
}

/** 面板标题后的数量：安静的数字，不做胶囊 */
export function Count({ n }: { n: number }) {
  return <span className="tc-count">{n}</span>;
}

export const barStates: BindingState[] = ['hyperos', 'legacy', 'other', 'unbound'];

/** 四档图例：方块与比例条同色 */
export function Legend() {
  return (
    <ul className="tc-legend">
      {barStates.map((state) => (
        <li key={state}>
          <LegendDot state={state} />
          {stateLabels[state]}
        </li>
      ))}
    </ul>
  );
}

/** 四档堆叠比例条，全页唯一的彩色区域。颜色只是辅助，旁边始终有数字，读屏读 aria-label */
export function CoverageBar({
  stat,
  className,
  size = 'sm',
}: {
  stat: CoverageStat;
  className?: string;
  size?: 'sm' | 'lg';
}) {
  const { total } = stat;
  const pct = (n: number) => (total > 0 ? `${(n / total) * 100}%` : '0%');
  return (
    <div
      role="img"
      aria-label={
        total > 0
          ? `HyperOS ${stat.hyperos}，旧版 Kit 变量 ${stat.legacy}，非 HyperOS 库 ${stat.other}，未绑定 ${stat.unbound}，共 ${total}`
          : '无此类属性'
      }
      className={cn('tc-bar', size === 'lg' ? 'tc-bar--lg' : 'tc-bar--sm', className)}
    >
      {total > 0
        ? barStates
            .filter((state) => stat[state] > 0)
            .map((state) => (
              <span key={state} className={cn('tc-seg', `tc-seg--${state}`)} style={{ width: pct(stat[state]) }} />
            ))
        : null}
    </div>
  );
}

export function LegendDot({ state }: { state: BindingState }) {
  return <span aria-hidden className={cn('tc-dot', `tc-dot--${state}`)} />;
}

const stateTones: Record<BindingState, BadgeTone> = {
  hyperos: 'info',
  legacy: 'warning',
  other: 'neutral',
  unbound: 'danger',
};

export function StateBadge({ state }: { state: BindingState }) {
  return (
    <Badge tone={stateTones[state]} size="sm" dot>
      {stateLabels[state]}
    </Badge>
  );
}

const severityTones: Record<FindingSeverity, BadgeTone> = {
  error: 'danger',
  warning: 'warning',
  info: 'neutral',
};

export function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  return (
    <Badge tone={severityTones[severity]} size="sm" dot>
      {severityLabels[severity]}
    </Badge>
  );
}

/** 「实例覆写」「疑似插图」这类说明性标签 */
export function Tag({ children }: { children: string }) {
  return (
    <Badge tone="neutral" size="sm" outline>
      {children}
    </Badge>
  );
}

export function RateText({ stat, className }: { stat: CoverageStat; className?: string }) {
  return <span className={cn('tabular-nums', className)}>{stat.total > 0 ? formatRate(stat.rate) : '—'}</span>;
}

/** 「在 Figma 中打开」：中性色图标按钮，悬停才变蓝 */
export function FigmaLink({ href, label }: { href: string; label: string }) {
  return (
    <Tooltip content="在 Figma 中打开">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`在 Figma 中打开「${label}」（新窗口）`}
        className="tc-icon-button"
      >
        <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.5} />
      </a>
    </Tooltip>
  );
}

/** 节点 id：优先 nodeId，缺失时从 figmaUrl 的 node-id 取 */
export function nodeIdOf(nodeId: string | undefined, figmaUrl?: string) {
  if (nodeId) return nodeId;
  const raw = figmaUrl?.match(/[?&]node-id=([0-9]+[-:][0-9]+)/)?.[1];
  return raw ? raw.replace('-', ':') : undefined;
}

/** 校样式的位置标注，如 2041:12。全页只有这里和色值用等宽字体 */
export function NodeIdTag({ id }: { id?: string }) {
  if (!id) return null;
  return (
    <span className="tc-node-id" aria-label={`节点 ${id}`}>
      {id}
    </span>
  );
}

function shortenPath(parts: string[]) {
  return parts.length > 4 ? [parts[0], '…', ...parts.slice(-2)] : parts;
}

/** 图层父级路径；省略检查根节点和叶子本身。被缩短时悬停看完整路径 */
export function ParentPath({ path, className }: { path: string[]; className?: string }) {
  const parents = (path.length > 1 ? path.slice(1) : path).slice(0, -1);
  if (parents.length === 0) return null;
  const text = shortenPath(parents).join(' / ');
  const full = path.join(' / ');
  const node = <span className={cn('tc-path', className)}>{text}</span>;
  return text === parents.join(' / ') ? node : <Tooltip content={full}>{node}</Tooltip>;
}

/** 图层：名称 + 父级路径 */
export function LayerPath({ path }: { path: string[] }) {
  const leaf = path[path.length - 1] ?? '';
  return (
    <span className="block min-w-0">
      <span className="tc-layer-name">{leaf}</span>
      <ParentPath path={path} className="mt-0.5" />
    </span>
  );
}

const HEX_LEAD = /^\s*(#(?:[0-9a-f]{8}|[0-9a-f]{6}))\b(.*)$/i;

/** 当前值：以色值开头时附色块，色值用等宽，其余说明用正文字体 */
export function ValueText({ value }: { value: string }) {
  const match = value.match(HEX_LEAD);
  if (!match) {
    return (
      <span className="tc-value truncate" title={value}>
        {value}
      </span>
    );
  }
  const [, hex, rest] = match;
  const alphaMatch = rest.match(/^\s+(\d{1,3})%/);
  const alpha = alphaMatch ? Number(alphaMatch[1]) / 100 : 1;
  return (
    <span className="flex min-w-0 items-center gap-2" title={value}>
      <span aria-hidden className="tc-swatch">
        <span style={{ backgroundColor: hex.slice(0, 7), opacity: alpha }} />
      </span>
      <span className="tc-value truncate">
        <span className="tc-mono">{hex}</span>
        {rest}
      </span>
    </span>
  );
}
