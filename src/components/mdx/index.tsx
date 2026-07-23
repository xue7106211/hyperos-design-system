import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';
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

const FumadocsImage = defaultMdxComponents.img;

/** 规范配图常自带圆角；覆盖 Fumadocs 默认 rounded-lg，避免二次裁切 */
function DocsImage(props: ComponentProps<typeof FumadocsImage>) {
  return (
    <FumadocsImage
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
