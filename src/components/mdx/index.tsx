import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { DosDonts } from './DosDonts';
import { FigmaEmbed } from './FigmaEmbed';
import { FigmaPrototypeEmbed } from './FigmaPrototypeEmbed';
import { PlatformTab, PlatformTabs } from './PlatformTabs';
import { StatusBadge } from './StatusBadge';
import { TokenTable } from './TokenTable';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    FigmaEmbed,
    FigmaPrototypeEmbed,
    PlatformTabs,
    PlatformTab,
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
