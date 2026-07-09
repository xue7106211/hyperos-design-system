import { defineConfig, LocalAuthProvider } from 'tinacms';
import { createDocsCollection } from './schema/shared-fields';

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

const docVersions = [
  { id: 'os4', label: 'OS4' },
  { id: 'os5', label: 'OS5' },
] as const;

const docSections = [
  { key: 'Overview', label: '概览', include: 'index' },
  { key: 'Foundations', label: 'Foundations', include: 'foundations/**/*' },
  { key: 'ComponentsOverview', label: 'Components · 概览', include: 'components/index' },
  { key: 'ComponentsActions', label: 'Components · Actions', include: 'components/actions/**/*' },
  { key: 'ComponentsInputs', label: 'Components · Inputs', include: 'components/inputs/**/*' },
  {
    key: 'ComponentsNavigation',
    label: 'Components · Navigation',
    include: 'components/navigation/**/*',
  },
  {
    key: 'ComponentsFeedback',
    label: 'Components · Feedback',
    include: 'components/feedback/**/*',
  },
  { key: 'ComponentsDisplay', label: 'Components · Display', include: 'components/display/**/*' },
  { key: 'Patterns', label: 'Patterns', include: 'patterns/**/*' },
  { key: 'Resources', label: 'Resources', include: 'resources/**/*' },
] as const;

// Tina match globs resolve to `content/docs/<include>.<format>`.
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
    collections: docVersions.flatMap((version) =>
      docSections.map((section) =>
        createDocsCollection({
          name: `docs${version.id}${section.key}`,
          label: `${version.label} · ${section.label}`,
          match: { include: `${version.id}/${section.include}` },
        }),
      ),
    ),
  },
});
