import { defaultFigmaUrl } from '@/lib/shared';

/** 链接待补全时用的占位 */
const TBD = '#';

/** HyperOS 3 / MIUIX 3.2 组件库 */
const os3FigmaUrl =
  'https://www.figma.com/design/rzAkMEjfZPGzSWwBICgFUt/MIUIX-3.2-%E7%BB%84%E4%BB%B6%E5%BA%93--6%E6%9C%884%E6%97%A5%E5%A4%87%E4%BB%BD-?node-id=30187-14500&t=mtG0Xeo0cRV2yQZs-11';

/** HyperOS 4 AI 组件库（测试版） */
const osAiFigmaUrl =
  'https://www.figma.com/design/FBvQ3xM5C62MgIcA1JHWIs/Xiaomi-Hyper-OS4-UI-Kit--Figma-UI-Kit-4.0-AI-%E6%B5%8B%E8%AF%95%E7%89%88?m=auto&t=a5Rq4JSlOnbmlrZY-6';

/** HyperOS Token Library */
const hyperosTokenUrl = 'https://hyperostoken.netlify.app/';

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
        name: '/ Design Tools /',
        description: '设计插件、协作、效率工具',
        href: TBD,
        external: true,
      },
      {
        name: '/ Design Token /',
        description: '小米 HyperOS Figma Variables / Token',
        href: hyperosTokenUrl,
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

const FONTS_PLACEHOLDER = '/resources/fonts-misans-card.jpg';
const ICON_PLACEHOLDER = '/resources/icon-card.jpg';
const BRAND_PLACEHOLDER = '/resources/brand-hyperos-card.jpg';

export const resourcesFeatured = [
  {
    id: 'os4',
    title: 'HyperOS4 Component',
    description: '当前主线产品界面设计的 Figma 组件库。',
    href: defaultFigmaUrl,
    external: true,
    pill: '打开 Figma',
    wide: true,
    image: '/resources/os4-card.jpg',
  },
  {
    id: 'os3',
    title: 'HyperOS3 Component',
    description: '3.0 版本的 HyperOS 组件库。',
    href: os3FigmaUrl,
    external: true,
    pill: '打开 Figma',
    image: '/resources/os3-card.jpg',
  },
  {
    id: 'os-ai',
    title: 'HyperOS AI Component',
    description: 'HyperOS AI 版本探索组件库。',
    href: osAiFigmaUrl,
    external: true,
    pill: '打开 Figma',
    image: '/resources/os-ai-card.jpg',
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
    name: 'Figma 材质插件',
    description: 'HyperOS 设计效率插件。',
    href: 'https://www.figma.com/community/plugin/1562763338973560719/hyperos4-material',
    external: true,
    image: '/resources/figma-plugin-card.jpg',
  },
  {
    name: 'Figma 图层语义化',
    description: '快速针对 Figma 图层进行 AI 语义化。',
    href: 'https://www.figma.com/community/plugin/1609411677451730178',
    external: true,
    image: '/resources/figma-semantics-card.jpg',
  },
  {
    name: 'Figma Token 检查',
    description: '快速检查 Figma 设计稿的规范性。',
    href: 'https://www.figma.com/community/plugin/1626427765938063447',
    external: true,
    image: '/resources/figma-lint-card.jpg',
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
        name: 'HyperOS Token Library',
        description: '小米 HyperOS Figma Variables / Token。',
        href: hyperosTokenUrl,
        external: true,
        image: '/resources/token-variables-card.jpg',
      },
      {
        name: 'Figma Token Plugin',
        description: 'Figma 内进行 Token 管理/替换的插件。',
        href: TBD,
        external: false,
        image: '/resources/token-docs-card.jpg',
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
