'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { ResourcesGridCrosses } from '@/components/resources/ResourcesGridCrosses';
import { useResourcesScrollReveal } from '@/components/resources/useResourcesScrollReveal';

export type ResourcesFeatureCardProps = {
  title: string;
  description: string;
  href: string;
  external?: boolean;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  /** 无图时的 pill 占位文案 */
  pill?: string;
  /** 通栏宽卡（Components 首行） */
  wide?: boolean;
  /**
   * 高度随图片自适应、贴边展示。
   * 宽卡 / 专题卡通常为 true；半宽固定高预览为 false。
   */
  media?: boolean;
  /** 卡顶横线与左右竖线交点十字（单列堆叠的非首卡） */
  dividerCrosses?: boolean;
};

function FeatureCta({
  href,
  external,
  title,
  children,
}: {
  href: string;
  external?: boolean;
  title: string;
  children: ReactNode;
}) {
  const className = 'resources-feature-cta';
  const label = external ? `打开「${title}」（新窗口）` : undefined;

  if (external) {
    return (
      <a
        className={className}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

/** 预览区点击热区：仅鼠标/触控；键盘走标题 CTA，避免重复 tab */
function FeatureMediaLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  const className = 'resources-feature-media-link';

  if (external) {
    return (
      <a
        className={className}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={className} href={href} tabIndex={-1} aria-hidden>
      {children}
    </Link>
  );
}

export function ResourcesFeatureCard({
  title,
  description,
  href,
  external,
  image,
  imageWidth = 1024,
  imageHeight = 576,
  pill,
  wide,
  media,
  dividerCrosses,
}: ResourcesFeatureCardProps) {
  const pending = !href || href === '#';
  const useMedia = Boolean(media ?? (wide && image));
  const className = [
    'resources-feature-card',
    wide ? 'resources-feature-card--wide' : '',
    useMedia ? 'resources-feature-card--media' : '',
    pending ? 'resources-feature-card--pending' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const previewMedia = image ? (
    <Image
      className="resources-feature-image"
      src={image}
      alt=""
      width={imageWidth}
      height={imageHeight}
      sizes={
        wide || useMedia
          ? '(min-width: 768px) 677px, 100vw'
          : '(min-width: 768px) 50vw, 100vw'
      }
    />
  ) : pill ? (
    <span className="resources-feature-pill">{pill}</span>
  ) : null;

  return (
    <article className={className}>
      {wide ? (
        <div className="resources-feature-row-crosses" aria-hidden>
          <span className="resources-grid-cross resources-grid-cross--row-l" />
          <span className="resources-grid-cross resources-grid-cross--row-c" />
          <span className="resources-grid-cross resources-grid-cross--row-r" />
        </div>
      ) : null}
      {dividerCrosses ? (
        <div className="resources-feature-divider-crosses" aria-hidden>
          <span className="resources-grid-cross resources-grid-cross--edge-l" />
          <span className="resources-grid-cross resources-grid-cross--edge-r" />
        </div>
      ) : null}
      <div className="resources-feature-preview">
        {previewMedia &&
          (pending ? (
            previewMedia
          ) : (
            <FeatureMediaLink href={href} external={external}>
              {previewMedia}
            </FeatureMediaLink>
          ))}
      </div>
      <div className="resources-feature-meta">
        {pending ? (
          <>
            <div className="resources-feature-cta resources-feature-cta--static">
              <span className="resources-feature-title">{title}</span>
              <span className="resources-feature-status">即将上线</span>
            </div>
            <span className="resources-feature-desc">{description}</span>
          </>
        ) : (
          <>
            <FeatureCta href={href} external={external} title={title}>
              <span className="resources-feature-title">{title}</span>
              <ArrowUpRight
                className="resources-feature-arrow"
                aria-hidden
                strokeWidth={1.75}
              />
            </FeatureCta>
            <span className="resources-feature-desc">{description}</span>
          </>
        )}
      </div>
    </article>
  );
}

type ResourcesFeatureCardGridProps = {
  /** `hero` = Components 宽卡+底行；`stack` = 单列专题/工具 */
  variant?: 'hero' | 'stack';
  children: ReactNode;
};

export function ResourcesFeatureCardGrid({
  variant = 'stack',
  children,
}: ResourcesFeatureCardGridProps) {
  const rootRef = useResourcesScrollReveal();
  const className = [
    'resources-feature-grid',
    'resources-grid-frame',
    variant === 'hero'
      ? 'resources-grid-frame--cols resources-grid-frame--hero-row'
      : 'resources-feature-grid--tools',
  ].join(' ');

  return (
    <div ref={rootRef} className={className}>
      <ResourcesGridCrosses />
      {children}
    </div>
  );
}
