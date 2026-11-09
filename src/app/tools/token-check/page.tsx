import type { Metadata } from 'next';
import Link from 'next/link';
import { TokenCheckApp } from '@/components/token-check/TokenCheckApp';
import type { TokenCheckReport } from '@/lib/token-check/types';

export const metadata: Metadata = {
  title: 'Token 绑定检查',
  description: '贴入 Figma Section 或 Frame 链接，检查设计稿绑定 HyperOS Design Token 的覆盖率与问题图层。',
};

async function loadDemoReport(
  searchParams: Promise<Record<string, string | string[] | undefined>>,
): Promise<TokenCheckReport | undefined> {
  // 常量条件：生产构建会剔除整个分支，不读取 searchParams，也不打包演示数据
  if (process.env.NODE_ENV !== 'production') {
    const { demo } = await searchParams;
    if (demo === '1') {
      const { demoReport } = await import('@/components/token-check/__fixtures__/demo-report');
      return demoReport;
    }
  }
  return undefined;
}

export default async function TokenCheckPage({ searchParams }: PageProps<'/tools/token-check'>) {
  const demoReport = await loadDemoReport(searchParams);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 sm:px-8 sm:pt-10">
      <header className="max-w-2xl">
        <p className="text-sm text-fd-muted-foreground">
          <Link href="/resources#design-tools" className="tc-anchor">
            设计资源
          </Link>
          <span aria-hidden className="mx-1.5">/</span>
          工具
        </p>
        <h1 className="tc-title mt-2 text-3xl font-medium tracking-tight text-fd-foreground">
          Token 绑定检查
        </h1>
        <p className="mt-3 text-base text-fd-muted-foreground">
          检查 Figma 设计稿中颜色、文字、圆角、间距等属性是否绑定了 HyperOS Design
          Token，并列出需要处理的图层。
        </p>
      </header>

      {demoReport ? (
        <p className="tc-demo-note mt-6 max-w-2xl">当前显示演示数据（仅开发环境），去掉地址中的 <code className="whitespace-nowrap">?demo=1</code> 即可正常使用。</p>
      ) : null}

      <div className="mt-8">
        <TokenCheckApp initialReport={demoReport} />
      </div>
    </div>
  );
}
