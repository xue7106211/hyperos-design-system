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
      // 演示数据是手写的，候选用真实快照现算，和线上报告走同一个函数
      const { suggestForIssues } = await import('@/lib/token-check/nearest');
      const { getLibrarySnapshot } = await import('@/lib/token-check/library-snapshot');
      return { ...demoReport, suggestions: suggestForIssues(demoReport.issues, getLibrarySnapshot()) };
    }
  }
  return undefined;
}

export default async function TokenCheckPage({ searchParams }: PageProps<'/tools/token-check'>) {
  const demoReport = await loadDemoReport(searchParams);

  const intro = (
    <>
      <header className="tc-page-head">
        <p className="tc-breadcrumb">
          <Link href="/resources#design-tools" className="tc-anchor">
            设计资源
          </Link>
          <span aria-hidden>/</span>
          工具
        </p>
        <h1 className="tc-title">Token 绑定检查</h1>
        <p className="tc-lede">
          设计稿里的每个颜色、字号、圆角和间距，都应该能追溯到 HyperOS Design Token。贴入 Figma 链接，找出还没有出处的值
        </p>
      </header>
      {demoReport ? (
        <Alert tone="info" title="当前显示演示数据" className="tc-demo-note">
          仅开发环境可见，去掉地址中的 ?demo=1 即可正常使用
        </Alert>
      ) : null}
    </>
  );

  return (
    <div className="tc-arc">
      <TokenCheckApp initialReport={demoReport} intro={intro} />
    </div>
  );
}
