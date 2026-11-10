import type { Metadata } from 'next';
import Link from 'next/link';
import { Alert } from '@/components/arc/alert/alert';
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
    <div className="tc-arc tc-page">
      <header className="tc-page-head">
        <div className="min-w-0">
          <p className="tc-breadcrumb">
            <Link href="/resources#design-tools" className="tc-anchor">
              设计资源
            </Link>
            <span aria-hidden>/</span>
            工具
          </p>
          <h1 className="tc-title">Token 绑定检查</h1>
          <p className="tc-lede">
            检查 Figma 设计稿中颜色、文字、圆角、间距是否绑定了 HyperOS Design Token，并列出需要处理的图层
          </p>
        </div>
      </header>

      {demoReport ? (
        <Alert tone="info" title="当前显示演示数据" className="tc-demo-note">
          仅开发环境可见，去掉地址中的 ?demo=1 即可正常使用
        </Alert>
      ) : null}

      <TokenCheckApp initialReport={demoReport} />
    </div>
  );
}
