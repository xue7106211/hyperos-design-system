'use client';

/**
 * 复核状态的浏览器端存储（localStorage）。只存在本机，不上传。
 * - 有意保留：tc-waivers:v1 → { [waiverKey]: 标记时间 }
 * - 检查历史：tc-history:v1 → { [historyKey]: RunHistory }
 */
import { useCallback, useSyncExternalStore } from 'react';
import type { RunHistory } from '@/lib/token-check/review-state';

const WAIVERS_KEY = 'tc-waivers:v1';
const HISTORY_KEY = 'tc-history:v1';
/** 历史只留最近这么多组检查目标，避免无限增长 */
const HISTORY_LIMIT = 50;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 隐私模式或配额已满：复核状态只在本次会话内有效
  }
}

/* ---------- 有意保留 ---------- */

type WaiverMap = Record<string, string>;

const listeners = new Set<() => void>();
const EMPTY: ReadonlySet<string> = new Set();
let cache: { raw: string | null; set: ReadonlySet<string> } = { raw: null, set: EMPTY };

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === WAIVERS_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): ReadonlySet<string> {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(WAIVERS_KEY);
  } catch {
    return cache.set;
  }
  if (raw !== cache.raw) {
    let map: WaiverMap = {};
    try {
      map = raw ? (JSON.parse(raw) as WaiverMap) : {};
    } catch {
      map = {};
    }
    cache = { raw, set: new Set(Object.keys(map)) };
  }
  return cache.set;
}

const getServerSnapshot = () => EMPTY;

export function useWaivers() {
  const waivers = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setWaived = useCallback((keys: string[], waived: boolean) => {
    const map = read<WaiverMap>(WAIVERS_KEY, {});
    const at = new Date().toISOString();
    for (const key of keys) {
      if (waived) map[key] = at;
      else delete map[key];
    }
    write(WAIVERS_KEY, map);
    for (const l of listeners) l();
  }, []);

  return [waivers, setWaived] as const;
}

/* ---------- 检查历史 ---------- */

type HistoryMap = Record<string, RunHistory>;

export function readHistory(key: string): RunHistory | undefined {
  return read<HistoryMap>(HISTORY_KEY, {})[key];
}

export function writeHistory(key: string, history: RunHistory) {
  const map = read<HistoryMap>(HISTORY_KEY, {});
  delete map[key];
  map[key] = history;
  const keys = Object.keys(map);
  for (const stale of keys.slice(0, Math.max(0, keys.length - HISTORY_LIMIT))) delete map[stale];
  write(HISTORY_KEY, map);
}
