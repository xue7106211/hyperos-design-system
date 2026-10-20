'use client';

import Link from 'next/link';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center"
    >
      <h1 className="text-xl font-medium">页面没有加载出来</h1>
      <p className="max-w-md text-sm text-fd-muted-foreground">
        这次请求失败了。可以重试，或回到首页继续。
      </p>
      <div className="mt-2 flex items-center gap-4 text-sm">
        <button type="button" onClick={() => reset()} className="underline underline-offset-4">
          重试
        </button>
        <Link href="/" className="underline underline-offset-4">
          返回首页
        </Link>
      </div>
    </main>
  );
}
