import { source } from '@/lib/source';
import { getDocsVersionTabs } from '@/lib/docs-version-tabs';
import { DocsVersionSwitcher } from '@/components/docs/DocsVersionSwitcher';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  const tree = source.getPageTree();
  const tabs = getDocsVersionTabs(tree);

  return (
    <DocsLayout
      tree={tree}
      tabs={false}
      sidebar={{ banner: <DocsVersionSwitcher tabs={tabs} /> }}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  );
}
