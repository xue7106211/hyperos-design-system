export const appName = 'HyperOS 设计系统';
export const appShortTitle = 'HyperOS 设计系统';
export const appDescription =
  'Xiaomi HyperOS设计规范自2014年开始不断成长迭代，希望能够为小米旗下的各个软/硬件，提供一套由一代代设计师不断磨砺后，经得起推敲的设计资产';

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

/** 文档站默认 Figma 组件库（无页级 figmaFileKey 时的「跳转 Figma」回退） */
export const defaultFigmaUrl =
  'https://www.figma.com/design/7PVSm4yEbknNLFaqauI4EM/Xiaomi-Hyper-OS4-UI-Kit?m=auto&node-id=78009-160479&t=T6yLwmMb0OkdPfNK-1';

export const defaultFigmaLibrary = {
  fileKey: '7PVSm4yEbknNLFaqauI4EM',
  fileName: 'Xiaomi-Hyper-OS4-UI-Kit',
  nodeId: '78009-160479',
} as const;

export function buildFigmaDesignUrl(options: {
  fileKey: string;
  fileName?: string;
  nodeId?: string;
}): string {
  const name = options.fileName ?? 'design';
  const url = new URL(`https://www.figma.com/design/${options.fileKey}/${name}`);
  if (options.nodeId) {
    url.searchParams.set('node-id', options.nodeId.replaceAll(':', '-'));
  }
  return url.toString();
}

export function resolvePageFigmaUrl(page: {
  figmaFileKey?: string;
  figmaNodeId?: string;
  figmaPrototypeUrl?: string;
}): string {
  if (page.figmaPrototypeUrl) return page.figmaPrototypeUrl;
  if (page.figmaFileKey) {
    return buildFigmaDesignUrl({
      fileKey: page.figmaFileKey,
      nodeId: page.figmaNodeId,
    });
  }
  return defaultFigmaUrl;
}
