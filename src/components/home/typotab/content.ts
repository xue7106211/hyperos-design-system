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
  /** 静图封面（LCP / reduced-motion） */
  demoPoster: '/home/hero-devices-poster.jpg',
  demoVideoMp4: '/home/hero-devices.mp4',
  demoVideoWebm: '/home/hero-devices.webm',
  demoAlt: 'HyperOS 设计系统多机界面预览',
  demoWidth: 1920,
  demoHeight: 1080,
} as const;

/** 设计语言宣言：放在「设计指南」之上 */
export const typoDesignLanguage = {
  title: '设计语言再次进化',
  subtitle: '围绕生命感，重塑 HyperOS，持续打造和谐美学',
  cards: [
    {
      title: '柔光玻璃',
      body: '将材质视作独立界面物质,统一整合其光学行为、空间属性与交互响应能力，系统化地模拟光线的传播与反射，构建兼具通透性与层次感的数字物质。',
      tone: 'quiet' as const,
      image: '/home/value-soft-glass-v2.jpg',
      imageAlt: 'HyperOS 柔光玻璃：锁屏音乐控件材质示意',
      href: `${defaultDocsRoute}/general/philosophy`,
    },
    {
      title: '全新设计组件',
      body: '打造更多沉浸光感组件，系统化地应用于核心界面的互动区域,通过材质表达、交互响应与自适应机制的整合，重塑体验范式。',
      tone: 'quiet' as const,
      image: '/home/value-new-components-v3.jpg',
      imageAlt: 'HyperOS 光感设计组件：笔记、旅程与设备控件示意',
      href: `${defaultDocsRoute}/components`,
    },
  ],
} as const;

/**
 * 设计指南：原「设计规范与资产」+ 原「多终端与系统特性」入口融合。
 */
export const typoValueProp = {
  title: '设计指南',
  subtitle:
    '了解最新 HyperOS 设计动态，系统特性与能力，打造和谐流畅生态体验。',
  cards: [
    {
      title: '通用设计标准',
      body: '通用设计标准与写法约定，统一视\u2060觉与体验底线。',
      image: '/home/value-guidelines.jpg',
      imageAlt: '设计规范入口示意',
      href: `${defaultDocsRoute}/general`,
      variant: 'menu' as const,
    },
    {
      title: '控件设计规范',
      body: '导航、操作、输入、容器，对照 Figma 与平台代码。',
      image: '/home/value-components-v2.jpg',
      imageAlt: 'HyperOS 天气、时钟与日程小组件示意',
      href: `${defaultDocsRoute}/components`,
      variant: 'menu' as const,
    },
    {
      title: '多端设备标准',
      body: '手机、Pad 等多端场景下的布局、适配与一致性约定。',
      image: '/home/usecase-multi-device.jpg',
      imageAlt: 'HyperOS 折叠屏外屏与分屏多端界面示意',
      href: `${defaultDocsRoute}/multi-device`,
    },
    {
      title: '人机交互标准',
      body: 'HyperOS 人机交互标准。',
      image: '/home/usecase-resources.jpg',
      imageAlt: 'HyperOS 锁屏个性化与时钟样式示意',
      href: `${defaultDocsRoute}/interaction`,
    },
    {
      title: '系统特性与能力',
      body: 'HyperOS 系统特性与能力标准总览。',
      image: '/home/usecase-best-practices.jpg',
      imageAlt: 'HyperOS 桌面小组件与日历界面示意',
      href: `${defaultDocsRoute}/system`,
    },
    {
      title: '设计变量',
      body: '语义色、间距与组件 Token，Light / Dark 一并查阅。',
      image: '/home/value-token-v3.jpg',
      imageAlt: 'Design Token 层级：Value → Base → Semantic → Component',
      href: `${defaultDocsRoute}/general/design-token`,
      variant: 'settings' as const,
    },
    {
      title: '图标资产',
      body: '分类预览、搜索与复制，接入 HyperOS 图标资产。',
      image: '/home/value-icons-v2.jpg',
      imageAlt: 'HyperOS 图标资产网格示意',
      href: `${defaultDocsRoute}/resources/icons`,
      variant: 'menubar' as const,
    },
  ],
} as const;

export const typoRecentUpdates = {
  title: '最新设计动态',
  subtitle: '跟进设计系统最新入库的规范、组件与资产变更。',
  moreHref: `${defaultDocsRoute}#最近更新`,
  moreLabel: '查看全部更新',
} as const;

export const typoApps = {
  title: '多场景设计最佳实践',
  subtitle:
    '根据你的应用场景，获取最佳界面适配方法与样式设计。',
  /** HyperOS 系统应用图标（public/home/app-icons）；外圈只用前若干枚控制密度 */
  logos: [
    'weather',
    'clock',
    'calendar',
    'camera',
    'gallery',
    'phone',
    'sms',
    'contacts',
    'notes',
    'browser',
    'settings',
    'files',
    'music',
    'mi-video',
    'app-store',
    'game-center',
    'mijia',
    'xiaoai',
    'themes',
    'security',
    'wallet',
    'email',
    'recorder',
    'calculator',
    // 内圈补充
    'compass',
    'downloads',
    'find-device',
    'mi-create',
    'remote',
    'feedback',
    'xiaoai-vision',
    'global-internet',
  ] as const,
  /** 外圈约 24 个；内圈用剩余图标 */
  outerLogoCount: 24,
  logoBasePath: '/home/app-icons',
  menuItems: [
    { label: '影音娱乐', href: `${defaultDocsRoute}/best-practices` },
    { label: '效率工具', href: `${defaultDocsRoute}/best-practices` },
    { label: '生活服务', href: `${defaultDocsRoute}/best-practices` },
    { label: '智能家居', href: `${defaultDocsRoute}/best-practices` },
    { label: '社交通讯', href: `${defaultDocsRoute}/best-practices` },
    { label: '金融支付', href: `${defaultDocsRoute}/best-practices` },
    { label: '出行导航', href: `${defaultDocsRoute}/best-practices` },
    { label: '健康运动', href: `${defaultDocsRoute}/best-practices` },
  ],
  searchPlaceholder: '按业务场景查找实践',
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
