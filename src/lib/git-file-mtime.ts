import { execFileSync } from 'node:child_process';
import path from 'node:path';

const cache = new Map<string, Date>();

/**
 * 读取仓库内某文件的 git 最后提交时间（committer date）。
 * 无提交记录或 git 不可用时返回 null。
 */
export function getGitFileMtime(repoRelativePath: string): Date | null {
  const normalized = repoRelativePath.replace(/\\/g, '/');
  const cached = cache.get(normalized);
  if (cached) return cached;

  try {
    const output = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', normalized],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    ).trim();

    if (!output) return null;

    const date = new Date(output);
    if (Number.isNaN(date.getTime())) return null;

    cache.set(normalized, date);
    return date;
  } catch {
    return null;
  }
}

/** 文档更新时间：优先 git 最后提交，否则当前时间 */
export function getDocUpdatedAt(pagePath: string): Date {
  const relative = path.posix.join(
    'content/docs',
    pagePath.endsWith('.mdx') ? pagePath : `${pagePath}.mdx`,
  );
  return getGitFileMtime(relative) ?? new Date();
}

/** 格式化为 YYYY-MM-DD（Asia/Shanghai） */
export function formatDocUpdatedAt(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
