// tina/config.ts
import { defineConfig, LocalAuthProvider } from "tinacms";

// tina/schema/blocks.ts
var statusBadgeBlock = {
  name: "StatusBadge",
  label: "\u72B6\u6001\u6807\u7B7E",
  fields: [
    {
      type: "string",
      name: "status",
      label: "Status",
      required: true,
      options: [
        { label: "Stable", value: "stable" },
        { label: "Beta", value: "beta" },
        { label: "Deprecated", value: "deprecated" }
      ]
    }
  ]
};
var figmaEmbedBlock = {
  name: "FigmaEmbed",
  label: "Figma \u8BBE\u8BA1\u7A3F",
  fields: [
    {
      type: "string",
      name: "fileKey",
      label: "File Key",
      required: true
    },
    {
      type: "string",
      name: "nodeId",
      label: "Node ID"
    },
    {
      type: "string",
      name: "mode",
      label: "Mode",
      options: [
        { label: "Design", value: "design" },
        { label: "Dev Mode", value: "dev" }
      ]
    },
    {
      type: "number",
      name: "height",
      label: "Height (px)"
    },
    {
      type: "string",
      name: "theme",
      label: "Theme",
      options: [
        { label: "System", value: "system" },
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" }
      ]
    }
  ]
};
var figmaPrototypeEmbedBlock = {
  name: "FigmaPrototypeEmbed",
  label: "Figma \u539F\u578B",
  fields: [
    {
      type: "string",
      name: "url",
      label: "Embed URL"
    },
    {
      type: "string",
      name: "fileKey",
      label: "File Key"
    },
    {
      type: "string",
      name: "nodeId",
      label: "Node ID"
    },
    {
      type: "number",
      name: "height",
      label: "Height (px)"
    }
  ]
};
var tokenTableBlock = {
  name: "TokenTable",
  label: "Design Token \u8868\u683C",
  fields: [
    {
      type: "string",
      name: "groups",
      label: "Token Groups",
      description: "\u8FC7\u6EE4\u524D\u7F00\uFF0C\u4F8B\u5982 semantic.bg\u3001component.navigation\u3001reference.solid.white",
      list: true
    }
  ]
};
var iconGalleryBlock = {
  name: "IconGallery",
  label: "\u56FE\u6807\u9884\u89C8",
  fields: [
    {
      type: "string",
      name: "categories",
      label: "Categories",
      description: "\u53EF\u9009\uFF1B\u7559\u7A7A\u663E\u793A\u5168\u90E8\u5206\u7C7B\u3002\u4F8B\u5982 navigation\u3001action",
      list: true
    }
  ]
};
var dosDontsBlock = {
  name: "DosDonts",
  label: "\u63A8\u8350 / \u907F\u514D",
  fields: [
    {
      type: "string",
      name: "doTitle",
      label: "\u63A8\u8350\u6807\u9898"
    },
    {
      type: "string",
      name: "dontTitle",
      label: "\u907F\u514D\u6807\u9898"
    },
    {
      type: "string",
      name: "doContent",
      label: "\u63A8\u8350\u5185\u5BB9\uFF08\u6BCF\u884C\u4E00\u6761\uFF09",
      ui: { component: "textarea" }
    },
    {
      type: "string",
      name: "dontContent",
      label: "\u907F\u514D\u5185\u5BB9\uFF08\u6BCF\u884C\u4E00\u6761\uFF09",
      ui: { component: "textarea" }
    }
  ]
};
var platformCodeBlock = {
  name: "PlatformCodeBlock",
  label: "\u5E73\u53F0\u4EE3\u7801\u53C2\u8003",
  fields: [
    {
      type: "string",
      name: "androidTitle",
      label: "Android \u6807\u9898"
    },
    {
      type: "string",
      name: "androidCode",
      label: "Android \u4EE3\u7801",
      ui: { component: "textarea" }
    },
    {
      type: "string",
      name: "iosTitle",
      label: "iOS \u6807\u9898"
    },
    {
      type: "string",
      name: "iosCode",
      label: "iOS \u4EE3\u7801",
      ui: { component: "textarea" }
    }
  ]
};
var mdxBlockTemplates = [
  statusBadgeBlock,
  figmaEmbedBlock,
  figmaPrototypeEmbedBlock,
  tokenTableBlock,
  iconGalleryBlock,
  dosDontsBlock,
  platformCodeBlock
];

// tina/schema/shared-fields.ts
var docFrontmatterFields = [
  {
    type: "string",
    name: "title",
    label: "\u6807\u9898",
    isTitle: true,
    required: true
  },
  {
    type: "string",
    name: "description",
    label: "\u63CF\u8FF0",
    ui: { component: "textarea" }
  },
  {
    type: "string",
    name: "maintainer",
    label: "\u7EF4\u62A4\u4EBA",
    description: "\u7F3A\u7701\u5C55\u793A\u4E3A\u300CHyperOS \u8BBE\u8BA1\u7CFB\u7EDF\u56E2\u961F\u300D"
  },
  {
    type: "string",
    name: "maintainerOpenId",
    label: "\u7EF4\u62A4\u4EBA\u98DE\u4E66 Open ID",
    description: "\u586B\u5199\u540E\u70B9\u51FB\u7EF4\u62A4\u4EBA\u4F1A\u901A\u8FC7 AppLink \u6253\u5F00\u98DE\u4E66\u5355\u804A\uFF08ou_ \u5F00\u5934\uFF09\u3002\u56E2\u961F\u540D\u7B49\u975E\u4E2A\u4EBA\u7EF4\u62A4\u4EBA\u8BF7\u7559\u7A7A\u3002"
  },
  {
    type: "string",
    name: "status",
    label: "\u72B6\u6001",
    options: [
      { label: "Stable", value: "stable" },
      { label: "Beta", value: "beta" },
      { label: "Deprecated", value: "deprecated" }
    ]
  },
  {
    type: "string",
    name: "platforms",
    label: "\u652F\u6301\u5E73\u53F0",
    list: true,
    options: [
      { label: "Android", value: "android" },
      { label: "iOS", value: "ios" },
      { label: "Pad", value: "pad" }
    ]
  },
  {
    type: "string",
    name: "figmaFileKey",
    label: "Figma File Key"
  },
  {
    type: "string",
    name: "figmaNodeId",
    label: "Figma Node ID"
  },
  {
    type: "string",
    name: "figmaPrototypeUrl",
    label: "Figma Prototype URL"
  },
  {
    type: "string",
    name: "tokenGroups",
    label: "Token Groups",
    list: true
  }
];
var docBodyField = {
  type: "rich-text",
  name: "body",
  label: "\u6B63\u6587",
  isBody: true,
  templates: mdxBlockTemplates
};
function docsRouter({ document }) {
  const slug = document._sys.relativePath.replace(/\.mdx?$/, "");
  return `/docs/${slug}`;
}
function createDocsCollection(options) {
  return {
    name: options.name,
    label: options.label,
    path: "content/docs",
    format: "mdx",
    match: options.match,
    fields: [...docFrontmatterFields, docBodyField],
    ui: {
      router: docsRouter
    }
  };
}

// tina/config.ts
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";
var docVersions = [
  { id: "os4", label: "OS4" },
  { id: "os5", label: "OS5" }
];
var docSections = [
  { key: "Overview", label: "\u6982\u89C8", include: "index" },
  { key: "Icons", label: "\u56FE\u6807", include: "icons" },
  { key: "General", label: "\u901A\u7528\u8BBE\u8BA1\u6807\u51C6", include: "general/**/*" },
  { key: "ComponentsOverview", label: "\u63A7\u4EF6\u4E0E\u7EC4\u4EF6 \xB7 \u6982\u89C8", include: "components/index" },
  {
    key: "ComponentsNavigation",
    label: "\u63A7\u4EF6\u4E0E\u7EC4\u4EF6 \xB7 \u5BFC\u822A\u641C\u7D22",
    include: "components/navigation/**/*"
  },
  {
    key: "ComponentsActions",
    label: "\u63A7\u4EF6\u4E0E\u7EC4\u4EF6 \xB7 \u83DC\u5355\u548C\u64CD\u4F5C",
    include: "components/actions/**/*"
  },
  {
    key: "ComponentsInputs",
    label: "\u63A7\u4EF6\u4E0E\u7EC4\u4EF6 \xB7 \u9009\u62E9\u548C\u8F93\u5165",
    include: "components/inputs/**/*"
  },
  {
    key: "ComponentsContainers",
    label: "\u63A7\u4EF6\u4E0E\u7EC4\u4EF6 \xB7 \u5BB9\u5668\u7C7B",
    include: "components/containers/**/*"
  },
  {
    key: "ComponentsDisplay",
    label: "\u63A7\u4EF6\u4E0E\u7EC4\u4EF6 \xB7 \u5C55\u793A\u7C7B",
    include: "components/display/**/*"
  },
  { key: "Interaction", label: "\u4EBA\u673A\u4EA4\u4E92\u6807\u51C6", include: "interaction/**/*" },
  { key: "System", label: "\u7CFB\u7EDF\u7279\u6027\u4E0E\u80FD\u529B\u6807\u51C6", include: "system/**/*" },
  { key: "MultiDevice", label: "\u591A\u7AEF\u8BBE\u5907\u6807\u51C6", include: "multi-device/**/*" },
  { key: "BestPractices", label: "\u5E94\u7528\u6700\u4F73\u5B9E\u8DF5\u6807\u51C6", include: "best-practices/**/*" }
];
var config_default = defineConfig({
  contentApiUrlOverride: "/api/tina/gql",
  branch,
  authProvider: isLocal ? new LocalAuthProvider() : new LocalAuthProvider(),
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },
  schema: {
    collections: docVersions.flatMap(
      (version) => docSections.map(
        (section) => createDocsCollection({
          name: `docs${version.id}${section.key}`,
          label: `${version.label} \xB7 ${section.label}`,
          match: { include: `${version.id}/${section.include}` }
        })
      )
    )
  }
});
export {
  config_default as default
};
