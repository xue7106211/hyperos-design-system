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
      description: "\u4F8B\u5982 color.action\u3001spacing.button",
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
  { key: "Foundations", label: "Foundations", include: "foundations/**/*" },
  { key: "ComponentsOverview", label: "Components \xB7 \u6982\u89C8", include: "components/index" },
  { key: "ComponentsActions", label: "Components \xB7 Actions", include: "components/actions/**/*" },
  { key: "ComponentsInputs", label: "Components \xB7 Inputs", include: "components/inputs/**/*" },
  {
    key: "ComponentsNavigation",
    label: "Components \xB7 Navigation",
    include: "components/navigation/**/*"
  },
  {
    key: "ComponentsFeedback",
    label: "Components \xB7 Feedback",
    include: "components/feedback/**/*"
  },
  { key: "ComponentsDisplay", label: "Components \xB7 Display", include: "components/display/**/*" },
  { key: "Patterns", label: "Patterns", include: "patterns/**/*" },
  { key: "Resources", label: "Resources", include: "resources/**/*" }
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
