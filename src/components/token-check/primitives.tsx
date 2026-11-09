import { ExternalLink } from 'lucide-react';
import type { AriaRole, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';
import type { BindingState, CoverageStat } from '@/lib/token-check/types';
import { formatRate, stateLabels } from './labels';

/**
 * 一级区块的统一解剖：Header（标题 + 一句说明 + 右侧操作）/ Body / 可选 Footer。
 * 面板内子分组用 hairline 行、表格或浅底分组头（.tc-subhead），不再嵌套带框卡片。
 */
export function Panel({
  id,
  title,
  description,
  actions,
  footer,
  children,
  flush = false,
  icon,
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
  icon?: ReactNode;
  headingRef?: Ref<HTMLHeadingElement>;
  className?: string;
  role?: AriaRole;
}) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} role={role} className={cn('tc-panel', className)}>
      <div className="tc-panel-head">
        <div className="flex min-w-0 items-start gap-2">
          {icon}
          <div className="min-w-0">
            <h2
              id={headingId}
              ref={headingRef}
              tabIndex={-1}
              className="tc-heading rounded-sm text-base font-medium text-fd-foreground"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm text-fd-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex min-w-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children !== undefined && children !== null ? (
        <div className={flush ? undefined : 'tc-panel-body'}>{children}</div>
      ) : null}
      {footer ? <div className="tc-panel-foot">{footer}</div> : null}
    </section>
  );
}

/** 四档图例：放在用到比例条的面板 Header 右侧 */
export function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fd-muted-foreground">
      {barStates.map((state) => (
        <li key={state} className="flex items-center gap-1.5">
          <LegendDot state={state} />
          {stateLabels[state]}
        </li>
      ))}
    </ul>
  );
}

export const barStates: BindingState[] = ['hyperos', 'legacy', 'other', 'unbound'];

/**
 * 四档堆叠比例条。颜色只是辅助，旁边始终有数字，读屏读取 aria-label。
 */
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
              <span
                key={state}
                className={cn('tc-seg', `tc-seg--${state}`)}
                style={{ width: pct(stat[state]) }}
              />
            ))
        : null}
    </div>
  );
}

export function LegendDot({ state }: { state: BindingState }) {
  return <span aria-hidden className={cn('tc-dot', `tc-dot--${state}`)} />;
}

export function StateBadge({ state }: { state: BindingState }) {
  return (
    <span className="tc-badge">
      <LegendDot state={state} />
      {stateLabels[state]}
    </span>
  );
}

export function RateText({ stat, className }: { stat: CoverageStat; className?: string }) {
  return (
    <span className={cn('tabular-nums', className)}>
      {stat.total > 0 ? formatRate(stat.rate) : '—'}
    </span>
  );
}

/** 「在 Figma 中打开」：中性色图标按钮，hover 才变蓝 */
export function FigmaLink({
  href,
  label,
}: {
  href: string;
  /** 读屏用的图层名 */
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`在 Figma 中打开「${label}」（新窗口）`}
      title="在 Figma 中打开"
      className="tc-icon-button"
    >
      <ExternalLink aria-hidden className="size-4" strokeWidth={1.5} />
    </a>
  );
}

/** 节点 id：优先 nodeId，缺失时从 figmaUrl 的 node-id 取 */
export function nodeIdOf(nodeId: string | undefined, figmaUrl?: string) {
  if (nodeId) return nodeId;
  const raw = figmaUrl?.match(/[?&]node-id=([0-9]+[-:][0-9]+)/)?.[1];
  return raw ? raw.replace('-', ':') : undefined;
}

/** 校样式的位置标注，如 2041:12 */
export function NodeIdTag({ id }: { id?: string }) {
  if (!id) return null;
  return (
    <span className="tc-node-id" title={`节点 ${id}`}>
      {id}
    </span>
  );
}

function shortenPath(parts: string[]) {
  return parts.length > 4 ? [parts[0], '…', ...parts.slice(-2)] : parts;
}

/** 图层父级路径（等宽）；省略检查根节点和叶子本身 */
export function MonoPath({ path, className }: { path: string[]; className?: string }) {
  const parents = (path.length > 1 ? path.slice(1) : path).slice(0, -1);
  if (parents.length === 0) return null;
  return (
    <span className={cn('tc-path block truncate', className)} title={path.join(' / ')}>
      {shortenPath(parents).join(' / ')}
    </span>
  );
}

/** 图层：名称 + 等宽父级路径 */
export function LayerPath({ path }: { path: string[] }) {
  const leaf = path[path.length - 1] ?? '';
  return (
    <span className="block min-w-0">
      <span className="block truncate text-sm font-medium text-fd-foreground">{leaf}</span>
      <MonoPath path={path} className="mt-0.5" />
    </span>
  );
}

const HEX_RE = /#([0-9a-f]{6}|[0-9a-f]{8})\b/i;

/** 当前值；以色值开头时附色块，色值文字仍保留 */
export function ValueText({ value }: { value: string }) {
  const match = value.match(HEX_RE);
  const swatch = match && value.trimStart().startsWith('#') ? `#${match[1]}` : null;
  let alpha = 1;
  const pctMatch = value.match(/#[0-9a-f]{6}\s+(\d{1,3})%/i);
  if (pctMatch) alpha = Number(pctMatch[1]) / 100;
  return (
    <span className="flex min-w-0 items-center gap-2">
      {swatch ? (
        <span aria-hidden className="tc-swatch">
          <span style={{ backgroundColor: swatch, opacity: alpha }} />
        </span>
      ) : null}
      <span className="truncate font-mono text-xs text-fd-foreground" title={value}>
        {value}
      </span>
    </span>
  );
}
