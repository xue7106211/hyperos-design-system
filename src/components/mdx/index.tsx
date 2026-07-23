import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { DocsImage } from './DocsImage';
import { DosDonts } from './DosDonts';
import { FigmaEmbed } from './FigmaEmbed';
import { FigmaPrototypeEmbed } from './FigmaPrototypeEmbed';
import { IconGallery } from './IconGalleryServer';
import { InlineTOC } from './InlineTOC';
import { PlatformCodeBlock } from './PlatformCodeBlock';
import { PlatformTab, PlatformTabs } from './PlatformTabs';
import { StatusBadge } from './StatusBadge';
import { TokenTable } from './TokenTable';

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
