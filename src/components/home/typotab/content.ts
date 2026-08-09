import { defaultDocsRoute, defaultFigmaUrl } from '@/lib/shared';

/**
 * HyperOS 首页文案（形式仍沿用 TypoTab 布局）。
 * 能力映射 A：设计规范 / 组件 / Token / 图标 / 多端 / 资源
 * 配图与视频暂留形式资产，后续再换 HyperOS 媒体。
 */

export const typoHero = {
  badge: 'HyperOS 4 规范已上线',
  badgeHref: defaultDocsRoute,
  /** 两行展示：品牌名+版本同行，副标另起一行 */
  titleLine1: 'Xiaomi HyperOS 4',
  titleLine2: '生命感美学',
  subtitle:
    '在 HyperOS4 中，我们希望能营造一个有温度的数字空间，为你提供更自然、生动、精致的生命感新体验。',
  cta: '浏览设计规范',
  ctaHref: `${defaultDocsRoute}/general`,
  demoSrc: '/home/hero-devices-v2.jpg',
  demoAlt: 'HyperOS 设计系统多机界面预览',
} as const;

export const typoValueProp = {
  title: '设计语言与资源',
  subtitle: '围绕生命感，重塑 HyperOS，持续打造和谐美学',
  cards: [
    {
      title: '设计规范',
      body: '通用设计标准与写法约定，统一视\u2060觉与体验底线。',
      image: '/home/value-guidelines.jpg',
      imageAlt: '设计规范入口示意',
      href: `${defaultDocsRoute}/general`,
      variant: 'menu' as const,
    },
    {
      title: '控件与组件',
      body: '导航、操作、输入、容器，对照 Figma 与平台代码。',
      image: '/home/value-components.jpg',
      imageAlt: 'HyperOS 控件与组件界面示意',
      href: `${defaultDocsRoute}/components`,
      variant: 'menu' as const,
    },
    {
      title: 'Design Token',
      body: '语义色、间距与组件 Token，Light / Dark 一并查阅。',
      image: '/typotab/images/settings-card.png',
      imageAlt: 'Token 示意',
      href: `${defaultDocsRoute}/general/design-token`,
      variant: 'settings' as const,
    },
    {
      title: '图标资产',
      body: '分类预览、搜索与复制，接入 HyperOS 图标资产。',
      image: '/typotab/images/menubar-menu.png',
      imageAlt: '图标库示意',
      href: `${defaultDocsRoute}/resources/icons`,
      variant: 'menubar' as const,
    },
  ],
} as const;

export const typoShortcuts = {
  title: '更快找到你要的规范',
  subtitle: '全文搜索与侧栏信息架构，让组件与 Token 一键可达。',
  keyboardSrc: '/typotab/images/mac-keyboard.png',
  keyboardAlt: '快捷检索示意',
  cycle: ['输入组件名…', '定位规范页…', '已打开文档'] as const,
  cycleKeys: ['/', '/', '✓'] as const,
} as const;

export const typoUseCases = {
  title: '多终端设计体验',
  subtitle: '在同一套系统里覆盖设备差异、交付资产与落地实践。',
  cards: [
    {
      title: '多端设备标准',
      body: '手机、Pad 等多端场景下的布局、适配与一致性约定。',
      color: '#00A1FF',
      video: '/typotab/videos/usecase-studies.mp4',
      poster: '/typotab/images/usecase-studies-poster.png',
      href: `${defaultDocsRoute}/multi-device`,
    },
    {
      title: '设计资源中心',
      body: 'Figma、Token、字体与品牌物料集中入口，减少到处找文件。',
      color: '#AD6DFF',
      video: '/typotab/videos/usecase-ideas.mp4',
      poster: '/typotab/images/usecase-ideas-poster.png',
      href: '/resources',
    },
    {
      title: '应用最佳实践',
      body: '把规范落到真实产品流程：标注、走查与协作建议。',
      color: '#FF7300',
      video: '/typotab/videos/usecase-proposal.mp4',
      poster: '/typotab/images/usecase-proposal-poster.png',
      href: `${defaultDocsRoute}/best-practices`,
    },
  ],
} as const;

export const typoApps = {
  title: '多场景设计最佳实践',
  subtitle:
    '根据你的应用场景，获取最佳界面适配方法与样式设计。',
  logos: [
    'google-docs',
    'word',
    'gmail',
    'slack',
    'outlook',
    'whatsapp',
    'notion',
    'mail',
    'discord',
    'teams',
    'chrome',
    'safari',
    'linkedin',
    'x',
    'facebook',
    'vscode',
    'reddit',
    'zoom',
    'google-chat',
    'trello',
    'asana',
    'linear',
    'intercom',
    'telegram',
  ] as const,
  menuItems: [
    { label: '设计规范', shortcut: 'G', href: `${defaultDocsRoute}/general` },
    {
      label: '系统组件',
      shortcut: 'C',
      href: `${defaultDocsRoute}/components`,
    },
    {
      label: 'Design Token',
      shortcut: 'T',
      href: `${defaultDocsRoute}/general/design-token`,
    },
    {
      label: '图标库',
      shortcut: 'I',
      href: `${defaultDocsRoute}/resources/icons`,
    },
  ],
  searchPlaceholder: '搜索规范与组件',
} as const;

/** 原 Pricing 双卡形式 → 双入口（非售卖） */
export const typoPricing = {
  title: '选一个入口开始',
  subtitle: '无论你先读规范，还是先拿设计资产，都能接到同一套 HyperOS 系统。',
  plans: [
    {
      name: '设计指南',
      tagline: '从通用标准读到组件细节',
      price: 'OS4',
      period: '当前版本',
      note: 'HyperOS 4 为默认文档版本，OS5 即将开放。',
      cta: '进入文档',
      ctaHref: `${defaultDocsRoute}/general`,
      color: '#0095FF',
      features: ['通用设计标准', '控件与组件', '人机交互与系统能力'],
      badge: null as string | null,
    },
    {
      name: '设计资源',
      tagline: 'Figma、Token、图标一站取用',
      price: 'Hub',
      period: '资源中心',
      note: '面向设计与工程的可下载、可嵌入资产。',
      cta: '打开资源',
      ctaHref: '/resources',
      color: '#00CE44',
      features: [
        'Figma UI Kit',
        'Design Token',
        '图标库预览',
        '字体与品牌物料',
        '设计工具索引',
      ],
      badge: '推荐收藏',
    },
  ],
} as const;

export const typoFaq = {
  title: '常见问题',
  contactPrefix: '更多问题可查阅文档，或联系',
  contactLabel: '设计系统团队',
  contactHref: `${defaultDocsRoute}`,
  items: [
    {
      question: '这个站点是什么？和组件库仓库是什么关系？',
      answer:
        '这里是 HyperOS 移动端设计系统的文档站，用于传播规范、Figma、Token 与图标。客户端组件源码在独立工程仓库维护，本站提供对照与引用，不运行 Web 组件 Demo。',
    },
    {
      question: '设计规范、Token 和图标分别在哪里？',
      answer:
        '设计规范在「通用设计标准」与「控件与组件」；Token 可在文档中的 TokenTable 或 Token 相关页查看；图标库在「资源 → HyperOS 图标库」，也可从设计资源中心进入。',
    },
    {
      question: '如何对照 Android / iOS 实现？',
      answer:
        '组件文档页提供 PlatformTabs，展示 Compose / SwiftUI 等静态代码参考，便于设计与工程对齐，而非在本站运行原生组件。',
    },
    {
      question: 'HyperOS 5 什么时候可用？',
      answer:
        'OS5 已在版本切换中占位，内容尚未发布。当前请以 HyperOS 4（默认）为准；发布后会开放侧栏跳转并更新首页入口。',
    },
  ],
} as const;

/** 供双入口卡「设计资源」外链 Figma 时复用 */
export const typoFigmaUrl = defaultFigmaUrl;
