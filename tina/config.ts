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
  { key: 'Icons', label: '图标', include: 'icons' },
  { key: 'General', label: '通用设计标准', include: 'general/**/*' },
  { key: 'ComponentsOverview', label: '控件与组件 · 概览', include: 'components/index' },
  {
    key: 'ComponentsNavigation',
    label: '控件与组件 · 导航搜索',
    include: 'components/navigation/**/*',
  },
  {
    key: 'ComponentsActions',
    label: '控件与组件 · 菜单和操作',
    include: 'components/actions/**/*',
  },
  {
    key: 'ComponentsInputs',
    label: '控件与组件 · 选择和输入',
    include: 'components/inputs/**/*',
  },
  {
    key: 'ComponentsContainers',
    label: '控件与组件 · 容器类',
    include: 'components/containers/**/*',
  },
  {
    key: 'ComponentsDisplay',
    label: '控件与组件 · 展示类',
    include: 'components/display/**/*',
  },
  { key: 'Interaction', label: '人机交互标准', include: 'interaction/**/*' },
  { key: 'System', label: '系统特性与能力标准', include: 'system/**/*' },
  { key: 'MultiDevice', label: '多端设备标准', include: 'multi-device/**/*' },
  { key: 'BestPractices', label: '应用最佳实践标准', include: 'best-practices/**/*' },
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
