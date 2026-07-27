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

export const resourcesFeatured = [
  {
    id: 'os4',
    title: 'OS4 组件库',
    description: '当前主线产品界面设计的 Figma UI Kit。',
    href: defaultFigmaUrl,
    external: true,
    pill: '打开 Figma',
  },
  {
    id: 'icons',
    title: 'HyperOS 图标库',
    description: '站内预览、复制名称与 SVG。',
    href: '/docs/os4/resources/icons',
    external: false,
    pill: '查看图标',
  },
  {
    id: 'tokens',
    title: 'Design Token',
    description: 'Figma Variables / Token 导出入口。',
    href: TBD,
    external: true,
    pill: '打开 Token',
  },
  {
    id: 'miuix',
    title: 'MIUIX Flutter',
    description: 'Flutter 端组件库，工程落地入口。',
    href: TBD,
    external: true,
    pill: '打开仓库',
  },
] as const;

export type FaqItem = { question: string; answer: string };

export type FaqGroup = { title: string; items: FaqItem[] };

export const resourcesFaq: FaqGroup[] = [
  {
    title: '使用',
    items: [
      {
        question: 'OS4、OS3、OS4存量有什么区别？',
        answer:
          'OS4 是当前主线组件库；OS3 用于历史版本对照与维护；OS4存量面向仍在使用旧资产的业务线。新项目默认使用 OS4。',
      },
      {
        question: 'Design Token 为什么是外链？',
        answer:
          'Token 的真源在 Figma Variables / 导出包中维护。文档站提供规范说明与 TokenTable 展示，完整变量集通过外链获取。',
      },
      {
        question: '图标可以在站内直接用吗？',
        answer:
          '可以。打开「HyperOS 图标库」即可分类浏览、复制名称与 SVG；也支持跳转对应 Figma 节点。',
      },
    ],
  },
  {
    title: '工程',
    items: [
      {
        question: 'MIUIX 和文档站是什么关系？',
        answer:
          '文档站传播设计规范与资产入口；MIUIX（Flutter / Java）是客户端组件实现仓库。两者配合使用，本站不承载可运行组件 demo。',
      },
      {
        question: '链接显示「待补充」怎么办？',
        answer:
          '表示该资源地址尚未录入。可联系 HyperOS 设计系统团队获取临时入口，我们会持续补齐。',
      },
    ],
  },
  {
    title: '帮助',
    items: [
      {
        question: '找不到你需要的资源？',
        answer:
          '请通过飞书联系页面维护人，或在文档站对应组件页留言需求。我们会评估是否纳入资源中心。',
      },
    ],
  },
];
