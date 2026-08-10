import { formatDocUpdatedAt, getDocUpdatedAt } from '@/lib/git-file-mtime';
import { source } from '@/lib/source';

export type RecentDocItem = {
  title: string;
  description?: string;
  href: string;
  updatedAt: string;
};

function isRecentEligible(slugs: string[]): boolean {
  if (slugs[0] !== 'os4') return false;
  // 跳过版本首页、一级分区总览（如 os4/components）
  if (slugs.length < 3) return false;
  // 跳过 Code 伴生页（如 drawer-code）
  if (slugs.some((s) => s.endsWith('-code'))) return false;
  return true;
}

/**
 * 按 git 最后提交时间取 OS4 文档最近更新（构建时读取）。
 */
export function getRecentDocs(limit = 5): RecentDocItem[] {
  const ranked = source
    .getPages()
    .filter((page) => isRecentEligible(page.slugs))
    .map((page) => {
      const date = getDocUpdatedAt(page.path);
      const description =
        typeof page.data.description === 'string'
          ? page.data.description.trim()
          : undefined;

      return {
        title: page.data.title,
        description: description || undefined,
        href: page.url,
        updatedAt: formatDocUpdatedAt(date),
        updatedAtMs: date.getTime(),
      };
    })
    .sort((a, b) => b.updatedAtMs - a.updatedAtMs);

  const seen = new Set<string>();
  const items: RecentDocItem[] = [];

  for (const row of ranked) {
    if (seen.has(row.href)) continue;
    seen.add(row.href);
    items.push({
      title: row.title,
      description: row.description,
      href: row.href,
      updatedAt: row.updatedAt,
    });
    if (items.length >= limit) break;
  }

  return items;
}
