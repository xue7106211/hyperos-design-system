import type { Template } from 'tinacms';

export const statusBadgeBlock: Template = {
  name: 'StatusBadge',
  label: '状态标签',
  fields: [
    {
      type: 'string',
      name: 'status',
      label: 'Status',
      required: true,
      options: [
        { label: 'Stable', value: 'stable' },
        { label: 'Beta', value: 'beta' },
        { label: 'Deprecated', value: 'deprecated' },
      ],
    },
  ],
};

export const figmaEmbedBlock: Template = {
  name: 'FigmaEmbed',
  label: 'Figma 设计稿',
  fields: [
    {
      type: 'string',
      name: 'fileKey',
      label: 'File Key',
      required: true,
    },
    {
      type: 'string',
      name: 'nodeId',
      label: 'Node ID',
    },
    {
      type: 'string',
      name: 'mode',
      label: 'Mode',
      options: [
        { label: 'Design', value: 'design' },
        { label: 'Dev Mode', value: 'dev' },
      ],
    },
    {
      type: 'number',
      name: 'height',
      label: 'Height (px)',
    },
    {
      type: 'string',
      name: 'theme',
      label: 'Theme',
      options: [
        { label: 'System', value: 'system' },
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
    },
  ],
};

export const figmaPrototypeEmbedBlock: Template = {
  name: 'FigmaPrototypeEmbed',
  label: 'Figma 原型',
  fields: [
    {
      type: 'string',
      name: 'url',
      label: 'Embed URL',
    },
    {
      type: 'string',
      name: 'fileKey',
      label: 'File Key',
    },
    {
      type: 'string',
      name: 'nodeId',
      label: 'Node ID',
    },
    {
      type: 'number',
      name: 'height',
      label: 'Height (px)',
    },
  ],
};

export const tokenTableBlock: Template = {
  name: 'TokenTable',
  label: 'Design Token 表格',
  fields: [
    {
      type: 'string',
      name: 'groups',
      label: 'Token Groups',
      description:
        '过滤前缀，例如 semantic.bg、component.navigation、reference.solid.white',
      list: true,
    },
  ],
};

export const iconGalleryBlock: Template = {
  name: 'IconGallery',
  label: '图标预览',
  fields: [
    {
      type: 'string',
      name: 'categories',
      label: 'Categories',
      description: '可选；留空显示全部分类。例如 navigation、action',
      list: true,
    },
  ],
};

export const dosDontsBlock: Template = {
  name: 'DosDonts',
  label: '推荐 / 避免',
  fields: [
    {
      type: 'string',
      name: 'doTitle',
      label: '推荐标题',
    },
    {
      type: 'string',
      name: 'dontTitle',
      label: '避免标题',
    },
    {
      type: 'string',
      name: 'doContent',
      label: '推荐内容（每行一条）',
      ui: { component: 'textarea' },
    },
    {
      type: 'string',
      name: 'dontContent',
      label: '避免内容（每行一条）',
      ui: { component: 'textarea' },
    },
  ],
};

export const platformCodeBlock: Template = {
  name: 'PlatformCodeBlock',
  label: '平台代码参考',
  fields: [
    {
      type: 'string',
      name: 'androidTitle',
      label: 'Android 标题',
    },
    {
      type: 'string',
      name: 'androidCode',
      label: 'Android 代码',
      ui: { component: 'textarea' },
    },
    {
      type: 'string',
      name: 'iosTitle',
      label: 'iOS 标题',
    },
    {
      type: 'string',
      name: 'iosCode',
      label: 'iOS 代码',
      ui: { component: 'textarea' },
    },
  ],
};

export const mdxBlockTemplates: Template[] = [
  statusBadgeBlock,
  figmaEmbedBlock,
  figmaPrototypeEmbedBlock,
  tokenTableBlock,
  iconGalleryBlock,
  dosDontsBlock,
  platformCodeBlock,
];
