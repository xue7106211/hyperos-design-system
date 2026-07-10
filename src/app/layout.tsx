import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { appDescription, appName, appShortTitle } from '@/lib/shared';
import './global.css';

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
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
