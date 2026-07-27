import { defaultFigmaUrl } from '@/lib/shared';

/** 链接待补全时用的占位 */
const TBD = '#';

export const resourcesPage = {
  title: 'HyperOS Design Resources',
  /** Hero 副标题；同时供 metadata 使用 */
  description:
    '不断更新的设计资源库，包含图标、色彩、文字等丰富的资源，并提供多种效率组件，帮助快速准确地设计 HyperOS 应用',
  taughtByLabel: '维护团队',
  taughtByName: 'HyperOS 设计系统',
  taughtByHref: '/docs/os4',
} as const;

/** Hero 头像堆叠；有 src 时显示照片，否则显示 initials */
export type TeamAvatar = {
  name: string;
  initials: string;
  src?: string;
};

export const resourcesTeamAvatars: TeamAvatar[] = [
  { name: 'KIM HYUNJIN', initials: 'KH' },
  { name: '吴晨', initials: '晨' },
  { name: '冯晓洁', initials: '洁' },
  { name: '胡佳奇', initials: '胡' },
  { name: '薛一飞', initials: '薛' },
  { name: 'HyperOS', initials: 'H' },
];

export type CatalogItem = {
  name: string;
  description: string;
  href: string;
  external?: boolean;
  updatedAt?: string;
};

export type CatalogColumn = {
  title: string;
  items: CatalogItem[];
};

export const resourcesCatalog: CatalogColumn[] = [
  {
    title: '设计 Design',
    items: [
      {
        name: '/ OS4 Figma Library /',
        description: 'HyperOS 4 设计组件库',
        href: defaultFigmaUrl,
        external: true,
      },
      {
        name: '/ OS3 Figma Library /',
        description: 'HyperOS 3 历史版本组件库',
        href: TBD,
        external: true,
      },
      {
        name: '/ OS4 AI Figma Library /',
        description: 'OS4 存量业务组件与样式',
        href: TBD,
        external: true,
      },
      {
        name: '/ Design Tools /',
        description: '设计插件、协作、效率工具',
        href: TBD,
        external: true,
      },
      {
        name: '/ Design Token /',
        description: '小米 HyperOS Figma Variables / Token',
        href: TBD,
        external: true,
      },
      {
        name: '/ Materials /',
        description: '系统材质与玻璃效果',
        href: TBD,
        external: true,
      },
      {
        name: '/ Fonts /',
        description: '品牌与界面字体资源',
        href: TBD,
        external: true,
      },
      {
        name: '/ ICON /',
        description: '图标库预览与 SVG',
        href: '/docs/os4/resources/icons',
        external: false,
      },
      {
        name: '/ Brand /',
        description: '品牌标识与视觉规范',
        href: TBD,
        external: true,
      },
    ],
  },
  {
    title: '工程 Engineering',
    items: [
      {
        name: '{ MIUIX Flutter }',
        description: 'Flutter 端 MIUIX 组件库',
        href: TBD,
        external: true,
      },
      {
        name: '{ MIUIX Java }',
        description: 'Android / Java 端 MIUIX',
        href: TBD,
        external: true,
      },
    ],
  },
];

const CARD_PLACEHOLDER = '/resources/card-placeholder.png';
const TOOLS_PLACEHOLDER = '/resources/tools-placeholder.png';
const TOKEN_PLACEHOLDER = '/resources/token-placeholder.png';
const FONTS_PLACEHOLDER = '/resources/fonts-card.jpg';
const ICON_PLACEHOLDER = '/resources/icon-card.jpg';
const BRAND_PLACEHOLDER = '/resources/brand-card.jpg';

export const resourcesFeatured = [
  {
    id: 'os4',
    title: 'OS4 组件库',
    description: '当前主线产品界面设计的 Figma UI Kit。',
    href: defaultFigmaUrl,
    external: true,
    pill: '打开 Figma',
    wide: true,
    image: '/home/hyperos-ui-kit-4.png',
  },
  {
    id: 'tokens',
    title: 'Design Token',
    description: 'Figma Variables / Token 导出入口。',
    href: TBD,
    external: true,
    pill: '打开 Token',
    image: CARD_PLACEHOLDER,
  },
  {
    id: 'miuix',
    title: 'MIUIX Flutter',
    description: 'Flutter 端组件库，工程落地入口。',
    href: TBD,
    external: true,
    pill: '打开仓库',
    image: CARD_PLACEHOLDER,
  },
] as const;

/** 设计工具区：插件 / 协作 / 效率入口 */
export type ToolItem = {
  name: string;
  description: string;
  href: string;
  external?: boolean;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
};

export const resourcesTools: ToolItem[] = [
  {
    name: 'Figma 插件',
    description: 'HyperOS 设计效率插件（待补充链接）。',
    href: TBD,
    external: true,
    image: TOOLS_PLACEHOLDER,
  },
  {
    name: '协作与评审',
    description: '设计协作、标注与评审相关工具。',
    href: TBD,
    external: true,
    image: TOOLS_PLACEHOLDER,
  },
  {
    name: '效率组件',
    description: '快速搭建界面的效率型资源与模板。',
    href: TBD,
    external: true,
    image: TOOLS_PLACEHOLDER,
  },
];

/** Components 下方专题区：Design Token / Fonts / Icon / Brand */
export type TopicSection = {
  id: string;
  title: string;
  description: string;
  items: ToolItem[];
};

export const resourcesTopics: TopicSection[] = [
  {
    id: 'design-token',
    title: 'Design Token',
    description: 'Figma Variables 与 Token 导出入口，统一色彩、间距与圆角。',
    items: [
      {
        name: 'Figma Variables',
        description: '小米 HyperOS Figma Variables / Token。',
        href: TBD,
        external: true,
        image: TOKEN_PLACEHOLDER,
      },
      {
        name: 'Token 文档',
        description: '站内 TokenTable 与语义说明。',
        href: TBD,
        external: false,
        image: TOKEN_PLACEHOLDER,
      },
    ],
  },
  {
    id: 'fonts',
    title: 'Fonts',
    description: '品牌与界面字体资源，保证多端排版一致。',
    items: [
      {
        name: 'MiSans',
        description: '品牌与界面字体资源（待补充下载）。',
        href: TBD,
        external: true,
        image: FONTS_PLACEHOLDER,
        imageWidth: 1024,
        imageHeight: 576,
      },
    ],
  },
  {
    id: 'icon',
    title: 'Icon',
    description: '图标库预览、复制名称与 SVG。',
    items: [
      {
        name: 'HyperOS 图标库',
        description: '分类浏览、复制名称与 SVG。',
        href: '/docs/os4/resources/icons',
        external: false,
        image: ICON_PLACEHOLDER,
        imageWidth: 1024,
        imageHeight: 576,
      },
    ],
  },
  {
    id: 'brand',
    title: 'Brand',
    description: '品牌标识与视觉规范。',
    items: [
      {
        name: 'Brand Guidelines',
        description: '品牌标识与视觉规范（待补充）。',
        href: TBD,
        external: true,
        image: BRAND_PLACEHOLDER,
        imageWidth: 1024,
        imageHeight: 576,
      },
    ],
  },
];
