export const EASTER_EGG_CLICK_WINDOW_MS = 1200;
export const EASTER_EGG_CLICK_THRESHOLD = 4;

export type RapidClickResult = {
  timestamps: number[];
  shouldOpen: boolean;
};

/**
 * 将一次点击记入滚动时间窗；达到阈值时 shouldOpen=true 并清空队列。
 */
export function recordRapidClick(
  timestamps: number[],
  now: number,
  windowMs: number = EASTER_EGG_CLICK_WINDOW_MS,
  threshold: number = EASTER_EGG_CLICK_THRESHOLD,
): RapidClickResult {
  const next = timestamps.filter((t) => now - t <= windowMs);
  next.push(now);

  if (next.length >= threshold) {
    return { timestamps: [], shouldOpen: true };
  }

  return { timestamps: next, shouldOpen: false };
}
