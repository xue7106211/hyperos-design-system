import tinaClient from '../../tina/__generated__/client';

export const TINA_DOC_COLLECTIONS = [
  'docsOverview',
  'docsFoundations',
  'docsComponentsOverview',
  'docsComponentsActions',
  'docsComponentsInputs',
  'docsComponentsNavigation',
  'docsComponentsFeedback',
  'docsComponentsDisplay',
  'docsPatterns',
  'docsResources',
] as const;

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
  if (relativePath === 'index.mdx') return 'docsOverview';
  if (relativePath.startsWith('foundations/')) return 'docsFoundations';
  if (relativePath === 'components/index.mdx') return 'docsComponentsOverview';
  if (relativePath.startsWith('components/actions/')) return 'docsComponentsActions';
  if (relativePath.startsWith('components/inputs/')) return 'docsComponentsInputs';
  if (relativePath.startsWith('components/navigation/')) return 'docsComponentsNavigation';
  if (relativePath.startsWith('components/feedback/')) return 'docsComponentsFeedback';
  if (relativePath.startsWith('components/display/')) return 'docsComponentsDisplay';
  if (relativePath.startsWith('patterns/')) return 'docsPatterns';
  if (relativePath.startsWith('resources/')) return 'docsResources';
  return null;
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
