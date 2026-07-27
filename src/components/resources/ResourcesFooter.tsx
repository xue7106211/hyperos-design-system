import Link from 'next/link';

export function ResourcesFooter() {
  return (
    <footer className="resources-footer">
      <span>
        HyperOS
        <span className="text-[var(--color-foreground-200)]"> 设计资源</span>
      </span>
      <span>
        by{' '}
        <Link href="/docs/os4">HyperOS 设计系统团队</Link>
      </span>
    </footer>
  );
}
