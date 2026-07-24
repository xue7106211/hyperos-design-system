import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { DocsImage } from './DocsImage';

type SpecImageItem = {
  src: string;
  alt: string;
  caption?: string;
};

type SpecImageGridProps = {
  items: SpecImageItem[];
  /** 桌面端列数，默认 2；窄屏自动单列 */
  cols?: 2 | 3 | 4;
  className?: string;
};

/**
 * 规范配图并排：单行多列（窄屏降为单列），仍走 DocsImage / Fancybox。
 */
export function SpecImageGrid({
  items,
  cols = 2,
  className,
}: SpecImageGridProps) {
  const colClass =
    cols === 4
      ? 'grid-cols-2 lg:grid-cols-4'
      : cols === 3
        ? 'grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-2';

  return (
    <div className={cn('my-6 grid gap-4 not-prose', colClass, className)}>
      {items.map((item) => (
        <figure key={item.src} className="m-0 flex min-w-0 flex-col gap-2">
          <DocsImage
            src={item.src}
            alt={item.alt}
            className="h-auto w-full"
          />
          {item.caption ? (
            <figcaption className="text-center text-sm text-fd-muted-foreground">
              {item.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}

export type { SpecImageGridProps, SpecImageItem };
export type SpecImageGridComponentProps = ComponentProps<typeof SpecImageGrid>;
