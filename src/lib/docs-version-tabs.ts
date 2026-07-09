import type { LayoutTab } from 'fumadocs-ui/layouts/shared';
import { getLayoutTabs } from 'fumadocs-ui/layouts/shared';
import type { Root } from 'fumadocs-core/page-tree';
import { docsRoute, docsVersions } from './shared';

const os5Version = docsVersions.find((version) => version.id === 'os5');

function isOs5Tab(tab: LayoutTab) {
  return tab.url === `${docsRoute}/os5` || tab.url.startsWith(`${docsRoute}/os5/`);
}

function stripTabIcon(tab: LayoutTab): LayoutTab {
  return { ...tab, icon: undefined };
}

function disableOs5Tab(tab: LayoutTab): LayoutTab {
  return {
    ...stripTabIcon(tab),
    description: os5Version?.description ?? '内容暂未发布，敬请期待',
    props: {
      'aria-disabled': true,
      tabIndex: -1,
      className:
        'pointer-events-none cursor-not-allowed opacity-50 hover:bg-transparent hover:text-inherit',
    },
  };
}

export function getDocsVersionTabs(tree: Root): LayoutTab[] {
  return getLayoutTabs(tree, {
    transform: (tab) => (isOs5Tab(tab) ? disableOs5Tab(tab) : stripTabIcon(tab)),
  });
}
