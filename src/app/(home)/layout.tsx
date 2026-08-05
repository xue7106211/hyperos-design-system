import type { ReactNode } from 'react';
import '@/components/home/typotab/typo.css';

export default function Layout({ children }: { children: ReactNode }) {
  return <div className="home-shell min-h-dvh">{children}</div>;
}
