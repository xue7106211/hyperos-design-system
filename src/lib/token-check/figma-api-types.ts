/**
 * Figma REST API 响应中检查引擎用到的字段（只声明用到的部分）。
 * 参考：https://developers.figma.com/docs/rest-api/
 */

export type FigmaVariableAlias = { type: 'VARIABLE_ALIAS'; id: string };

/** boundVariables 的值：单个别名，或按 paint / effect / 文字分段的别名数组 */
export type FigmaBoundValue = FigmaVariableAlias | (FigmaVariableAlias | null | undefined)[];

export type FigmaColor = { r: number; g: number; b: number; a: number };

export type FigmaPaint = {
  type: string; // SOLID | GRADIENT_LINEAR | GRADIENT_RADIAL | GRADIENT_ANGULAR | GRADIENT_DIAMOND | IMAGE | EMOJI | VIDEO | PATTERN
  visible?: boolean;
  opacity?: number;
  color?: FigmaColor;
  gradientStops?: { position: number; color: FigmaColor; boundVariables?: Record<string, FigmaVariableAlias> }[];
  boundVariables?: Record<string, FigmaVariableAlias | undefined>;
};

export type FigmaEffect = {
  type: string; // DROP_SHADOW | INNER_SHADOW | LAYER_BLUR | BACKGROUND_BLUR ...
  visible?: boolean;
  radius?: number;
  color?: FigmaColor;
  offset?: { x: number; y: number };
  spread?: number;
  boundVariables?: Record<string, FigmaVariableAlias | undefined>;
};

export type FigmaTypeStyle = {
  fontFamily?: string;
  fontPostScriptName?: string | null;
  fontStyle?: string;
  fontWeight?: number;
  fontSize?: number;
  lineHeightPx?: number;
  lineHeightUnit?: string;
  lineHeightPercentFontSize?: number;
};

export type FigmaOverride = { id: string; overriddenFields: string[] };

export type FigmaNode = {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: FigmaNode[];
  /** 自动布局中的绝对定位子级为 ABSOLUTE */
  layoutPositioning?: 'AUTO' | 'ABSOLUTE';
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  individualStrokeWeights?: { top: number; right: number; bottom: number; left: number };
  effects?: FigmaEffect[];
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID';
  primaryAxisAlignItems?: string;
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  boundVariables?: Record<string, FigmaBoundValue | Record<string, FigmaBoundValue> | undefined>;
  /** StyleType（小写：fill / stroke / text / effect / grid）→ style id */
  styles?: Record<string, string>;
  style?: FigmaTypeStyle;
  characters?: string;
  exportSettings?: unknown[];
  componentId?: string;
  overrides?: FigmaOverride[];
};

export type FigmaComponentMeta = { key: string; name: string; componentSetId?: string; remote?: boolean };
export type FigmaComponentSetMeta = { key: string; name: string; remote?: boolean };
export type FigmaStyleMeta = { key: string; name: string; styleType: string; remote?: boolean };

export type FigmaNodeEntry = {
  document: FigmaNode;
  components?: Record<string, FigmaComponentMeta>;
  componentSets?: Record<string, FigmaComponentSetMeta>;
  styles?: Record<string, FigmaStyleMeta>;
};

/** GET /v1/files/:key/nodes?ids=… */
export type FigmaNodesResponse = {
  name?: string;
  lastModified?: string;
  /** 找不到的节点值为 null */
  nodes: Record<string, FigmaNodeEntry | null>;
};

