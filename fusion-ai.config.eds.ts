import { z } from 'zod';
import { defineIndexSchema } from '@equinor/fusion-framework-cli-plugin-ai-index';

export default {
  index: {
    name: 'eds-2026-03-14',
    model: 'text-embedding-3-large',
    // File patterns to match for processing
    patterns: [
      '**/*.md',
      // Exclude boilerplate endpoint/parameter generators that produce low-value embeddings
      '!**/docs/README.md',
      '!**/docs/about',
      '!**/docs/resources',
      '!**/docs/tone-guide',
    ],
    rawPatterns: ['**/*.md'],

    // Promoted fields for direct OData filtering (see fusion-core-tasks#1011)
    schema: defineIndexSchema({
      shape: z.object({
        type: z.string(),
        tags: z.array(z.string()).default([]),
      }),
      resolve: (doc) => ({
        type: (doc.metadata.attributes?.type as string) ?? 'markdown',
        tags: (doc.metadata.attributes?.tags as string[]) ?? [],
      }),
    }),

    // Metadata processing configuration
    metadata: {
      resolvePackage: false,
      resolveGit: false,
    },
  },
};
