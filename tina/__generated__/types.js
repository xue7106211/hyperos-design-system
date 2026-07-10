export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const Docsos4OverviewPartsFragmentDoc = gql`
    fragment Docsos4OverviewParts on Docsos4Overview {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4GeneralPartsFragmentDoc = gql`
    fragment Docsos4GeneralParts on Docsos4General {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4ComponentsOverviewPartsFragmentDoc = gql`
    fragment Docsos4ComponentsOverviewParts on Docsos4ComponentsOverview {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4ComponentsNavigationPartsFragmentDoc = gql`
    fragment Docsos4ComponentsNavigationParts on Docsos4ComponentsNavigation {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4ComponentsActionsPartsFragmentDoc = gql`
    fragment Docsos4ComponentsActionsParts on Docsos4ComponentsActions {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4ComponentsInputsPartsFragmentDoc = gql`
    fragment Docsos4ComponentsInputsParts on Docsos4ComponentsInputs {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4ComponentsContainersPartsFragmentDoc = gql`
    fragment Docsos4ComponentsContainersParts on Docsos4ComponentsContainers {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4ComponentsDisplayPartsFragmentDoc = gql`
    fragment Docsos4ComponentsDisplayParts on Docsos4ComponentsDisplay {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4InteractionPartsFragmentDoc = gql`
    fragment Docsos4InteractionParts on Docsos4Interaction {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4SystemPartsFragmentDoc = gql`
    fragment Docsos4SystemParts on Docsos4System {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4MultiDevicePartsFragmentDoc = gql`
    fragment Docsos4MultiDeviceParts on Docsos4MultiDevice {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4BestPracticesPartsFragmentDoc = gql`
    fragment Docsos4BestPracticesParts on Docsos4BestPractices {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5OverviewPartsFragmentDoc = gql`
    fragment Docsos5OverviewParts on Docsos5Overview {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5GeneralPartsFragmentDoc = gql`
    fragment Docsos5GeneralParts on Docsos5General {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5ComponentsOverviewPartsFragmentDoc = gql`
    fragment Docsos5ComponentsOverviewParts on Docsos5ComponentsOverview {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5ComponentsNavigationPartsFragmentDoc = gql`
    fragment Docsos5ComponentsNavigationParts on Docsos5ComponentsNavigation {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5ComponentsActionsPartsFragmentDoc = gql`
    fragment Docsos5ComponentsActionsParts on Docsos5ComponentsActions {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5ComponentsInputsPartsFragmentDoc = gql`
    fragment Docsos5ComponentsInputsParts on Docsos5ComponentsInputs {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5ComponentsContainersPartsFragmentDoc = gql`
    fragment Docsos5ComponentsContainersParts on Docsos5ComponentsContainers {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5ComponentsDisplayPartsFragmentDoc = gql`
    fragment Docsos5ComponentsDisplayParts on Docsos5ComponentsDisplay {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5InteractionPartsFragmentDoc = gql`
    fragment Docsos5InteractionParts on Docsos5Interaction {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5SystemPartsFragmentDoc = gql`
    fragment Docsos5SystemParts on Docsos5System {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5MultiDevicePartsFragmentDoc = gql`
    fragment Docsos5MultiDeviceParts on Docsos5MultiDevice {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5BestPracticesPartsFragmentDoc = gql`
    fragment Docsos5BestPracticesParts on Docsos5BestPractices {
  __typename
  title
  description
  maintainer
  maintainerOpenId
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4OverviewDocument = gql`
    query docsos4Overview($relativePath: String!) {
  docsos4Overview(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos4OverviewParts
  }
}
    ${Docsos4OverviewPartsFragmentDoc}`;
export const Docsos4OverviewConnectionDocument = gql`
    query docsos4OverviewConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4OverviewFilter) {
  docsos4OverviewConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos4OverviewParts
      }
    }
  }
}
    ${Docsos4OverviewPartsFragmentDoc}`;
export const Docsos4GeneralDocument = gql`
    query docsos4General($relativePath: String!) {
  docsos4General(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos4GeneralParts
  }
}
    ${Docsos4GeneralPartsFragmentDoc}`;
export const Docsos4GeneralConnectionDocument = gql`
    query docsos4GeneralConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4GeneralFilter) {
  docsos4GeneralConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos4GeneralParts
      }
    }
  }
}
    ${Docsos4GeneralPartsFragmentDoc}`;
export const Docsos4ComponentsOverviewDocument = gql`
    query docsos4ComponentsOverview($relativePath: String!) {
  docsos4ComponentsOverview(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos4ComponentsOverviewParts
  }
}
    ${Docsos4ComponentsOverviewPartsFragmentDoc}`;
export const Docsos4ComponentsOverviewConnectionDocument = gql`
    query docsos4ComponentsOverviewConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4ComponentsOverviewFilter) {
  docsos4ComponentsOverviewConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos4ComponentsOverviewParts
      }
    }
  }
}
    ${Docsos4ComponentsOverviewPartsFragmentDoc}`;
export const Docsos4ComponentsNavigationDocument = gql`
    query docsos4ComponentsNavigation($relativePath: String!) {
  docsos4ComponentsNavigation(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos4ComponentsNavigationParts
  }
}
    ${Docsos4ComponentsNavigationPartsFragmentDoc}`;
export const Docsos4ComponentsNavigationConnectionDocument = gql`
    query docsos4ComponentsNavigationConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4ComponentsNavigationFilter) {
  docsos4ComponentsNavigationConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos4ComponentsNavigationParts
      }
    }
  }
}
    ${Docsos4ComponentsNavigationPartsFragmentDoc}`;
export const Docsos4ComponentsActionsDocument = gql`
    query docsos4ComponentsActions($relativePath: String!) {
  docsos4ComponentsActions(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos4ComponentsActionsParts
  }
}
    ${Docsos4ComponentsActionsPartsFragmentDoc}`;
export const Docsos4ComponentsActionsConnectionDocument = gql`
    query docsos4ComponentsActionsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4ComponentsActionsFilter) {
  docsos4ComponentsActionsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos4ComponentsActionsParts
      }
    }
  }
}
    ${Docsos4ComponentsActionsPartsFragmentDoc}`;
export const Docsos4ComponentsInputsDocument = gql`
    query docsos4ComponentsInputs($relativePath: String!) {
  docsos4ComponentsInputs(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos4ComponentsInputsParts
  }
}
    ${Docsos4ComponentsInputsPartsFragmentDoc}`;
export const Docsos4ComponentsInputsConnectionDocument = gql`
    query docsos4ComponentsInputsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4ComponentsInputsFilter) {
  docsos4ComponentsInputsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos4ComponentsInputsParts
      }
    }
  }
}
    ${Docsos4ComponentsInputsPartsFragmentDoc}`;
export const Docsos4ComponentsContainersDocument = gql`
    query docsos4ComponentsContainers($relativePath: String!) {
  docsos4ComponentsContainers(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos4ComponentsContainersParts
  }
}
    ${Docsos4ComponentsContainersPartsFragmentDoc}`;
export const Docsos4ComponentsContainersConnectionDocument = gql`
    query docsos4ComponentsContainersConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4ComponentsContainersFilter) {
  docsos4ComponentsContainersConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos4ComponentsContainersParts
      }
    }
  }
}
    ${Docsos4ComponentsContainersPartsFragmentDoc}`;
export const Docsos4ComponentsDisplayDocument = gql`
    query docsos4ComponentsDisplay($relativePath: String!) {
  docsos4ComponentsDisplay(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos4ComponentsDisplayParts
  }
}
    ${Docsos4ComponentsDisplayPartsFragmentDoc}`;
export const Docsos4ComponentsDisplayConnectionDocument = gql`
    query docsos4ComponentsDisplayConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4ComponentsDisplayFilter) {
  docsos4ComponentsDisplayConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos4ComponentsDisplayParts
      }
    }
  }
}
    ${Docsos4ComponentsDisplayPartsFragmentDoc}`;
export const Docsos4InteractionDocument = gql`
    query docsos4Interaction($relativePath: String!) {
  docsos4Interaction(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos4InteractionParts
  }
}
    ${Docsos4InteractionPartsFragmentDoc}`;
export const Docsos4InteractionConnectionDocument = gql`
    query docsos4InteractionConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4InteractionFilter) {
  docsos4InteractionConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos4InteractionParts
      }
    }
  }
}
    ${Docsos4InteractionPartsFragmentDoc}`;
export const Docsos4SystemDocument = gql`
    query docsos4System($relativePath: String!) {
  docsos4System(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos4SystemParts
  }
}
    ${Docsos4SystemPartsFragmentDoc}`;
export const Docsos4SystemConnectionDocument = gql`
    query docsos4SystemConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4SystemFilter) {
  docsos4SystemConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos4SystemParts
      }
    }
  }
}
    ${Docsos4SystemPartsFragmentDoc}`;
export const Docsos4MultiDeviceDocument = gql`
    query docsos4MultiDevice($relativePath: String!) {
  docsos4MultiDevice(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos4MultiDeviceParts
  }
}
    ${Docsos4MultiDevicePartsFragmentDoc}`;
export const Docsos4MultiDeviceConnectionDocument = gql`
    query docsos4MultiDeviceConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4MultiDeviceFilter) {
  docsos4MultiDeviceConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos4MultiDeviceParts
      }
    }
  }
}
    ${Docsos4MultiDevicePartsFragmentDoc}`;
export const Docsos4BestPracticesDocument = gql`
    query docsos4BestPractices($relativePath: String!) {
  docsos4BestPractices(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos4BestPracticesParts
  }
}
    ${Docsos4BestPracticesPartsFragmentDoc}`;
export const Docsos4BestPracticesConnectionDocument = gql`
    query docsos4BestPracticesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4BestPracticesFilter) {
  docsos4BestPracticesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos4BestPracticesParts
      }
    }
  }
}
    ${Docsos4BestPracticesPartsFragmentDoc}`;
export const Docsos5OverviewDocument = gql`
    query docsos5Overview($relativePath: String!) {
  docsos5Overview(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos5OverviewParts
  }
}
    ${Docsos5OverviewPartsFragmentDoc}`;
export const Docsos5OverviewConnectionDocument = gql`
    query docsos5OverviewConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5OverviewFilter) {
  docsos5OverviewConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos5OverviewParts
      }
    }
  }
}
    ${Docsos5OverviewPartsFragmentDoc}`;
export const Docsos5GeneralDocument = gql`
    query docsos5General($relativePath: String!) {
  docsos5General(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos5GeneralParts
  }
}
    ${Docsos5GeneralPartsFragmentDoc}`;
export const Docsos5GeneralConnectionDocument = gql`
    query docsos5GeneralConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5GeneralFilter) {
  docsos5GeneralConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos5GeneralParts
      }
    }
  }
}
    ${Docsos5GeneralPartsFragmentDoc}`;
export const Docsos5ComponentsOverviewDocument = gql`
    query docsos5ComponentsOverview($relativePath: String!) {
  docsos5ComponentsOverview(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos5ComponentsOverviewParts
  }
}
    ${Docsos5ComponentsOverviewPartsFragmentDoc}`;
export const Docsos5ComponentsOverviewConnectionDocument = gql`
    query docsos5ComponentsOverviewConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5ComponentsOverviewFilter) {
  docsos5ComponentsOverviewConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos5ComponentsOverviewParts
      }
    }
  }
}
    ${Docsos5ComponentsOverviewPartsFragmentDoc}`;
export const Docsos5ComponentsNavigationDocument = gql`
    query docsos5ComponentsNavigation($relativePath: String!) {
  docsos5ComponentsNavigation(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos5ComponentsNavigationParts
  }
}
    ${Docsos5ComponentsNavigationPartsFragmentDoc}`;
export const Docsos5ComponentsNavigationConnectionDocument = gql`
    query docsos5ComponentsNavigationConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5ComponentsNavigationFilter) {
  docsos5ComponentsNavigationConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos5ComponentsNavigationParts
      }
    }
  }
}
    ${Docsos5ComponentsNavigationPartsFragmentDoc}`;
export const Docsos5ComponentsActionsDocument = gql`
    query docsos5ComponentsActions($relativePath: String!) {
  docsos5ComponentsActions(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos5ComponentsActionsParts
  }
}
    ${Docsos5ComponentsActionsPartsFragmentDoc}`;
export const Docsos5ComponentsActionsConnectionDocument = gql`
    query docsos5ComponentsActionsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5ComponentsActionsFilter) {
  docsos5ComponentsActionsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos5ComponentsActionsParts
      }
    }
  }
}
    ${Docsos5ComponentsActionsPartsFragmentDoc}`;
export const Docsos5ComponentsInputsDocument = gql`
    query docsos5ComponentsInputs($relativePath: String!) {
  docsos5ComponentsInputs(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos5ComponentsInputsParts
  }
}
    ${Docsos5ComponentsInputsPartsFragmentDoc}`;
export const Docsos5ComponentsInputsConnectionDocument = gql`
    query docsos5ComponentsInputsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5ComponentsInputsFilter) {
  docsos5ComponentsInputsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos5ComponentsInputsParts
      }
    }
  }
}
    ${Docsos5ComponentsInputsPartsFragmentDoc}`;
export const Docsos5ComponentsContainersDocument = gql`
    query docsos5ComponentsContainers($relativePath: String!) {
  docsos5ComponentsContainers(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos5ComponentsContainersParts
  }
}
    ${Docsos5ComponentsContainersPartsFragmentDoc}`;
export const Docsos5ComponentsContainersConnectionDocument = gql`
    query docsos5ComponentsContainersConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5ComponentsContainersFilter) {
  docsos5ComponentsContainersConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos5ComponentsContainersParts
      }
    }
  }
}
    ${Docsos5ComponentsContainersPartsFragmentDoc}`;
export const Docsos5ComponentsDisplayDocument = gql`
    query docsos5ComponentsDisplay($relativePath: String!) {
  docsos5ComponentsDisplay(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos5ComponentsDisplayParts
  }
}
    ${Docsos5ComponentsDisplayPartsFragmentDoc}`;
export const Docsos5ComponentsDisplayConnectionDocument = gql`
    query docsos5ComponentsDisplayConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5ComponentsDisplayFilter) {
  docsos5ComponentsDisplayConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos5ComponentsDisplayParts
      }
    }
  }
}
    ${Docsos5ComponentsDisplayPartsFragmentDoc}`;
export const Docsos5InteractionDocument = gql`
    query docsos5Interaction($relativePath: String!) {
  docsos5Interaction(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos5InteractionParts
  }
}
    ${Docsos5InteractionPartsFragmentDoc}`;
export const Docsos5InteractionConnectionDocument = gql`
    query docsos5InteractionConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5InteractionFilter) {
  docsos5InteractionConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos5InteractionParts
      }
    }
  }
}
    ${Docsos5InteractionPartsFragmentDoc}`;
export const Docsos5SystemDocument = gql`
    query docsos5System($relativePath: String!) {
  docsos5System(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos5SystemParts
  }
}
    ${Docsos5SystemPartsFragmentDoc}`;
export const Docsos5SystemConnectionDocument = gql`
    query docsos5SystemConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5SystemFilter) {
  docsos5SystemConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos5SystemParts
      }
    }
  }
}
    ${Docsos5SystemPartsFragmentDoc}`;
export const Docsos5MultiDeviceDocument = gql`
    query docsos5MultiDevice($relativePath: String!) {
  docsos5MultiDevice(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos5MultiDeviceParts
  }
}
    ${Docsos5MultiDevicePartsFragmentDoc}`;
export const Docsos5MultiDeviceConnectionDocument = gql`
    query docsos5MultiDeviceConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5MultiDeviceFilter) {
  docsos5MultiDeviceConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos5MultiDeviceParts
      }
    }
  }
}
    ${Docsos5MultiDevicePartsFragmentDoc}`;
export const Docsos5BestPracticesDocument = gql`
    query docsos5BestPractices($relativePath: String!) {
  docsos5BestPractices(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...Docsos5BestPracticesParts
  }
}
    ${Docsos5BestPracticesPartsFragmentDoc}`;
export const Docsos5BestPracticesConnectionDocument = gql`
    query docsos5BestPracticesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5BestPracticesFilter) {
  docsos5BestPracticesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...Docsos5BestPracticesParts
      }
    }
  }
}
    ${Docsos5BestPracticesPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    docsos4Overview(variables, options) {
      return requester(Docsos4OverviewDocument, variables, options);
    },
    docsos4OverviewConnection(variables, options) {
      return requester(Docsos4OverviewConnectionDocument, variables, options);
    },
    docsos4General(variables, options) {
      return requester(Docsos4GeneralDocument, variables, options);
    },
    docsos4GeneralConnection(variables, options) {
      return requester(Docsos4GeneralConnectionDocument, variables, options);
    },
    docsos4ComponentsOverview(variables, options) {
      return requester(Docsos4ComponentsOverviewDocument, variables, options);
    },
    docsos4ComponentsOverviewConnection(variables, options) {
      return requester(Docsos4ComponentsOverviewConnectionDocument, variables, options);
    },
    docsos4ComponentsNavigation(variables, options) {
      return requester(Docsos4ComponentsNavigationDocument, variables, options);
    },
    docsos4ComponentsNavigationConnection(variables, options) {
      return requester(Docsos4ComponentsNavigationConnectionDocument, variables, options);
    },
    docsos4ComponentsActions(variables, options) {
      return requester(Docsos4ComponentsActionsDocument, variables, options);
    },
    docsos4ComponentsActionsConnection(variables, options) {
      return requester(Docsos4ComponentsActionsConnectionDocument, variables, options);
    },
    docsos4ComponentsInputs(variables, options) {
      return requester(Docsos4ComponentsInputsDocument, variables, options);
    },
    docsos4ComponentsInputsConnection(variables, options) {
      return requester(Docsos4ComponentsInputsConnectionDocument, variables, options);
    },
    docsos4ComponentsContainers(variables, options) {
      return requester(Docsos4ComponentsContainersDocument, variables, options);
    },
    docsos4ComponentsContainersConnection(variables, options) {
      return requester(Docsos4ComponentsContainersConnectionDocument, variables, options);
    },
    docsos4ComponentsDisplay(variables, options) {
      return requester(Docsos4ComponentsDisplayDocument, variables, options);
    },
    docsos4ComponentsDisplayConnection(variables, options) {
      return requester(Docsos4ComponentsDisplayConnectionDocument, variables, options);
    },
    docsos4Interaction(variables, options) {
      return requester(Docsos4InteractionDocument, variables, options);
    },
    docsos4InteractionConnection(variables, options) {
      return requester(Docsos4InteractionConnectionDocument, variables, options);
    },
    docsos4System(variables, options) {
      return requester(Docsos4SystemDocument, variables, options);
    },
    docsos4SystemConnection(variables, options) {
      return requester(Docsos4SystemConnectionDocument, variables, options);
    },
    docsos4MultiDevice(variables, options) {
      return requester(Docsos4MultiDeviceDocument, variables, options);
    },
    docsos4MultiDeviceConnection(variables, options) {
      return requester(Docsos4MultiDeviceConnectionDocument, variables, options);
    },
    docsos4BestPractices(variables, options) {
      return requester(Docsos4BestPracticesDocument, variables, options);
    },
    docsos4BestPracticesConnection(variables, options) {
      return requester(Docsos4BestPracticesConnectionDocument, variables, options);
    },
    docsos5Overview(variables, options) {
      return requester(Docsos5OverviewDocument, variables, options);
    },
    docsos5OverviewConnection(variables, options) {
      return requester(Docsos5OverviewConnectionDocument, variables, options);
    },
    docsos5General(variables, options) {
      return requester(Docsos5GeneralDocument, variables, options);
    },
    docsos5GeneralConnection(variables, options) {
      return requester(Docsos5GeneralConnectionDocument, variables, options);
    },
    docsos5ComponentsOverview(variables, options) {
      return requester(Docsos5ComponentsOverviewDocument, variables, options);
    },
    docsos5ComponentsOverviewConnection(variables, options) {
      return requester(Docsos5ComponentsOverviewConnectionDocument, variables, options);
    },
    docsos5ComponentsNavigation(variables, options) {
      return requester(Docsos5ComponentsNavigationDocument, variables, options);
    },
    docsos5ComponentsNavigationConnection(variables, options) {
      return requester(Docsos5ComponentsNavigationConnectionDocument, variables, options);
    },
    docsos5ComponentsActions(variables, options) {
      return requester(Docsos5ComponentsActionsDocument, variables, options);
    },
    docsos5ComponentsActionsConnection(variables, options) {
      return requester(Docsos5ComponentsActionsConnectionDocument, variables, options);
    },
    docsos5ComponentsInputs(variables, options) {
      return requester(Docsos5ComponentsInputsDocument, variables, options);
    },
    docsos5ComponentsInputsConnection(variables, options) {
      return requester(Docsos5ComponentsInputsConnectionDocument, variables, options);
    },
    docsos5ComponentsContainers(variables, options) {
      return requester(Docsos5ComponentsContainersDocument, variables, options);
    },
    docsos5ComponentsContainersConnection(variables, options) {
      return requester(Docsos5ComponentsContainersConnectionDocument, variables, options);
    },
    docsos5ComponentsDisplay(variables, options) {
      return requester(Docsos5ComponentsDisplayDocument, variables, options);
    },
    docsos5ComponentsDisplayConnection(variables, options) {
      return requester(Docsos5ComponentsDisplayConnectionDocument, variables, options);
    },
    docsos5Interaction(variables, options) {
      return requester(Docsos5InteractionDocument, variables, options);
    },
    docsos5InteractionConnection(variables, options) {
      return requester(Docsos5InteractionConnectionDocument, variables, options);
    },
    docsos5System(variables, options) {
      return requester(Docsos5SystemDocument, variables, options);
    },
    docsos5SystemConnection(variables, options) {
      return requester(Docsos5SystemConnectionDocument, variables, options);
    },
    docsos5MultiDevice(variables, options) {
      return requester(Docsos5MultiDeviceDocument, variables, options);
    },
    docsos5MultiDeviceConnection(variables, options) {
      return requester(Docsos5MultiDeviceConnectionDocument, variables, options);
    },
    docsos5BestPractices(variables, options) {
      return requester(Docsos5BestPracticesDocument, variables, options);
    },
    docsos5BestPracticesConnection(variables, options) {
      return requester(Docsos5BestPracticesConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "/api/tina/gql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
