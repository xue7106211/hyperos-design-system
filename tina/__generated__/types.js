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
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4FoundationsPartsFragmentDoc = gql`
    fragment Docsos4FoundationsParts on Docsos4Foundations {
  __typename
  title
  description
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
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4ComponentsFeedbackPartsFragmentDoc = gql`
    fragment Docsos4ComponentsFeedbackParts on Docsos4ComponentsFeedback {
  __typename
  title
  description
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
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4PatternsPartsFragmentDoc = gql`
    fragment Docsos4PatternsParts on Docsos4Patterns {
  __typename
  title
  description
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos4ResourcesPartsFragmentDoc = gql`
    fragment Docsos4ResourcesParts on Docsos4Resources {
  __typename
  title
  description
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
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5FoundationsPartsFragmentDoc = gql`
    fragment Docsos5FoundationsParts on Docsos5Foundations {
  __typename
  title
  description
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
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5ComponentsFeedbackPartsFragmentDoc = gql`
    fragment Docsos5ComponentsFeedbackParts on Docsos5ComponentsFeedback {
  __typename
  title
  description
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
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5PatternsPartsFragmentDoc = gql`
    fragment Docsos5PatternsParts on Docsos5Patterns {
  __typename
  title
  description
  status
  platforms
  figmaFileKey
  figmaNodeId
  figmaPrototypeUrl
  tokenGroups
  body
}
    `;
export const Docsos5ResourcesPartsFragmentDoc = gql`
    fragment Docsos5ResourcesParts on Docsos5Resources {
  __typename
  title
  description
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
export const Docsos4FoundationsDocument = gql`
    query docsos4Foundations($relativePath: String!) {
  docsos4Foundations(relativePath: $relativePath) {
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
    ...Docsos4FoundationsParts
  }
}
    ${Docsos4FoundationsPartsFragmentDoc}`;
export const Docsos4FoundationsConnectionDocument = gql`
    query docsos4FoundationsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4FoundationsFilter) {
  docsos4FoundationsConnection(
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
        ...Docsos4FoundationsParts
      }
    }
  }
}
    ${Docsos4FoundationsPartsFragmentDoc}`;
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
export const Docsos4ComponentsFeedbackDocument = gql`
    query docsos4ComponentsFeedback($relativePath: String!) {
  docsos4ComponentsFeedback(relativePath: $relativePath) {
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
    ...Docsos4ComponentsFeedbackParts
  }
}
    ${Docsos4ComponentsFeedbackPartsFragmentDoc}`;
export const Docsos4ComponentsFeedbackConnectionDocument = gql`
    query docsos4ComponentsFeedbackConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4ComponentsFeedbackFilter) {
  docsos4ComponentsFeedbackConnection(
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
        ...Docsos4ComponentsFeedbackParts
      }
    }
  }
}
    ${Docsos4ComponentsFeedbackPartsFragmentDoc}`;
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
export const Docsos4PatternsDocument = gql`
    query docsos4Patterns($relativePath: String!) {
  docsos4Patterns(relativePath: $relativePath) {
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
    ...Docsos4PatternsParts
  }
}
    ${Docsos4PatternsPartsFragmentDoc}`;
export const Docsos4PatternsConnectionDocument = gql`
    query docsos4PatternsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4PatternsFilter) {
  docsos4PatternsConnection(
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
        ...Docsos4PatternsParts
      }
    }
  }
}
    ${Docsos4PatternsPartsFragmentDoc}`;
export const Docsos4ResourcesDocument = gql`
    query docsos4Resources($relativePath: String!) {
  docsos4Resources(relativePath: $relativePath) {
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
    ...Docsos4ResourcesParts
  }
}
    ${Docsos4ResourcesPartsFragmentDoc}`;
export const Docsos4ResourcesConnectionDocument = gql`
    query docsos4ResourcesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos4ResourcesFilter) {
  docsos4ResourcesConnection(
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
        ...Docsos4ResourcesParts
      }
    }
  }
}
    ${Docsos4ResourcesPartsFragmentDoc}`;
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
export const Docsos5FoundationsDocument = gql`
    query docsos5Foundations($relativePath: String!) {
  docsos5Foundations(relativePath: $relativePath) {
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
    ...Docsos5FoundationsParts
  }
}
    ${Docsos5FoundationsPartsFragmentDoc}`;
export const Docsos5FoundationsConnectionDocument = gql`
    query docsos5FoundationsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5FoundationsFilter) {
  docsos5FoundationsConnection(
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
        ...Docsos5FoundationsParts
      }
    }
  }
}
    ${Docsos5FoundationsPartsFragmentDoc}`;
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
export const Docsos5ComponentsFeedbackDocument = gql`
    query docsos5ComponentsFeedback($relativePath: String!) {
  docsos5ComponentsFeedback(relativePath: $relativePath) {
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
    ...Docsos5ComponentsFeedbackParts
  }
}
    ${Docsos5ComponentsFeedbackPartsFragmentDoc}`;
export const Docsos5ComponentsFeedbackConnectionDocument = gql`
    query docsos5ComponentsFeedbackConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5ComponentsFeedbackFilter) {
  docsos5ComponentsFeedbackConnection(
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
        ...Docsos5ComponentsFeedbackParts
      }
    }
  }
}
    ${Docsos5ComponentsFeedbackPartsFragmentDoc}`;
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
export const Docsos5PatternsDocument = gql`
    query docsos5Patterns($relativePath: String!) {
  docsos5Patterns(relativePath: $relativePath) {
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
    ...Docsos5PatternsParts
  }
}
    ${Docsos5PatternsPartsFragmentDoc}`;
export const Docsos5PatternsConnectionDocument = gql`
    query docsos5PatternsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5PatternsFilter) {
  docsos5PatternsConnection(
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
        ...Docsos5PatternsParts
      }
    }
  }
}
    ${Docsos5PatternsPartsFragmentDoc}`;
export const Docsos5ResourcesDocument = gql`
    query docsos5Resources($relativePath: String!) {
  docsos5Resources(relativePath: $relativePath) {
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
    ...Docsos5ResourcesParts
  }
}
    ${Docsos5ResourcesPartsFragmentDoc}`;
export const Docsos5ResourcesConnectionDocument = gql`
    query docsos5ResourcesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: Docsos5ResourcesFilter) {
  docsos5ResourcesConnection(
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
        ...Docsos5ResourcesParts
      }
    }
  }
}
    ${Docsos5ResourcesPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    docsos4Overview(variables, options) {
      return requester(Docsos4OverviewDocument, variables, options);
    },
    docsos4OverviewConnection(variables, options) {
      return requester(Docsos4OverviewConnectionDocument, variables, options);
    },
    docsos4Foundations(variables, options) {
      return requester(Docsos4FoundationsDocument, variables, options);
    },
    docsos4FoundationsConnection(variables, options) {
      return requester(Docsos4FoundationsConnectionDocument, variables, options);
    },
    docsos4ComponentsOverview(variables, options) {
      return requester(Docsos4ComponentsOverviewDocument, variables, options);
    },
    docsos4ComponentsOverviewConnection(variables, options) {
      return requester(Docsos4ComponentsOverviewConnectionDocument, variables, options);
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
    docsos4ComponentsNavigation(variables, options) {
      return requester(Docsos4ComponentsNavigationDocument, variables, options);
    },
    docsos4ComponentsNavigationConnection(variables, options) {
      return requester(Docsos4ComponentsNavigationConnectionDocument, variables, options);
    },
    docsos4ComponentsFeedback(variables, options) {
      return requester(Docsos4ComponentsFeedbackDocument, variables, options);
    },
    docsos4ComponentsFeedbackConnection(variables, options) {
      return requester(Docsos4ComponentsFeedbackConnectionDocument, variables, options);
    },
    docsos4ComponentsDisplay(variables, options) {
      return requester(Docsos4ComponentsDisplayDocument, variables, options);
    },
    docsos4ComponentsDisplayConnection(variables, options) {
      return requester(Docsos4ComponentsDisplayConnectionDocument, variables, options);
    },
    docsos4Patterns(variables, options) {
      return requester(Docsos4PatternsDocument, variables, options);
    },
    docsos4PatternsConnection(variables, options) {
      return requester(Docsos4PatternsConnectionDocument, variables, options);
    },
    docsos4Resources(variables, options) {
      return requester(Docsos4ResourcesDocument, variables, options);
    },
    docsos4ResourcesConnection(variables, options) {
      return requester(Docsos4ResourcesConnectionDocument, variables, options);
    },
    docsos5Overview(variables, options) {
      return requester(Docsos5OverviewDocument, variables, options);
    },
    docsos5OverviewConnection(variables, options) {
      return requester(Docsos5OverviewConnectionDocument, variables, options);
    },
    docsos5Foundations(variables, options) {
      return requester(Docsos5FoundationsDocument, variables, options);
    },
    docsos5FoundationsConnection(variables, options) {
      return requester(Docsos5FoundationsConnectionDocument, variables, options);
    },
    docsos5ComponentsOverview(variables, options) {
      return requester(Docsos5ComponentsOverviewDocument, variables, options);
    },
    docsos5ComponentsOverviewConnection(variables, options) {
      return requester(Docsos5ComponentsOverviewConnectionDocument, variables, options);
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
    docsos5ComponentsNavigation(variables, options) {
      return requester(Docsos5ComponentsNavigationDocument, variables, options);
    },
    docsos5ComponentsNavigationConnection(variables, options) {
      return requester(Docsos5ComponentsNavigationConnectionDocument, variables, options);
    },
    docsos5ComponentsFeedback(variables, options) {
      return requester(Docsos5ComponentsFeedbackDocument, variables, options);
    },
    docsos5ComponentsFeedbackConnection(variables, options) {
      return requester(Docsos5ComponentsFeedbackConnectionDocument, variables, options);
    },
    docsos5ComponentsDisplay(variables, options) {
      return requester(Docsos5ComponentsDisplayDocument, variables, options);
    },
    docsos5ComponentsDisplayConnection(variables, options) {
      return requester(Docsos5ComponentsDisplayConnectionDocument, variables, options);
    },
    docsos5Patterns(variables, options) {
      return requester(Docsos5PatternsDocument, variables, options);
    },
    docsos5PatternsConnection(variables, options) {
      return requester(Docsos5PatternsConnectionDocument, variables, options);
    },
    docsos5Resources(variables, options) {
      return requester(Docsos5ResourcesDocument, variables, options);
    },
    docsos5ResourcesConnection(variables, options) {
      return requester(Docsos5ResourcesConnectionDocument, variables, options);
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
