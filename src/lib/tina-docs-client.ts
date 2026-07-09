'use client';

import {
  Docsos4ComponentsActionsDocument,
  Docsos4ComponentsDisplayDocument,
  Docsos4ComponentsFeedbackDocument,
  Docsos4ComponentsInputsDocument,
  Docsos4ComponentsNavigationDocument,
  Docsos4ComponentsOverviewDocument,
  Docsos4FoundationsDocument,
  Docsos4OverviewDocument,
  Docsos4PatternsDocument,
  Docsos4ResourcesDocument,
  Docsos5ComponentsActionsDocument,
  Docsos5ComponentsDisplayDocument,
  Docsos5ComponentsFeedbackDocument,
  Docsos5ComponentsInputsDocument,
  Docsos5ComponentsNavigationDocument,
  Docsos5ComponentsOverviewDocument,
  Docsos5FoundationsDocument,
  Docsos5OverviewDocument,
  Docsos5PatternsDocument,
  Docsos5ResourcesDocument,
} from '../../tina/__generated__/types';
import {
  resolveTinaCollection,
  toTinaRelativePath,
  type TinaDocCollection,
  type TinaDocPayload,
} from '@/lib/tina-docs';

const collectionQueries: Record<TinaDocCollection, string> = {
  docsos4Overview: Docsos4OverviewDocument,
  docsos4Foundations: Docsos4FoundationsDocument,
  docsos4ComponentsOverview: Docsos4ComponentsOverviewDocument,
  docsos4ComponentsActions: Docsos4ComponentsActionsDocument,
  docsos4ComponentsInputs: Docsos4ComponentsInputsDocument,
  docsos4ComponentsNavigation: Docsos4ComponentsNavigationDocument,
  docsos4ComponentsFeedback: Docsos4ComponentsFeedbackDocument,
  docsos4ComponentsDisplay: Docsos4ComponentsDisplayDocument,
  docsos4Patterns: Docsos4PatternsDocument,
  docsos4Resources: Docsos4ResourcesDocument,
  docsos5Overview: Docsos5OverviewDocument,
  docsos5Foundations: Docsos5FoundationsDocument,
  docsos5ComponentsOverview: Docsos5ComponentsOverviewDocument,
  docsos5ComponentsActions: Docsos5ComponentsActionsDocument,
  docsos5ComponentsInputs: Docsos5ComponentsInputsDocument,
  docsos5ComponentsNavigation: Docsos5ComponentsNavigationDocument,
  docsos5ComponentsFeedback: Docsos5ComponentsFeedbackDocument,
  docsos5ComponentsDisplay: Docsos5ComponentsDisplayDocument,
  docsos5Patterns: Docsos5PatternsDocument,
  docsos5Resources: Docsos5ResourcesDocument,
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
