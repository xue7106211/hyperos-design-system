import { cn } from '@/lib/cn';
import { buildFeishuChatApplink } from '@/lib/shared';

type DocMetaProps = {
  updatedAt: string;
  maintainer: string;
  maintainerOpenId?: string;
  className?: string;
  maintainerField?: string;
};

function MetaTag({
  label,
  value,
  valueClassName,
  field,
  href,
  tooltip,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  field?: string;
  href?: string;
  tooltip?: string;
}) {
  const tip = tooltip ?? label;
  const shellClass = cn(
    'group relative inline-flex h-8 max-w-full items-center rounded-full',
    'bg-fd-secondary/70 px-2.5 outline-none',
    'text-xs text-fd-foreground/80',
    href &&
      'transition-colors hover:text-fd-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-fd-ring',
  );

  const valueNode = href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        'truncate outline-none transition-colors group-hover:text-fd-primary',
        valueClassName,
      )}
      aria-label={`${label}：${value}，在飞书中打开会话`}
      data-tina-field={field}
    >
      {value}
    </a>
  ) : (
    <span className={cn('truncate', valueClassName)} data-tina-field={field}>
      {value}
    </span>
  );

  return (
    <div tabIndex={href ? undefined : 0} className={shellClass}>
      <dt className="sr-only">{label}</dt>
      <dd className="min-w-0">{valueNode}</dd>
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5',
          '-translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1',
          'bg-fd-popover text-fd-popover-foreground text-[11px] shadow-sm',
          'border border-fd-border',
          'opacity-0 transition-opacity duration-150',
          'group-hover:opacity-100 group-focus-within:opacity-100',
        )}
      >
        {tip}
      </span>
    </div>
  );
}

export function DocMeta({
  updatedAt,
  maintainer,
  maintainerOpenId,
  className,
  maintainerField,
}: DocMetaProps) {
  const openId = maintainerOpenId?.trim();
  const feishuHref = openId ? buildFeishuChatApplink(openId) : undefined;

  return (
    <dl
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-2',
        className,
      )}
    >
      <MetaTag label="更新时间" value={updatedAt} valueClassName="tabular-nums" />
      <MetaTag
        label="维护人"
        value={maintainer}
        field={maintainerField}
        href={feishuHref}
        tooltip={feishuHref ? '在飞书中打开会话' : '维护人'}
      />
    </dl>
  );
}
