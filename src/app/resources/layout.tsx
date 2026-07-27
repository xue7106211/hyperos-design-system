import type { ReactNode } from 'react';
import './resources.css';

export default function ResourcesLayout({ children }: { children: ReactNode }) {
  return <div className="resources-shell min-h-dvh">{children}</div>;
}
