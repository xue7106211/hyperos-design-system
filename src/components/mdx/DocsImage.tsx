import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type DocsImageProps = ComponentProps<'img'>;

function resolveSrc(src: unknown): string | undefined {
  if (typeof src === 'string' && src.length > 0) return src;
  if (src && typeof src === 'object' && 'src' in src) {
    const value = (src as { src?: unknown }).src;
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

/**
 * 规范配图：用 Fancybox 官方声明式 API（data-fancybox 成组）。
 * rounded-none 避免文档站默认圆角二次裁切。
 */
export function DocsImage({
  className,
  alt,
  src,
  width,
  height,
  ...props
}: DocsImageProps) {
  const resolvedSrc = resolveSrc(src);

  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- Fancybox 需要稳定的 src / href 字符串
    <img
      {...props}
      src={resolvedSrc}
      alt={alt ?? ''}
      width={width}
      height={height}
      className={cn('rounded-none', className)}
    />
  );

  if (!resolvedSrc) return image;

  return (
    <a
      href={resolvedSrc}
      data-fancybox="doc-gallery"
      data-caption={alt || undefined}
      className="block cursor-zoom-in no-underline!"
    >
      {image}
    </a>
  );
}
