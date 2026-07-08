type Status = 'stable' | 'beta' | 'deprecated';

const styles: Record<Status, string> = {
  stable: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  beta: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  deprecated: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

const labels: Record<Status, string> = {
  stable: 'Stable',
  beta: 'Beta',
  deprecated: 'Deprecated',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
