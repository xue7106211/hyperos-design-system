import tinaClient from '../../tina/__generated__/client';
import type { DocsVersionId } from './shared';

const docVersions: DocsVersionId[] = ['os4', 'os5'];

const sectionMatchers = [
  { suffix: 'Overview', match: (path: string) => path === 'index.mdx' },
  { suffix: 'General', match: (path: string) => path.startsWith('general/') },
  {
    suffix: 'ComponentsOverview',
    match: (path: string) => path === 'components/index.mdx',
  },
  {
    suffix: 'ComponentsNavigation',
    match: (path: string) => path.startsWith('components/navigation/'),
  },
  {
    suffix: 'ComponentsActions',
    match: (path: string) => path.startsWith('components/actions/'),
  },
  {
    suffix: 'ComponentsInputs',
    match: (path: string) => path.startsWith('components/inputs/'),
  },
  {
    suffix: 'ComponentsContainers',
    match: (path: string) => path.startsWith('components/containers/'),
  },
  {
    suffix: 'ComponentsDisplay',
    match: (path: string) => path.startsWith('components/display/'),
  },
  { suffix: 'Interaction', match: (path: string) => path.startsWith('interaction/') },
  { suffix: 'System', match: (path: string) => path.startsWith('system/') },
  { suffix: 'MultiDevice', match: (path: string) => path.startsWith('multi-device/') },
  { suffix: 'BestPractices', match: (path: string) => path.startsWith('best-practices/') },
] as const;

export const TINA_DOC_COLLECTIONS = docVersions.flatMap((version) =>
  sectionMatchers.map((section) => `docs${version}${section.suffix}` as const),
);

export type TinaDocCollection = (typeof TINA_DOC_COLLECTIONS)[number];

export type TinaDocPayload = {
  collection: TinaDocCollection;
  data: Record<string, unknown>;
  query: string;
  variables: { relativePath: string };
};

const queryFns = Object.fromEntries(
  TINA_DOC_COLLECTIONS.map((collection) => [
    collection,
    tinaClient.queries[collection as keyof typeof tinaClient.queries],
  ]),
) as unknown as Record<
  TinaDocCollection,
  (vars: { relativePath: string }) => Promise<{
    data?: Record<string, unknown>;
    query: string;
    variables: { relativePath: string };
  }>
>;

export function toTinaRelativePath(pagePath: string): string {
  return pagePath.endsWith('.mdx') ? pagePath : `${pagePath}.mdx`;
}

export function resolveTinaCollection(relativePath: string): TinaDocCollection | null {
  const [version, ...rest] = relativePath.split('/');
  if (!docVersions.includes(version as DocsVersionId)) return null;

  const sectionPath = rest.join('/');
  const section = sectionMatchers.find((item) => item.match(sectionPath));
  if (!section) return null;

  return `docs${version}${section.suffix}` as TinaDocCollection;
}

export async function fetchTinaDoc(pagePath: string): Promise<TinaDocPayload | null> {
  const relativePath = toTinaRelativePath(pagePath);
  const collection = resolveTinaCollection(relativePath);
  if (!collection) return null;

  try {
    const response = await queryFns[collection]({ relativePath });
    if (!response.data) return null;

    return {
      collection,
      data: response.data as Record<string, unknown>,
      query: response.query,
      variables: response.variables as { relativePath: string },
    };
  } catch {
    return null;
  }
}

export function getDocumentFromPayload(payload: TinaDocPayload): Record<string, unknown> | null {
  const doc = payload.data[payload.collection];
  if (!doc || typeof doc !== 'object') return null;
  return doc as Record<string, unknown>;
}

export { tinaClient };
