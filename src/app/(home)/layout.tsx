import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import '@/components/home/typotab/typo.css';

const nunito = localFont({
  src: '../../../public/fonts/nunito/Nunito-Variable.ttf',
  variable: '--font-typo-nunito',
  display: 'swap',
  weight: '200 1000',
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={`home-shell min-h-dvh ${nunito.variable}`}>{children}</div>
  );
}
