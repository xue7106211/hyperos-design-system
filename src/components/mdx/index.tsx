import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { DosDonts } from './DosDonts';
import { FigmaEmbed } from './FigmaEmbed';
import { FigmaPrototypeEmbed } from './FigmaPrototypeEmbed';
import { InlineTOC } from './InlineTOC';
import { PlatformCodeBlock } from './PlatformCodeBlock';
import { PlatformTab, PlatformTabs } from './PlatformTabs';
import { StatusBadge } from './StatusBadge';
import { TokenTable } from './TokenTable';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    FigmaEmbed,
    FigmaPrototypeEmbed,
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
