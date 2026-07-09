export const appName = 'HyperOS Design System';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const docsVersions = [
  { id: 'os4', title: 'HyperOS 4', description: 'OS4 设计规范与组件文档' },
  {
    id: 'os5',
    title: 'HyperOS 5',
    description: '内容暂未发布，敬请期待',
    disabled: true,
  },
] as const;

export type DocsVersionId = (typeof docsVersions)[number]['id'];

export const defaultDocsVersion: DocsVersionId = 'os4';

export const defaultDocsRoute = `${docsRoute}/${defaultDocsVersion}`;

export const gitConfig = {
  host: 'https://git.n.xiaomi.com',
  user: 'xueyifei1',
  repo: 'hyperos-design-system',
  branch: 'main',
};

export const gitRepoUrl = `${gitConfig.host}/${gitConfig.user}/${gitConfig.repo}`;
