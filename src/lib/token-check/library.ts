import type { LegacySnapshot, LegacyVariable, LibrarySnapshot, SnapshotStyle, SnapshotVariable } from './types';

export type LibraryIndex = {
  snapshot: LibrarySnapshot;
  /** 库文件 key；检查库文件自身时，本地变量 id 也能命中 */
  fileKey: string;
  variableByKey: Map<string, SnapshotVariable>;
  /** 库文件内的本地 id → 变量 */
  variableById: Map<string, SnapshotVariable>;
  variableByName: Map<string, SnapshotVariable>;
  styleByKey: Map<string, SnapshotStyle>;
  /** Reference 变量名 → 以别名指向它的 Semantic 变量 */
  semanticAliasesOf: Map<string, SnapshotVariable[]>;
  legacy: { fileKey: string | null; byKey: Map<string, LegacyVariable>; byId: Map<string, LegacyVariable> };
};

export function createLibraryIndex(snapshot: LibrarySnapshot, legacySnapshot?: LegacySnapshot): LibraryIndex {
  const variableByKey = new Map<string, SnapshotVariable>();
  const variableById = new Map<string, SnapshotVariable>();
  const variableByName = new Map<string, SnapshotVariable>();
  const styleByKey = new Map<string, SnapshotStyle>();
  const semanticAliasesOf = new Map<string, SnapshotVariable[]>();

  for (const variable of snapshot.variables) {
    variableByKey.set(variable.key, variable);
    if (variable.id) variableById.set(variable.id, variable);
    variableByName.set(variable.name, variable);
  }
  for (const style of snapshot.styles) styleByKey.set(style.key, style);

  for (const variable of snapshot.variables) {
    if (variable.tier !== 'semantic') continue;
    const targets = new Set(Object.values(variable.aliasOf ?? {}).filter((name): name is string => !!name));
    for (const target of targets) {
      const list = semanticAliasesOf.get(target) ?? [];
      list.push(variable);
      semanticAliasesOf.set(target, list);
    }
  }

  return {
    snapshot,
    fileKey: snapshot.source.fileKey,
    variableByKey,
    variableById,
    variableByName,
    styleByKey,
    semanticAliasesOf,
    legacy: {
      fileKey: legacySnapshot?.source.fileKey ?? null,
      byKey: new Map((legacySnapshot?.variables ?? []).map((v) => [v.key, v])),
      byId: new Map((legacySnapshot?.variables ?? []).map((v) => [v.id, v])),
    },
  };
}

/**
 * 远程变量 id `VariableID:<key>/<localId>` → `<key>`；本地变量（无 `/`）返回 null。
 */
export function remoteVariableKey(variableId: string): string | null {
  const body = variableId.startsWith('VariableID:') ? variableId.slice('VariableID:'.length) : variableId;
  const slash = body.indexOf('/');
  if (slash <= 0) return null;
  return body.slice(0, slash);
}

/** 按绑定 id 查快照变量；`fileKey` 为被检查文件，等于库文件时本地 id 也查 */
export function lookupVariable(index: LibraryIndex, variableId: string, fileKey: string): SnapshotVariable | undefined {
  const key = remoteVariableKey(variableId);
  if (key) return index.variableByKey.get(key);
  if (fileKey === index.fileKey) return index.variableById.get(variableId);
  return undefined;
}

/** 按绑定 id 查旧版 Kit 变量；检查 Kit 文件自身时本地 id 也查 */
export function lookupLegacyVariable(index: LibraryIndex, variableId: string, fileKey: string): LegacyVariable | undefined {
  const key = remoteVariableKey(variableId);
  if (key) return index.legacy.byKey.get(key);
  if (fileKey === index.legacy.fileKey) return index.legacy.byId.get(variableId);
  return undefined;
}
