export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const DocsOverviewPartsFragmentDoc = gql`
    fragment DocsOverviewParts on DocsOverview {
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
export const DocsFoundationsPartsFragmentDoc = gql`
    fragment DocsFoundationsParts on DocsFoundations {
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
export const DocsComponentsOverviewPartsFragmentDoc = gql`
    fragment DocsComponentsOverviewParts on DocsComponentsOverview {
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
export const DocsComponentsActionsPartsFragmentDoc = gql`
    fragment DocsComponentsActionsParts on DocsComponentsActions {
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
export const DocsComponentsInputsPartsFragmentDoc = gql`
    fragment DocsComponentsInputsParts on DocsComponentsInputs {
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
export const DocsComponentsNavigationPartsFragmentDoc = gql`
    fragment DocsComponentsNavigationParts on DocsComponentsNavigation {
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
export const DocsComponentsFeedbackPartsFragmentDoc = gql`
    fragment DocsComponentsFeedbackParts on DocsComponentsFeedback {
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
export const DocsComponentsDisplayPartsFragmentDoc = gql`
    fragment DocsComponentsDisplayParts on DocsComponentsDisplay {
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
export const DocsPatternsPartsFragmentDoc = gql`
    fragment DocsPatternsParts on DocsPatterns {
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
export const DocsResourcesPartsFragmentDoc = gql`
    fragment DocsResourcesParts on DocsResources {
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
export const DocsOverviewDocument = gql`
    query docsOverview($relativePath: String!) {
  docsOverview(relativePath: $relativePath) {
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
    ...DocsOverviewParts
  }
}
    ${DocsOverviewPartsFragmentDoc}`;
export const DocsOverviewConnectionDocument = gql`
    query docsOverviewConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: DocsOverviewFilter) {
  docsOverviewConnection(
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
        ...DocsOverviewParts
      }
    }
  }
}
    ${DocsOverviewPartsFragmentDoc}`;
export const DocsFoundationsDocument = gql`
    query docsFoundations($relativePath: String!) {
  docsFoundations(relativePath: $relativePath) {
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
    ...DocsFoundationsParts
  }
}
    ${DocsFoundationsPartsFragmentDoc}`;
export const DocsFoundationsConnectionDocument = gql`
    query docsFoundationsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: DocsFoundationsFilter) {
  docsFoundationsConnection(
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
        ...DocsFoundationsParts
      }
    }
  }
}
    ${DocsFoundationsPartsFragmentDoc}`;
export const DocsComponentsOverviewDocument = gql`
    query docsComponentsOverview($relativePath: String!) {
  docsComponentsOverview(relativePath: $relativePath) {
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
    ...DocsComponentsOverviewParts
  }
}
    ${DocsComponentsOverviewPartsFragmentDoc}`;
export const DocsComponentsOverviewConnectionDocument = gql`
    query docsComponentsOverviewConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: DocsComponentsOverviewFilter) {
  docsComponentsOverviewConnection(
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
        ...DocsComponentsOverviewParts
      }
    }
  }
}
    ${DocsComponentsOverviewPartsFragmentDoc}`;
export const DocsComponentsActionsDocument = gql`
    query docsComponentsActions($relativePath: String!) {
  docsComponentsActions(relativePath: $relativePath) {
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
    ...DocsComponentsActionsParts
  }
}
    ${DocsComponentsActionsPartsFragmentDoc}`;
export const DocsComponentsActionsConnectionDocument = gql`
    query docsComponentsActionsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: DocsComponentsActionsFilter) {
  docsComponentsActionsConnection(
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
        ...DocsComponentsActionsParts
      }
    }
  }
}
    ${DocsComponentsActionsPartsFragmentDoc}`;
export const DocsComponentsInputsDocument = gql`
    query docsComponentsInputs($relativePath: String!) {
  docsComponentsInputs(relativePath: $relativePath) {
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
    ...DocsComponentsInputsParts
  }
}
    ${DocsComponentsInputsPartsFragmentDoc}`;
export const DocsComponentsInputsConnectionDocument = gql`
    query docsComponentsInputsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: DocsComponentsInputsFilter) {
  docsComponentsInputsConnection(
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
        ...DocsComponentsInputsParts
      }
    }
  }
}
    ${DocsComponentsInputsPartsFragmentDoc}`;
export const DocsComponentsNavigationDocument = gql`
    query docsComponentsNavigation($relativePath: String!) {
  docsComponentsNavigation(relativePath: $relativePath) {
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
    ...DocsComponentsNavigationParts
  }
}
    ${DocsComponentsNavigationPartsFragmentDoc}`;
export const DocsComponentsNavigationConnectionDocument = gql`
    query docsComponentsNavigationConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: DocsComponentsNavigationFilter) {
  docsComponentsNavigationConnection(
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
        ...DocsComponentsNavigationParts
      }
    }
  }
}
    ${DocsComponentsNavigationPartsFragmentDoc}`;
export const DocsComponentsFeedbackDocument = gql`
    query docsComponentsFeedback($relativePath: String!) {
  docsComponentsFeedback(relativePath: $relativePath) {
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
    ...DocsComponentsFeedbackParts
  }
}
    ${DocsComponentsFeedbackPartsFragmentDoc}`;
export const DocsComponentsFeedbackConnectionDocument = gql`
    query docsComponentsFeedbackConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: DocsComponentsFeedbackFilter) {
  docsComponentsFeedbackConnection(
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
        ...DocsComponentsFeedbackParts
      }
    }
  }
}
    ${DocsComponentsFeedbackPartsFragmentDoc}`;
export const DocsComponentsDisplayDocument = gql`
    query docsComponentsDisplay($relativePath: String!) {
  docsComponentsDisplay(relativePath: $relativePath) {
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
    ...DocsComponentsDisplayParts
  }
}
    ${DocsComponentsDisplayPartsFragmentDoc}`;
export const DocsComponentsDisplayConnectionDocument = gql`
    query docsComponentsDisplayConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: DocsComponentsDisplayFilter) {
  docsComponentsDisplayConnection(
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
        ...DocsComponentsDisplayParts
      }
    }
  }
}
    ${DocsComponentsDisplayPartsFragmentDoc}`;
export const DocsPatternsDocument = gql`
    query docsPatterns($relativePath: String!) {
  docsPatterns(relativePath: $relativePath) {
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
    ...DocsPatternsParts
  }
}
    ${DocsPatternsPartsFragmentDoc}`;
export const DocsPatternsConnectionDocument = gql`
    query docsPatternsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: DocsPatternsFilter) {
  docsPatternsConnection(
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
        ...DocsPatternsParts
      }
    }
  }
}
    ${DocsPatternsPartsFragmentDoc}`;
export const DocsResourcesDocument = gql`
    query docsResources($relativePath: String!) {
  docsResources(relativePath: $relativePath) {
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
    ...DocsResourcesParts
  }
}
    ${DocsResourcesPartsFragmentDoc}`;
export const DocsResourcesConnectionDocument = gql`
    query docsResourcesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: DocsResourcesFilter) {
  docsResourcesConnection(
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
        ...DocsResourcesParts
      }
    }
  }
}
    ${DocsResourcesPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    docsOverview(variables, options) {
      return requester(DocsOverviewDocument, variables, options);
    },
    docsOverviewConnection(variables, options) {
      return requester(DocsOverviewConnectionDocument, variables, options);
    },
    docsFoundations(variables, options) {
      return requester(DocsFoundationsDocument, variables, options);
    },
    docsFoundationsConnection(variables, options) {
      return requester(DocsFoundationsConnectionDocument, variables, options);
    },
    docsComponentsOverview(variables, options) {
      return requester(DocsComponentsOverviewDocument, variables, options);
    },
    docsComponentsOverviewConnection(variables, options) {
      return requester(DocsComponentsOverviewConnectionDocument, variables, options);
    },
    docsComponentsActions(variables, options) {
      return requester(DocsComponentsActionsDocument, variables, options);
    },
    docsComponentsActionsConnection(variables, options) {
      return requester(DocsComponentsActionsConnectionDocument, variables, options);
    },
    docsComponentsInputs(variables, options) {
      return requester(DocsComponentsInputsDocument, variables, options);
    },
    docsComponentsInputsConnection(variables, options) {
      return requester(DocsComponentsInputsConnectionDocument, variables, options);
    },
    docsComponentsNavigation(variables, options) {
      return requester(DocsComponentsNavigationDocument, variables, options);
    },
    docsComponentsNavigationConnection(variables, options) {
      return requester(DocsComponentsNavigationConnectionDocument, variables, options);
    },
    docsComponentsFeedback(variables, options) {
      return requester(DocsComponentsFeedbackDocument, variables, options);
    },
    docsComponentsFeedbackConnection(variables, options) {
      return requester(DocsComponentsFeedbackConnectionDocument, variables, options);
    },
    docsComponentsDisplay(variables, options) {
      return requester(DocsComponentsDisplayDocument, variables, options);
    },
    docsComponentsDisplayConnection(variables, options) {
      return requester(DocsComponentsDisplayConnectionDocument, variables, options);
    },
    docsPatterns(variables, options) {
      return requester(DocsPatternsDocument, variables, options);
    },
    docsPatternsConnection(variables, options) {
      return requester(DocsPatternsConnectionDocument, variables, options);
    },
    docsResources(variables, options) {
      return requester(DocsResourcesDocument, variables, options);
    },
    docsResourcesConnection(variables, options) {
      return requester(DocsResourcesConnectionDocument, variables, options);
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
