/** 文档组件生命周期状态。 */
type Status = 'stable' | 'beta' | 'deprecated';

/** 各状态对应的视觉样式（背景色与文字色）。 */
const styles: Record<Status, string> = {
  stable: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  beta: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  deprecated: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

/** 各状态对应的展示文案。 */
const labels: Record<Status, string> = {
  stable: 'Stable',
  beta: 'Beta',
  deprecated: 'Deprecated',
};

/**
 * 文档页状态徽章。
 *
 * 根据 frontmatter 中的 `status` 字段渲染 stable / beta / deprecated 标签，
 * 用于在组件文档页顶部直观标识组件成熟度。
 */
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
