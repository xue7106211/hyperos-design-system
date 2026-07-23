import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Image } from 'fumadocs-core/framework';
import type { MDXComponents } from 'mdx/types';
import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { DosDonts } from './DosDonts';
import { FigmaEmbed } from './FigmaEmbed';
import { FigmaPrototypeEmbed } from './FigmaPrototypeEmbed';
import { IconGallery } from './IconGalleryServer';
import { InlineTOC } from './InlineTOC';
import { PlatformCodeBlock } from './PlatformCodeBlock';
import { PlatformTab, PlatformTabs } from './PlatformTabs';
import { StatusBadge } from './StatusBadge';
import { TokenTable } from './TokenTable';

/** 规范配图常自带圆角；覆盖 Fumadocs 默认 rounded-lg，避免二次裁切 */
function DocsImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <Image
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
      {...props}
      className={cn('rounded-none', props.className)}
    />
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    img: DocsImage,
    FigmaEmbed,
    FigmaPrototypeEmbed,
    IconGallery,
    InlineTOC,
    PlatformTabs,
    PlatformTab,
    PlatformCodeBlock,
    TokenTable,
    StatusBadge,
    DosDonts,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
