/**
 * 准确性检查注册表（规格第 7 节）。新增检查器在 ACCURACY_CHECKS 中登记。
 */
import type { LibraryIndex } from '../library';
import type { NodeIndex } from '../node-index';
import type { BindableProperty, CheckTarget, Finding } from '../types';
import { referenceTierCheck } from './reference-tier';

export type CheckContext = {
  target: CheckTarget;
  library: LibraryIndex;
  nodes: NodeIndex;
};

export type AccuracyCheck = {
  id: string;
  run(props: BindableProperty[], ctx: CheckContext): Finding[] | Promise<Finding[]>;
};

export const ACCURACY_CHECKS: AccuracyCheck[] = [referenceTierCheck];
