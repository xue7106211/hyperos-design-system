import { defineConfig, LocalAuthProvider } from 'tinacms';
import { createDocsCollection } from './schema/shared-fields';

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

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
        name: 'docsFoundations',
        label: 'Foundations',
        match: { include: 'foundations/**' },
      }),
      createDocsCollection({
        name: 'docsComponents',
        label: 'Components',
        match: { include: 'components/**' },
      }),
      createDocsCollection({
        name: 'docsPatterns',
        label: 'Patterns',
        match: { include: 'patterns/**' },
      }),
      createDocsCollection({
        name: 'docsResources',
        label: 'Resources',
        match: { include: 'resources/**' },
      }),
      createDocsCollection({
        name: 'docsOverview',
        label: 'Overview',
        match: { include: 'index' },
      }),
    ],
  },
});
