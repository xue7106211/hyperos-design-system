'use client';

import {
  Docsos4BestPracticesDocument,
  Docsos4ComponentsActionsDocument,
  Docsos4ComponentsContainersDocument,
  Docsos4ComponentsDisplayDocument,
  Docsos4ComponentsInputsDocument,
  Docsos4ComponentsNavigationDocument,
  Docsos4ComponentsOverviewDocument,
  Docsos4GeneralDocument,
  Docsos4InteractionDocument,
  Docsos4MultiDeviceDocument,
  Docsos4OverviewDocument,
  Docsos4SystemDocument,
  Docsos5BestPracticesDocument,
  Docsos5ComponentsActionsDocument,
  Docsos5ComponentsContainersDocument,
  Docsos5ComponentsDisplayDocument,
  Docsos5ComponentsInputsDocument,
  Docsos5ComponentsNavigationDocument,
  Docsos5ComponentsOverviewDocument,
  Docsos5GeneralDocument,
  Docsos5InteractionDocument,
  Docsos5MultiDeviceDocument,
  Docsos5OverviewDocument,
  Docsos5SystemDocument,
} from '../../tina/__generated__/types';
import {
  resolveTinaCollection,
  toTinaRelativePath,
  type TinaDocCollection,
  type TinaDocPayload,
} from '@/lib/tina-docs';

const collectionQueries: Record<TinaDocCollection, string> = {
  docsos4Overview: Docsos4OverviewDocument,
  docsos4General: Docsos4GeneralDocument,
  docsos4ComponentsOverview: Docsos4ComponentsOverviewDocument,
  docsos4ComponentsNavigation: Docsos4ComponentsNavigationDocument,
  docsos4ComponentsActions: Docsos4ComponentsActionsDocument,
  docsos4ComponentsInputs: Docsos4ComponentsInputsDocument,
  docsos4ComponentsContainers: Docsos4ComponentsContainersDocument,
  docsos4ComponentsDisplay: Docsos4ComponentsDisplayDocument,
  docsos4Interaction: Docsos4InteractionDocument,
  docsos4System: Docsos4SystemDocument,
  docsos4MultiDevice: Docsos4MultiDeviceDocument,
  docsos4BestPractices: Docsos4BestPracticesDocument,
  docsos5Overview: Docsos5OverviewDocument,
  docsos5General: Docsos5GeneralDocument,
  docsos5ComponentsOverview: Docsos5ComponentsOverviewDocument,
  docsos5ComponentsNavigation: Docsos5ComponentsNavigationDocument,
  docsos5ComponentsActions: Docsos5ComponentsActionsDocument,
  docsos5ComponentsInputs: Docsos5ComponentsInputsDocument,
  docsos5ComponentsContainers: Docsos5ComponentsContainersDocument,
  docsos5ComponentsDisplay: Docsos5ComponentsDisplayDocument,
  docsos5Interaction: Docsos5InteractionDocument,
  docsos5System: Docsos5SystemDocument,
  docsos5MultiDevice: Docsos5MultiDeviceDocument,
  docsos5BestPractices: Docsos5BestPracticesDocument,
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
