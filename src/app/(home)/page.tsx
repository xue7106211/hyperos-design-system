import Link from 'next/link';
import { HyperOSLogo } from '@/components/HyperOSLogo';
import { docsRoute } from '@/lib/shared';

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-16 text-center">
      <HyperOSLogo className="mx-auto mb-6 h-8" priority />
      <p className="mb-3 text-sm font-medium text-fd-primary">Design System</p>
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-fd-foreground">
        移动端客户端组件设计规范
      </h1>
      <p className="mb-10 text-lg text-fd-muted-foreground">
        面向 Android / iOS 的设计原则、组件规范、Design Tokens 与 Figma 设计源连接。
        文档站不提供 Web 组件 demo，交互演示通过 Figma 原型嵌入呈现。
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={docsRoute}
          className="rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          进入文档
        </Link>
        <Link
          href={`${docsRoute}/foundations/colors`}
          className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-muted"
        >
          色彩 Token
        </Link>
        <Link
          href={`${docsRoute}/components/actions/button`}
          className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-muted"
        >
          Button 组件
        </Link>
        <Link
          href={`${docsRoute}/resources/figma-library`}
          className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-muted"
        >
          Figma 库
        </Link>
      </div>
    </div>
  );
}
