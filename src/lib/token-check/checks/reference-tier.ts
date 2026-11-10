import type { LibraryIndex } from '../library';
import type { Finding, SnapshotVariable } from '../types';
import type { AccuracyCheck } from './index';

const MAX_SUGGESTIONS = 3;

function lastSegment(name: string): string {
  return name.slice(name.lastIndexOf('/') + 1);
}

/** 以别名指向该 Reference Token 的 Semantic Token；指向它的模式越多越靠前 */
export function semanticAlternatives(library: LibraryIndex, referenceName: string): SnapshotVariable[] {
  const reference = library.variableByName.get(referenceName);
  const candidates = new Set([
    ...(library.semanticAliasesOf.get(referenceName) ?? []),
    ...(library.semanticAliasesOf.get(lastSegment(referenceName)) ?? []),
  ]);
  const matchCount = (variable: SnapshotVariable) =>
    Object.values(variable.aliasOf ?? {}).filter((name) => name === referenceName || name === lastSegment(referenceName)).length;
  return [...candidates]
    .filter((variable) => !reference || variable.type === reference.type)
    .sort((a, b) => matchCount(b) - matchCount(a) || a.name.localeCompare(b.name));
}

export const referenceTierCheck: AccuracyCheck = {
  id: 'reference-tier',
  run(props, ctx) {
    const findings: Finding[] = [];
    for (const prop of props) {
      if (prop.state !== 'hyperos' || prop.token?.tier !== 'reference') continue;
      const alternatives = semanticAlternatives(ctx.library, prop.token.name).slice(0, MAX_SUGGESTIONS);
      const finding: Finding = {
        checkId: 'reference-tier',
        severity: 'warning',
        nodeId: prop.nodeId,
        nodeName: prop.nodeName,
        path: prop.path,
        field: prop.field,
        message: '直接绑定了 Reference 层 Token（色板 / 基础数值）。业务稿应绑定 Semantic 或 Component 层 Token。',
        current: prop.token.name,
        confidence: 1,
        figmaUrl: prop.figmaUrl,
      };
      if (alternatives.length) finding.suggestion = alternatives.map((variable) => variable.name).join('、');
      findings.push(finding);
    }
    return findings;
  },
};
