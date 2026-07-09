import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { SiGitlab } from '@icons-pack/react-simple-icons';
import { HyperOSLogo } from '@/components/HyperOSLogo';
import { docsRoute, gitRepoUrl } from './shared';

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
      {
        type: 'icon',
        url: gitRepoUrl,
        text: 'GitLab',
        label: 'GitLab',
        icon: <SiGitlab />,
        external: true,
      },
    ],
  };
}
