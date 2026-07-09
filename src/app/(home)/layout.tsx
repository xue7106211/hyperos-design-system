import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <div className="home-shell min-h-dvh">{children}</div>;
}
