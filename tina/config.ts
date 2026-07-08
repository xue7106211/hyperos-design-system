import { defineConfig, LocalAuthProvider } from 'tinacms';
import { createDocsCollection } from './schema/shared-fields';

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

// Tina match globs resolve to `content/docs/<include>.<format>`.
// Use `**/*` (not `**`) so nested folders like components/actions/ are indexed.
const componentSections = [
  { name: 'docsComponentsOverview', label: 'Components · 概览', include: 'components/index' },
  { name: 'docsComponentsActions', label: 'Components · Actions', include: 'components/actions/**/*' },
  { name: 'docsComponentsInputs', label: 'Components · Inputs', include: 'components/inputs/**/*' },
  {
    name: 'docsComponentsNavigation',
    label: 'Components · Navigation',
    include: 'components/navigation/**/*',
  },
  {
    name: 'docsComponentsFeedback',
    label: 'Components · Feedback',
    include: 'components/feedback/**/*',
  },
  { name: 'docsComponentsDisplay', label: 'Components · Display', include: 'components/display/**/*' },
] as const;

export default defineConfig({
  contentApiUrlOverride: '/api/tina/gql',
  branch,
  authProvider: isLocal ? new LocalAuthProvider() : new LocalAuthProvider(),
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      createDocsCollection({
        name: 'docsOverview',
        label: 'Overview',
        match: { include: 'index' },
      }),
      createDocsCollection({
        name: 'docsFoundations',
        label: 'Foundations',
        match: { include: 'foundations/**/*' },
      }),
      ...componentSections.map(({ name, label, include }) =>
        createDocsCollection({ name, label, match: { include } }),
      ),
      createDocsCollection({
        name: 'docsPatterns',
        label: 'Patterns',
        match: { include: 'patterns/**/*' },
      }),
      createDocsCollection({
        name: 'docsResources',
        label: 'Resources',
        match: { include: 'resources/**/*' },
      }),
    ],
  },
});
