import { TinaDocsPageContent } from '@/components/tina/TinaDocsPageContent';
import { FigmaJumpButton } from '@/components/docs/FigmaJumpButton';
import { getMDXComponents } from '@/components/mdx';
import { formatDocUpdatedAt, getDocUpdatedAt } from '@/lib/git-file-mtime';
import { getPageImage, getPageMarkdownUrl, source } from '@/lib/source';
import { fetchTinaDoc } from '@/lib/tina-docs';
import {
  defaultDocMaintainer,
  gitConfig,
  gitRepoUrl,
  resolvePageFigmaUrl,
} from '@/lib/shared';
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
  const updatedAt = formatDocUpdatedAt(getDocUpdatedAt(page.path));
  const maintainer =
    typeof page.data.maintainer === 'string' && page.data.maintainer.trim()
      ? page.data.maintainer.trim()
      : defaultDocMaintainer;
  const maintainerOpenId =
    typeof page.data.maintainerOpenId === 'string' &&
    page.data.maintainerOpenId.trim()
      ? page.data.maintainerOpenId.trim()
      : undefined;
  const tinaPayload =
    process.env.TINA_PUBLIC_IS_LOCAL === 'true'
      ? await fetchTinaDoc(page.path)
      : null;

  const actions = (
    <>
      <MarkdownCopyButton markdownUrl={markdownUrl} />
      <ViewOptionsPopover
        markdownUrl={markdownUrl}
        githubUrl={`${gitRepoUrl}/-/blob/${gitConfig.branch}/content/docs/${page.path}`}
      />
    </>
  );
  const figmaAction = <FigmaJumpButton href={figmaUrl} />;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <TinaDocsPageContent
        pagePath={page.path}
        initialPayload={tinaPayload}
        fallbackTitle={page.data.title}
        fallbackDescription={page.data.description}
        fallbackMaintainer={maintainer}
        fallbackMaintainerOpenId={maintainerOpenId}
        updatedAt={updatedAt}
        actions={actions}
        figmaAction={figmaAction}
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
