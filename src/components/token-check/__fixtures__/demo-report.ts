/**
 * 开发期演示报告：仅在非生产环境、URL 带 `?demo=1` 时由 page.tsx 动态加载。
 * 数据为虚构，但结构与数量级接近真实业务稿。
 */
import type {
  BindableProperty,
  CoverageStat,
  Exclusion,
  Finding,
  PropertyCategory,
  TokenCheckReport,
  Uncertain,
} from '@/lib/token-check/types';

const SETTINGS_KEY = 'Qm7xT2vLp9RkWc4HdN8aZe';
const NOTIFY_KEY = 'Yh3sB6uJf1GqMn5PtX0oCv';

function figmaUrl(fileKey: string, nodeId: string) {
  return `https://www.figma.com/design/${fileKey}/Demo?node-id=${nodeId.replace(':', '-')}`;
}

/** 同一图层路径复用同一个 nodeId，问题清单可按图层合并 */
const nodeIds = new Map<string, string>();
const nodeSeq: Record<string, number> = { [SETTINGS_KEY]: 100, [NOTIFY_KEY]: 200 };
const nodePrefix: Record<string, string> = { [SETTINGS_KEY]: '2041', [NOTIFY_KEY]: '3102' };

function nodeIdFor(fileKey: string, path: string[]) {
  const key = `${fileKey}|${path.join('/')}`;
  let id = nodeIds.get(key);
  if (!id) {
    nodeSeq[fileKey] += 7;
    id = `${nodePrefix[fileKey]}:${nodeSeq[fileKey]}`;
    nodeIds.set(key, id);
  }
  return id;
}

type IssueSeed = Omit<BindableProperty, 'nodeId' | 'nodeName' | 'figmaUrl' | 'targetIndex'> & {
  fileKey: string;
};

function issue(seed: IssueSeed): BindableProperty {
  const { fileKey, ...rest } = seed;
  const nodeId = nodeIdFor(fileKey, seed.path);
  return {
    ...rest,
    nodeId,
    nodeName: seed.path[seed.path.length - 1],
    figmaUrl: figmaUrl(fileKey, nodeId),
    targetIndex: fileKey === SETTINGS_KEY ? 0 : 1,
  };
}

const settingsRoot = '设置 · 我的设备';
const notifyRoot = '通知中心 · 卡片';

const featureToken = '1. feature token';
const radiusToken = 'Radius token';

const settingsRows = ['存储空间', '电池', '内存扩展', '系统更新', '设备名称', '处理器', '运行内存', '屏幕'];

const settingsIssues: BindableProperty[] = [
  ...settingsRows.flatMap((row, i) => {
    const titlePath = [settingsRoot, '列表', `列表项 / ${row}`, '标题'];
    const list: BindableProperty[] = [
      issue(
        i % 4 === 1
          ? {
              fileKey: SETTINGS_KEY,
              path: titlePath,
              category: 'text-color',
              field: 'fills[0]',
              state: 'legacy',
              value: '#000000 90%',
              token: { name: 'text/primary', kind: 'variable', collection: featureToken },
            }
          : {
              fileKey: SETTINGS_KEY,
              path: titlePath,
              category: 'text-color',
              field: 'fills[0]',
              state: i % 3 === 0 ? 'other' : 'unbound',
              value: i % 3 === 0 ? '#000000 90% · 本地变量 text/primary' : '#000000 90%',
            },
      ),
      issue({
        fileKey: SETTINGS_KEY,
        path: [settingsRoot, '列表', `列表项 / ${row}`, '副标题'],
        category: 'typography',
        field: 'text',
        state: 'unbound',
        value: 'MiSans Regular 13/18',
      }),
    ];
    if (i < 4) {
      list.push(
        issue({
          fileKey: SETTINGS_KEY,
          path: titlePath,
          category: 'typography',
          field: 'text',
          state: 'unbound',
          value: 'MiSans Medium 16/22',
        }),
        issue({
          fileKey: SETTINGS_KEY,
          path: [settingsRoot, '列表', `列表项 / ${row}`],
          category: 'spacing',
          field: 'paddingLeft',
          state: 'unbound',
          value: '24',
        }),
      );
    }
    return list;
  }),
  issue({
    fileKey: SETTINGS_KEY,
    path: [settingsRoot, '头部', '设备卡片'],
    category: 'fill',
    field: 'fills[0]',
    state: 'legacy',
    value: '#F7F7F7',
    token: { name: 'bg/card_secondary', kind: 'variable', collection: featureToken },
  }),
  issue({
    fileKey: SETTINGS_KEY,
    path: [settingsRoot, '头部', '设备卡片'],
    category: 'radius',
    field: 'cornerRadius',
    state: 'legacy',
    value: '20',
    token: { name: 'radius/card_large', kind: 'variable', collection: radiusToken },
  }),
  issue({
    fileKey: SETTINGS_KEY,
    path: [settingsRoot, '头部', '设备卡片'],
    category: 'spacing',
    field: 'paddingTop',
    state: 'unbound',
    value: '16',
  }),
  issue({
    fileKey: SETTINGS_KEY,
    path: [settingsRoot, '列表', '分割线'],
    category: 'stroke',
    field: 'strokes[0]',
    state: 'unbound',
    value: '#000000 8%',
  }),
  issue({
    fileKey: SETTINGS_KEY,
    path: [settingsRoot, '列表', '列表项 / 自动更新', '开关'],
    category: 'fill',
    field: 'fills[0]',
    state: 'unbound',
    value: '#3482FF',
    fromInstanceOverride: true,
  }),
  issue({
    fileKey: SETTINGS_KEY,
    path: [settingsRoot, '头部'],
    category: 'spacing',
    field: 'itemSpacing',
    state: 'unbound',
    value: '12',
  }),
];

const notifyIssues: BindableProperty[] = [
  ...['快递', '日程', '天气', '音乐', '打车', '外卖'].flatMap((card, i) => [
    issue({
      fileKey: NOTIFY_KEY,
      path: [notifyRoot, `卡片 / ${card}`, '卡片背景'],
      category: 'fill',
      field: 'fills[0]',
      state: i % 2 === 0 ? 'unbound' : 'other',
      value: i % 2 === 0 ? '#FFFFFF 80%' : '#FFFFFF 80% · 本地变量 card/bg',
    }),
    issue(
      i % 3 === 0
        ? {
            fileKey: NOTIFY_KEY,
            path: [notifyRoot, `卡片 / ${card}`],
            category: 'radius',
            field: 'cornerRadius',
            state: 'legacy',
            value: '24',
            token: { name: 'radius/card', kind: 'variable', collection: radiusToken },
          }
        : {
            fileKey: NOTIFY_KEY,
            path: [notifyRoot, `卡片 / ${card}`],
            category: 'radius',
            field: 'cornerRadius',
            state: 'unbound',
            value: '24',
          },
    ),
    issue({
      fileKey: NOTIFY_KEY,
      path: [notifyRoot, `卡片 / ${card}`],
      category: 'spacing',
      field: 'paddingLeft',
      state: 'unbound',
      value: '16',
    }),
    issue(
      i === 2
        ? {
            fileKey: NOTIFY_KEY,
            path: [notifyRoot, `卡片 / ${card}`, '头部', '时间'],
            category: 'text-color',
            field: 'fills[0]',
            state: 'legacy',
            value: '#8C8C8C',
            token: { name: 'text/tertiary', kind: 'variable', collection: featureToken },
          }
        : {
            fileKey: NOTIFY_KEY,
            path: [notifyRoot, `卡片 / ${card}`, '头部', '时间'],
            category: 'text-color',
            field: 'fills[0]',
            state: 'unbound',
            value: '#8C8C8C',
          },
    ),
  ]),
  issue({
    fileKey: NOTIFY_KEY,
    path: [notifyRoot, '卡片 / 快递', '内容', '进度条'],
    category: 'fill',
    field: 'fills[0]',
    state: 'unbound',
    value: 'Linear gradient #3482FF → #6EA6FF',
  }),
  issue({
    fileKey: NOTIFY_KEY,
    path: [notifyRoot, '卡片 / 打车', '操作', '操作按钮'],
    category: 'stroke',
    field: 'strokes[0]',
    state: 'unbound',
    value: '#000000 12%',
  }),
  issue({
    fileKey: NOTIFY_KEY,
    path: [notifyRoot, '卡片 / 打车', '操作', '操作按钮'],
    category: 'radius',
    field: 'cornerRadius',
    state: 'unbound',
    value: '16',
    fromInstanceOverride: true,
  }),
];

const issues = [...settingsIssues, ...notifyIssues];

/* ---------- 覆盖率：HyperOS 档为固定值，其余三档从 issues 统计，保证与问题清单一致 ---------- */

const categories: PropertyCategory[] = [
  'fill',
  'text-color',
  'stroke',
  'typography',
  'radius',
  'spacing',
];

/** 每个检查目标中已绑定 HyperOS Token 的属性数 */
const hyperosCounts: Record<PropertyCategory, number>[] = [
  { fill: 30, 'text-color': 24, stroke: 6, typography: 26, radius: 5, spacing: 16 },
  { fill: 22, 'text-color': 15, stroke: 4, typography: 16, radius: 4, spacing: 11 },
];

function stat(hyperos: number, scoped: BindableProperty[]): CoverageStat {
  const count = (state: BindableProperty['state']) => scoped.filter((i) => i.state === state).length;
  const legacy = count('legacy');
  const other = count('other');
  const unbound = count('unbound');
  const total = hyperos + legacy + other + unbound;
  return { total, hyperos, legacy, other, unbound, rate: total > 0 ? hyperos / total : null };
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

const targetCoverage = hyperosCounts.map((counts, t) =>
  stat(
    sum(categories.map((c) => counts[c])),
    issues.filter((i) => i.targetIndex === t),
  ),
);

const byCategory = Object.fromEntries(
  categories.map((c) => [
    c,
    stat(
      sum(hyperosCounts.map((counts) => counts[c])),
      issues.filter((i) => i.category === c),
    ),
  ]),
) as Record<PropertyCategory, CoverageStat>;

const overall = stat(
  sum(targetCoverage.map((s) => s.hyperos)),
  issues,
);

const tierReference = 3;
const tierComponent = 39;

const findings: Finding[] = [
  {
    checkId: 'reference-tier',
    severity: 'warning',
    nodeId: '2041:12',
    nodeName: '页面背景',
    path: [settingsRoot, '页面背景'],
    field: 'fills[0]',
    message: '直接绑定了 Reference 层 Token。业务稿应绑定 Semantic 或 Component 层 Token。',
    current: 'miuix_ref_color_gray_50',
    suggestion: 'miuix_sys_color_surface_container',
    confidence: 1,
    figmaUrl: figmaUrl(SETTINGS_KEY, '2041:12'),
  },
  {
    checkId: 'reference-tier',
    severity: 'warning',
    nodeId: '2041:58',
    nodeName: '徽标',
    path: [settingsRoot, '列表', '列表项 / 系统更新', '徽标'],
    field: 'fills[0]',
    message: '直接绑定了 Reference 层 Token。业务稿应绑定 Semantic 或 Component 层 Token。',
    current: 'miuix_ref_color_red_500',
    suggestion: 'miuix_sys_color_error',
    confidence: 1,
    figmaUrl: figmaUrl(SETTINGS_KEY, '2041:58'),
  },
  {
    checkId: 'reference-tier',
    severity: 'warning',
    nodeId: '3102:7',
    nodeName: '图标底板',
    path: [notifyRoot, '卡片 / 天气', '头部', '图标底板'],
    field: 'fills[0]',
    message: '直接绑定了 Reference 层 Token。业务稿应绑定 Semantic 或 Component 层 Token。',
    current: 'miuix_ref_color_blue_100',
    confidence: 1,
    figmaUrl: figmaUrl(NOTIFY_KEY, '3102:7'),
  },
];

const exclusions: Exclusion[] = [
  ...['导航栏', '搜索框', '列表项 / 自动更新', '底部按钮', '列表项 / 关于手机'].map((name, i) => ({
    nodeId: `2041:${900 + i}`,
    nodeName: name,
    path: [settingsRoot, name],
    reason: 'miuix-instance' as const,
    detail: `MIUIX 组件实例，主组件 key 命中 UI Kit（${['Navigation Bar', 'Search Bar', 'List Item / Switch', 'Button / Primary', 'List Item / Arrow'][i]}）`,
    nodeCount: [18, 9, 14, 6, 11][i],
    figmaUrl: figmaUrl(SETTINGS_KEY, `2041:${900 + i}`),
  })),
  {
    nodeId: '2041:950',
    nodeName: 'phone_illustration',
    path: [settingsRoot, '头部', '设备卡片', 'phone_illustration'],
    reason: 'illustration',
    detail: '名称包含 illus，且子树全部为矢量节点（23 个）',
    nodeCount: 24,
    figmaUrl: figmaUrl(SETTINGS_KEY, '2041:950'),
  },
  {
    nodeId: '3102:400',
    nodeName: '天气图标',
    path: [notifyRoot, '卡片 / 天气', '头部', '天气图标'],
    reason: 'illustration',
    detail: '设置了导出（exportSettings: SVG）',
    nodeCount: 5,
    figmaUrl: figmaUrl(NOTIFY_KEY, '3102:400'),
  },
  {
    nodeId: '3102:410',
    nodeName: '封面',
    path: [notifyRoot, '卡片 / 音乐', '内容', '封面'],
    reason: 'illustration',
    detail: '图层使用图片填充（IMAGE）',
    nodeCount: 1,
    figmaUrl: figmaUrl(NOTIFY_KEY, '3102:410'),
  },
  {
    nodeId: '2041:980',
    nodeName: '交互说明',
    path: [settingsRoot, '交互说明'],
    reason: 'annotation',
    detail: '名称命中标注规则（交互）',
    nodeCount: 12,
    figmaUrl: figmaUrl(SETTINGS_KEY, '2041:980'),
  },
  {
    nodeId: '2041:981',
    nodeName: '点击列表项进入二级页',
    path: [settingsRoot, '点击列表项进入二级页'],
    reason: 'annotation',
    detail: 'Section 的直接子级文字（画板外的说明）',
    nodeCount: 1,
    figmaUrl: figmaUrl(SETTINGS_KEY, '2041:981'),
  },
  {
    nodeId: '3102:500',
    nodeName: '旧版卡片',
    path: [notifyRoot, '旧版卡片'],
    reason: 'hidden',
    detail: 'visible: false',
    nodeCount: 31,
    figmaUrl: figmaUrl(NOTIFY_KEY, '3102:500'),
  },
];

const uncertain: Uncertain[] = [
  {
    nodeId: '3102:420',
    nodeName: '路线示意',
    path: [notifyRoot, '卡片 / 打车', '内容', '路线示意'],
    kind: 'possible-illustration',
    detail: '矢量节点占子树 82%，但包含 2 个文字图层',
    figmaUrl: figmaUrl(NOTIFY_KEY, '3102:420'),
  },
  {
    nodeId: '2041:990',
    nodeName: 'List Item / Arrow',
    path: [settingsRoot, '列表', 'List Item / Arrow'],
    kind: 'possible-detached-component',
    detail: '普通 Frame，名称与 MIUIX 组件「List Item / Arrow」完全一致',
    figmaUrl: figmaUrl(SETTINGS_KEY, '2041:990'),
  },
];

export const demoReport: TokenCheckReport = {
  generatedAt: '2026-11-09T14:20:00+08:00',
  library: { fileName: 'HyperOS Design Token', exportedAt: '2026-11-09T10:00:00+08:00' },
  targets: [
    {
      target: {
        url: figmaUrl(SETTINGS_KEY, '2041:1'),
        fileKey: SETTINGS_KEY,
        nodeId: '2041:1',
      },
      nodeName: settingsRoot,
      nodeType: 'SECTION',
      coverage: targetCoverage[0],
    },
    {
      target: {
        url: figmaUrl(NOTIFY_KEY, '3102:1'),
        fileKey: NOTIFY_KEY,
        nodeId: '3102:1',
      },
      nodeName: notifyRoot,
      nodeType: 'FRAME',
      coverage: targetCoverage[1],
    },
  ],
  coverage: {
    overall,
    byCategory,
    byTier: {
      reference: tierReference,
      semantic: overall.hyperos - tierReference - tierComponent,
      component: tierComponent,
    },
  },
  issues,
  exclusions,
  exclusionSummary: {
    'miuix-instance': { count: 5, nodeCount: 58 },
    illustration: { count: 3, nodeCount: 30 },
    annotation: { count: 2, nodeCount: 13 },
    hidden: { count: 1, nodeCount: 31 },
  },
  uncertain,
  findings,
  checksRun: ['reference-tier'],
  warnings: ['「通知中心 · 卡片」有 2 个混合文字样式的图层，第一期按主样式统计。'],
};
