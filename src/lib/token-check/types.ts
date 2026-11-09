/**
 * Token 绑定检查：引擎、API 与报告 UI 共享的类型。
 * 规格见 docs/superpowers/specs/2026-11-09-figma-token-check-design.md
 */

/* ---------- Token 库快照（tokens/figma/hyperos-design-token.snapshot.json） ---------- */

export type TokenTier = 'reference' | 'semantic' | 'component';

export type SnapshotVariable = {
  /** 发布 key；远程绑定 id 形如 `VariableID:<key>/<localId>` */
  key: string;
  /** 库文件内的本地 id（`VariableID:3516:2693`） */
  id: string;
  /** 完整名称，含分组路径，如 `text/default/miuix_sys_color_text_primary_enabled` */
  name: string;
  collection: string;
  tier: TokenTier;
  type: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  scopes: string[];
  description: string;
  hiddenFromPublishing: boolean;
  /** 每个模式（Light / Dark）指向的变量名；非别名为 null */
  aliasOf: Record<string, string | null>;
  /** 每个模式的最终值：颜色为 `#RRGGBB` 或 `#RRGGBBAA`，数值为 number */
  resolved: Record<string, string | number | boolean>;
};

export type SnapshotStyle = {
  key: string;
  id: string;
  name: string;
  styleType: 'TEXT' | 'FILL' | 'EFFECT' | 'GRID';
  description: string;
  /** 仅 TEXT */
  font?: { family: string; style: string; size: number; lineHeight: number | 'AUTO' | string };
};

/** 旧版 Kit 变量（tokens/figma/miuix-kit-legacy-variables.json） */
export type LegacyVariable = { key: string; id: string; name: string; collection: string; type: string };

export type LegacySnapshot = {
  source: { fileKey: string; fileName: string; exportedAt: string; note?: string };
  variables: LegacyVariable[];
};

export type LibrarySnapshot = {
  source: { fileKey: string; fileName: string; exportedAt: string };
  collections: { name: string; tier: TokenTier; modes: string[] }[];
  variables: SnapshotVariable[];
  styles: SnapshotStyle[];
};

/* ---------- 检查输入 ---------- */

export type CheckTarget = {
  url: string;
  fileKey: string;
  nodeId: string;
};

/* ---------- 属性与绑定 ---------- */

export type PropertyCategory =
  | 'fill' // 非文字图层的填充
  | 'text-color' // 文字图层的填充
  | 'stroke'
  | 'typography'
  | 'radius'
  | 'spacing'; // itemSpacing / padding（效果 / 阴影不属于 Design Token 范围，不统计）

export type BindingState =
  /** 绑定到 HyperOS Design Token 库（变量或样式） */
  | 'hyperos'
  /** 绑定了 MIUIX UI Kit 的旧版变量（feature token / Radius token 等），属于迁移问题 */
  | 'legacy'
  /** 绑定了变量 / 样式，但不属于 HyperOS 库，也不是旧版 Kit 变量（本地或第三方库） */
  | 'other'
  /** 硬编码值 */
  | 'unbound';

export type BindableProperty = {
  nodeId: string;
  nodeName: string;
  /** 从检查根节点到该节点的名称路径 */
  path: string[];
  category: PropertyCategory;
  /** 具体字段，如 `fills[0]`、`paddingLeft`、`topLeftRadius`、`text` */
  field: string;
  state: BindingState;
  /** 原始值的可读形式：`#FF0000 80%`、`16`、`MiSans Medium 17/22` */
  value: string;
  /** state = 'hyperos' 时的 Token / 样式信息 */
  /** state = 'hyperos' 或 'legacy' 时的 Token / 样式信息；legacy 时 collection 为旧集合名 */
  token?: { name: string; tier?: TokenTier; kind: 'variable' | 'style'; collection?: string };
  /** 位于 MIUIX 实例内、但被覆写的属性 */
  fromInstanceOverride?: boolean;
  figmaUrl: string;
  /** 所属检查目标在 report.targets 中的下标（引擎填充） */
  targetIndex?: number;
};

/* ---------- 排除 ---------- */

export type ExclusionReason =
  | 'miuix-instance' // MIUIX UI Kit 组件实例（未覆写部分）
  | 'illustration' // 自绘矢量、插图、图片
  | 'annotation' // 标注、交互说明、Section 内游离说明
  | 'hidden'; // visible: false

export type Exclusion = {
  nodeId: string;
  nodeName: string;
  path: string[];
  reason: ExclusionReason;
  /** 判定依据，便于设计师抽查 */
  detail: string;
  /** 被排除子树中的节点数 */
  nodeCount: number;
  figmaUrl: string;
};

/** 规则拿不准的节点：不排除，计入统计，但在报告中单列提醒 */
export type Uncertain = {
  nodeId: string;
  nodeName: string;
  path: string[];
  kind: 'possible-illustration' | 'possible-detached-component';
  detail: string;
  figmaUrl: string;
};

/* ---------- 准确性检查（插件式；第一期只有层级检查） ---------- */

export type FindingSeverity = 'error' | 'warning' | 'info';

export type Finding = {
  /** 检查器 id，如 `reference-tier`、后续的 `scope`、`value-match`、`semantic` */
  checkId: string;
  severity: FindingSeverity;
  nodeId: string;
  nodeName: string;
  path: string[];
  field: string;
  message: string;
  current?: string;
  /** 替换建议（Token 名） */
  suggestion?: string;
  /** 0–1；规则类检查为 1，语义检查由模型给出 */
  confidence: number;
  figmaUrl: string;
  /** 所属检查目标在 report.targets 中的下标（引擎填充） */
  targetIndex?: number;
};

/* ---------- 报告 ---------- */

export type CoverageStat = {
  total: number;
  hyperos: number;
  legacy: number;
  other: number;
  unbound: number;
  /** hyperos / total；total = 0 时为 null */
  rate: number | null;
};

export type TargetSummary = {
  target: CheckTarget;
  nodeName: string;
  nodeType: string;
  coverage: CoverageStat;
};

export type TokenCheckReport = {
  generatedAt: string;
  library: { fileName: string; exportedAt: string };
  targets: TargetSummary[];
  coverage: {
    overall: CoverageStat;
    byCategory: Record<PropertyCategory, CoverageStat>;
    /** state = 'hyperos' 的属性按层级分布 */
    byTier: Record<TokenTier, number>;
  };
  /** 未绑定、旧版 Kit 变量、其他绑定的属性，供问题清单使用 */
  issues: BindableProperty[];
  exclusions: Exclusion[];
  exclusionSummary: Record<ExclusionReason, { count: number; nodeCount: number }>;
  uncertain: Uncertain[];
  findings: Finding[];
  /** 本次运行了哪些准确性检查器 */
  checksRun: string[];
  /** 截断、限流等提示 */
  warnings: string[];
};

/* ---------- API ---------- */

export type TokenCheckRequest = { urls: string[] };

export type TokenCheckErrorCode =
  | 'invalid-url'
  | 'missing-node-id'
  | 'unsupported-node-type' // 页面 / 文档等
  | 'figma-auth'
  | 'figma-not-found'
  | 'figma-rate-limit'
  | 'too-large'
  | 'not-configured'
  | 'internal';

export type TokenCheckResponse =
  | { ok: true; report: TokenCheckReport }
  | { ok: false; error: { code: TokenCheckErrorCode; message: string; url?: string } };
