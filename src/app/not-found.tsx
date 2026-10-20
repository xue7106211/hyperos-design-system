import Link from 'next/link';
import { appName } from '@/lib/shared';

export default function NotFound() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center"
    >
      <h1 className="text-xl font-medium">找不到这个页面</h1>
      <p className="max-w-md text-sm text-fd-muted-foreground">
        这个地址在{appName}里不存在，或已经换了位置。
      </p>
      <Link href="/" className="mt-2 text-sm underline underline-offset-4">
        返回首页
      </Link>
    </main>
  );
}
