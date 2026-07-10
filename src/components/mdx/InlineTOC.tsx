'use client';

import { InlineTOC as FumadocsInlineTOC } from 'fumadocs-ui/components/inline-toc';
import { useTOCItems } from 'fumadocs-ui/components/toc';
import type { ComponentProps } from 'react';

type InlineTOCProps = Omit<ComponentProps<typeof FumadocsInlineTOC>, 'items'> & {
  items?: ComponentProps<typeof FumadocsInlineTOC>['items'];
};

/**
 * MDX-friendly Inline TOC: reads items from DocsPage TOC context when not passed.
 */
export function InlineTOC({ items, children = '目录', ...props }: InlineTOCProps) {
  const contextItems = useTOCItems();
  return (
    <FumadocsInlineTOC items={items ?? contextItems} {...props}>
      {children}
    </FumadocsInlineTOC>
  );
}
