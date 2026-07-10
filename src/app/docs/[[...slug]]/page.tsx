import { TinaDocsPageContent } from '@/components/tina/TinaDocsPageContent';
import { FigmaJumpButton } from '@/components/docs/FigmaJumpButton';
import { getMDXComponents } from '@/components/mdx';
import { getPageImage, getPageMarkdownUrl, source } from '@/lib/source';
import { fetchTinaDoc } from '@/lib/tina-docs';
import { gitConfig, gitRepoUrl, resolvePageFigmaUrl } from '@/lib/shared';
import {
  DocsPage,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const figmaUrl = resolvePageFigmaUrl(page.data);
  const tinaPayload =
    process.env.TINA_PUBLIC_IS_LOCAL === 'true'
      ? await fetchTinaDoc(page.path)
      : null;

  const actions = (
    <div className="flex flex-row items-center gap-2 border-b pb-6">
      <MarkdownCopyButton markdownUrl={markdownUrl} />
      <ViewOptionsPopover
        markdownUrl={markdownUrl}
        githubUrl={`${gitRepoUrl}/-/blob/${gitConfig.branch}/content/docs/${page.path}`}
      />
      <FigmaJumpButton href={figmaUrl} className="ms-auto" />
    </div>
  );

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <TinaDocsPageContent
        pagePath={page.path}
        initialPayload={tinaPayload}
        fallbackTitle={page.data.title}
        fallbackDescription={page.data.description}
        actions={actions}
        fallbackBody={
          <MDX
            components={getMDXComponents({
              a: createRelativeLink(source, page),
            })}
          />
        }
      />
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/docs/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
