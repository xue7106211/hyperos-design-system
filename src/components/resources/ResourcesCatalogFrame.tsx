'use client';

import type { ReactNode } from 'react';
import { ResourcesGridCrosses } from '@/components/resources/ResourcesGridCrosses';
import { useResourcesScrollReveal } from '@/components/resources/useResourcesScrollReveal';

/** Catalog 外框：scroll reveal + 十字装饰 */
export function ResourcesCatalogFrame({ children }: { children: ReactNode }) {
  const ref = useResourcesScrollReveal();

  return (
    <div
      ref={ref}
      className="resources-skills-card resources-grid-frame"
    >
      <ResourcesGridCrosses />
      {children}
    </div>
  );
}
