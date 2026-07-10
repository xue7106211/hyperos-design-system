import type { TinaField } from 'tinacms';
import { mdxBlockTemplates } from './blocks';

export const docFrontmatterFields: TinaField[] = [
  {
    type: 'string',
    name: 'title',
    label: '标题',
    isTitle: true,
    required: true,
  },
  {
    type: 'string',
    name: 'description',
    label: '描述',
    ui: { component: 'textarea' },
  },
  {
    type: 'string',
    name: 'maintainer',
    label: '维护人',
    description: '缺省展示为「HyperOS 设计系统团队」',
  },
  {
    type: 'string',
    name: 'maintainerOpenId',
    label: '维护人飞书 Open ID',
    description:
      '填写后点击维护人会通过 AppLink 打开飞书单聊（ou_ 开头）。团队名等非个人维护人请留空。',
  },
  {
    type: 'string',
    name: 'status',
    label: '状态',
    options: [
      { label: 'Stable', value: 'stable' },
      { label: 'Beta', value: 'beta' },
      { label: 'Deprecated', value: 'deprecated' },
    ],
  },
  {
    type: 'string',
    name: 'platforms',
    label: '支持平台',
    list: true,
    options: [
      { label: 'Android', value: 'android' },
      { label: 'iOS', value: 'ios' },
      { label: 'Pad', value: 'pad' },
    ],
  },
  {
    type: 'string',
    name: 'figmaFileKey',
    label: 'Figma File Key',
  },
  {
    type: 'string',
    name: 'figmaNodeId',
    label: 'Figma Node ID',
  },
  {
    type: 'string',
    name: 'figmaPrototypeUrl',
    label: 'Figma Prototype URL',
  },
  {
    type: 'string',
    name: 'tokenGroups',
    label: 'Token Groups',
    list: true,
  },
];

export const docBodyField: TinaField = {
  type: 'rich-text',
  name: 'body',
  label: '正文',
  isBody: true,
  templates: mdxBlockTemplates,
};

function docsRouter({ document }: { document: { _sys: { relativePath: string } } }) {
  const slug = document._sys.relativePath.replace(/\.mdx?$/, '');
  return `/docs/${slug}`;
}

export function createDocsCollection(options: {
  name: string;
  label: string;
  match: { include: string };
}) {
  return {
    name: options.name,
    label: options.label,
    path: 'content/docs',
    format: 'mdx' as const,
    match: options.match,
    fields: [...docFrontmatterFields, docBodyField],
    ui: {
      router: docsRouter,
    },
  };
}
