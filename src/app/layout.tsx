import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import { Suspense } from 'react';
import { AiAssistant } from '@/components/ai/AiAssistant';
import { EasterEggProvider } from '@/components/easter-egg/EasterEggProvider';
import { appDescription, appName, appShortTitle } from '@/lib/shared';
import './global.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: appName,
    template: `%s | ${appShortTitle}`,
  },
  description: appDescription,
  applicationName: appShortTitle,
  openGraph: {
    title: appName,
    description: appDescription,
    type: 'website',
    locale: 'zh_CN',
    siteName: appShortTitle,
  },
  twitter: {
    card: 'summary_large_image',
    title: appName,
    description: appDescription,
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={cn(inter.className, "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <EasterEggProvider>
            {children}
            <Suspense fallback={null}>
              <AiAssistant />
            </Suspense>
          </EasterEggProvider>
        </RootProvider>
      </body>
    </html>
  );
}
