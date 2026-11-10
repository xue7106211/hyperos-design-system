import type {
  BindingState,
  ExclusionReason,
  FindingSeverity,
  PropertyCategory,
  TokenCheckErrorCode,
  TokenTier,
  Uncertain,
} from '@/lib/token-check/types';

/** 报告中类别的固定展示顺序 */
export const categoryOrder: PropertyCategory[] = [
  'fill',
  'text-color',
  'stroke',
  'typography',
  'radius',
  'spacing',
];

export const categoryLabels: Record<PropertyCategory, string> = {
  fill: '填充',
  'text-color': '文字颜色',
  stroke: '描边',
  typography: '文字样式',
  radius: '圆角',
  spacing: '间距',
};

export const stateLabels: Record<BindingState, string> = {
  hyperos: 'HyperOS Token',
  legacy: '旧版 Kit 变量',
  other: '非 HyperOS 库',
  unbound: '未绑定',
};

export const tierOrder: TokenTier[] = ['semantic', 'component', 'reference'];

export const tierLabels: Record<TokenTier, string> = {
  reference: 'Reference',
  semantic: 'Semantic',
  component: 'Component',
};

export const exclusionOrder: ExclusionReason[] = [
  'miuix-instance',
  'illustration',
  'annotation',
  'hidden',
];

export const exclusionLabels: Record<ExclusionReason, string> = {
  'miuix-instance': 'MIUIX 组件实例',
  illustration: '插图与矢量',
  annotation: '标注与说明',
  hidden: '隐藏图层',
};

export const exclusionHints: Record<ExclusionReason, string> = {
  'miuix-instance': '组件内部由 UI Kit 维护，只统计覆写过的属性',
  illustration: '自绘矢量、图片、图标不要求绑定 Token',
  annotation: '标注、交互说明和画板外的文字不计入',
  hidden: '不可见图层及其子级不计入',
};

export const uncertainLabels: Record<Uncertain['kind'], string> = {
  'possible-illustration': '疑似插图',
  'possible-detached-component': '疑似脱离的组件',
};

export const severityLabels: Record<FindingSeverity, string> = {
  error: '错误',
  warning: '警告',
  info: '提示',
};

export const checkLabels: Record<string, string> = {
  'reference-tier': '层级检查',
  scope: '作用域检查',
  'value-match': '取值匹配',
  semantic: '语义检查',
};

export function checkLabel(id: string) {
  return checkLabels[id] ?? id;
}

export const errorMessages: Record<TokenCheckErrorCode, string> = {
  'invalid-url': '链接无法识别。请使用 figma.com/design 或 figma.com/file 开头的链接。',
  'missing-node-id':
    '链接里没有 node-id。请在 Figma 中选中 Section 或 Frame，右键 Copy link。',
  'unsupported-node-type':
    '这个链接指向页面或整个文件。请在 Figma 中选中 Section 或 Frame，右键 Copy link。',
  'figma-auth': '没有权限读取该文件。请确认检查服务使用的 Figma 账号能打开这个文件。',
  'figma-not-found': '找不到这个文件或图层，可能已被删除，或链接复制不完整。',
  'figma-rate-limit': 'Figma 接口请求过于频繁，请等一分钟后再试。',
  'too-large': '所选范围的图层太多（上限 30,000）。请拆成更小的 Section 或 Frame 分别检查。',
  'not-configured':
    '检查服务尚未启用。需要管理员在服务端配置 FIGMA_ACCESS_TOKEN 后才能使用。',
  internal: '检查过程中出错了，请稍后重试。',
};

export function formatRate(rate: number | null) {
  if (rate === null) return '—';
  const pct = rate * 100;
  return `${pct >= 99.95 || pct === 0 ? pct.toFixed(0) : pct.toFixed(1)}%`;
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}
