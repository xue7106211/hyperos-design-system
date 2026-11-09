/**
 * 仓库内的 HyperOS Design Token 库快照（仅服务端使用）。
 * 快照由 scripts/token-check/export-library-snapshot.figma.js 离线导出，见规格第 10 节。
 * 引擎与测试不依赖本文件，只接收 snapshot 参数。
 */
import legacyJson from '../../../tokens/figma/miuix-kit-legacy-variables.json';
import snapshotJson from '../../../tokens/figma/hyperos-design-token.snapshot.json';
import type { LegacySnapshot, LibrarySnapshot } from './types';

const snapshot = snapshotJson as unknown as LibrarySnapshot;

export function getLibrarySnapshot(): LibrarySnapshot {
  return snapshot;
}

const legacySnapshot = legacyJson as unknown as LegacySnapshot;

/** MIUIX UI Kit 旧版变量（集合已删除但仍被绑定），见 scripts/token-check/export-legacy-kit-variables.figma.js */
export function getLegacySnapshot(): LegacySnapshot {
  return legacySnapshot;
}
