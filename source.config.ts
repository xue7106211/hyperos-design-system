import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      status: z.enum(['stable', 'beta', 'deprecated']).optional(),
      platforms: z.array(z.enum(['android', 'ios', 'pad'])).optional(),
      figmaFileKey: z.string().optional(),
      figmaNodeId: z.string().optional(),
      figmaPrototypeUrl: z.string().url().optional(),
      tokenGroups: z.array(z.string()).optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {},
});
