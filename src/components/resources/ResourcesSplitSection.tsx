import type { ReactNode } from 'react';

type ResourcesSplitSectionProps = {
  /** 额外 section class，如间距修饰 */
  className?: string;
  /** 文案列顶部图标（可选） */
  icon?: ReactNode;
  copy: ReactNode;
  children: ReactNode;
};

/** 左文右内容双列 — catalog / featured 共用 */
export function ResourcesSplitSection({
  className,
  icon,
  copy,
  children,
}: ResourcesSplitSectionProps) {
  return (
    <section
      className={['resources-split-section', className].filter(Boolean).join(' ')}
    >
      <div className="resources-split-copy">
        {icon}
        {copy}
      </div>
      {children}
    </section>
  );
}
