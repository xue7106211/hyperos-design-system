import Image from "next/image";
import Link from "next/link";
import { HyperOSLogo } from "@/components/HyperOSLogo";
import { defaultDocsRoute } from "@/lib/shared";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-16 text-center">
      <div className="mx-auto mb-8 w-[90%] overflow-hidden rounded-2xl border border-fd-border bg-fd-card">
        <Image
          src="/home/hyperos-ui-kit-4.png"
          alt="Figma UI Kit 4.0 — Xiaomi HyperOS 4.0"
          width={1024}
          height={576}
          className="h-auto w-full"
          priority
        />
      </div>
      <HyperOSLogo className="mx-auto mb-6 h-8" priority />
      {/* <p className="mb-3 text-sm font-medium text-fd-primary">Design System</p> */}
      {/* <h1 className="mb-4 text-3xl font-bold tracking-tight text-fd-foreground">
        Design System
      </h1> */}
      <p className="mb-10 text-base text-fd-muted-foreground">
        Xiaomi
        HyperOS 设计规范自2014年开始不断成长迭代，希望能够为小米旗下的各个软/硬件产品，提供一套由一代代设计师不断磨砺后，经得起推敲的设计资产。
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={defaultDocsRoute}
          className="rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          进入文档
        </Link>
        <Link
          href={`${defaultDocsRoute}/foundations/colors`}
          className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-muted"
        >
          色彩 Token
        </Link>
        <Link
          href={`${defaultDocsRoute}/components/actions/button`}
          className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-muted"
        >
          Button 组件
        </Link>
        <Link
          href={`${defaultDocsRoute}/resources/figma-library`}
          className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-muted"
        >
          Figma 库
        </Link>
      </div>
    </div>
  );
}
