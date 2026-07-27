import type { Metadata } from 'next';
import { PillNav } from '@/components/home/PillNav';
import { MatrixRain } from '@/components/resources/MatrixRain';
import { ResourceHero } from '@/components/resources/ResourceHero';
import { ResourcesBackToTop } from '@/components/resources/ResourcesBackToTop';
import { ResourcesCatalog } from '@/components/resources/ResourcesCatalog';
import { ResourcesFeatured } from '@/components/resources/ResourcesFeatured';
import { ResourcesFooter } from '@/components/resources/ResourcesFooter';
import { ResourcesRule } from '@/components/resources/ResourcesRule';
import { ResourcesTools } from '@/components/resources/ResourcesTools';
import { ResourcesTopics } from '@/components/resources/ResourcesTopics';
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
        <section className="resources-hero-band">
          <ResourceHero />
          <ResourcesRule />
        </section>
        <ResourcesCatalog />
        <ResourcesFeatured />
        <ResourcesTools />
        <ResourcesTopics />
        <ResourcesFooter />
      </main>
      <ResourcesBackToTop />
    </>
  );
}
