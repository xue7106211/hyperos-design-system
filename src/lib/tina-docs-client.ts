'use client';

import {
  DocsComponentsActionsDocument,
  DocsComponentsDisplayDocument,
  DocsComponentsFeedbackDocument,
  DocsComponentsInputsDocument,
  DocsComponentsNavigationDocument,
  DocsComponentsOverviewDocument,
  DocsFoundationsDocument,
  DocsOverviewDocument,
  DocsPatternsDocument,
  DocsResourcesDocument,
} from '../../tina/__generated__/types';
import {
  resolveTinaCollection,
  toTinaRelativePath,
  type TinaDocCollection,
  type TinaDocPayload,
} from '@/lib/tina-docs';

const collectionQueries: Record<TinaDocCollection, string> = {
  docsOverview: DocsOverviewDocument,
  docsFoundations: DocsFoundationsDocument,
  docsComponentsOverview: DocsComponentsOverviewDocument,
  docsComponentsActions: DocsComponentsActionsDocument,
  docsComponentsInputs: DocsComponentsInputsDocument,
  docsComponentsNavigation: DocsComponentsNavigationDocument,
  docsComponentsFeedback: DocsComponentsFeedbackDocument,
  docsComponentsDisplay: DocsComponentsDisplayDocument,
  docsPatterns: DocsPatternsDocument,
  docsResources: DocsResourcesDocument,
};

export async function fetchTinaDocClient(
  pagePath: string,
): Promise<TinaDocPayload | null> {
  const relativePath = toTinaRelativePath(pagePath);
  const collection = resolveTinaCollection(relativePath);
  if (!collection) return null;

  const query = collectionQueries[collection];

  try {
    const response = await fetch('/api/tina/gql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { relativePath },
      }),
    });

    if (!response.ok) return null;

    const json = (await response.json()) as {
      data?: Record<string, unknown>;
    };

    if (!json.data) return null;

    return {
      collection,
      data: json.data,
      query,
      variables: { relativePath },
    };
  } catch {
    return null;
  }
}
