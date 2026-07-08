import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { HyperOSLogo } from '@/components/HyperOSLogo';
import { docsRoute, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <HyperOSLogo className="h-5" priority />,
      url: '/',
    },
    links: [
      {
        text: '文档',
        url: docsRoute,
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
