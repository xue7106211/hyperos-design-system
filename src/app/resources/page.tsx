import type { Metadata } from 'next';
import { PillNav } from '@/components/home/PillNav';
import { MatrixRain } from '@/components/resources/MatrixRain';
import { ResourceHero } from '@/components/resources/ResourceHero';
import { ResourcesCatalog } from '@/components/resources/ResourcesCatalog';
import { ResourcesFaq } from '@/components/resources/ResourcesFaq';
import { ResourcesFeatured } from '@/components/resources/ResourcesFeatured';
import { ResourcesFooter } from '@/components/resources/ResourcesFooter';
import { ResourcesRule } from '@/components/resources/ResourcesRule';
import { resourcesPage } from '@/lib/resources';

export const metadata: Metadata = {
  title: resourcesPage.title,
  description: resourcesPage.description,
};

export default function ResourcesPage() {
  return (
    <>
      <MatrixRain />
      <PillNav />
      <main className="resources-layout-root">
        <ResourceHero />
        <ResourcesRule />
        <ResourcesCatalog />
        <ResourcesFeatured />
        <ResourcesFaq />
        <ResourcesFooter />
      </main>
    </>
  );
}
