import { z } from 'zod';
import { defineIndexSchema } from '@equinor/fusion-framework-cli-plugin-ai-index';

export default {
  index: {
    name: 'fusion-framework-2026-04-21',
    model: 'text-embedding-3-large',
    ignore: ['node_modules/**', 'dist/**', '**/node_modules/**', '**/dist/**'],
    // File patterns to match for processing
    patterns: [
      'packages/**/src/**/*.{ts,tsx}',
      'cookbooks/**/*.{ts,tsx}',
      'cookbooks/**/README.md',
      // doccs
      'packages/**/docs/**/*.md',
      'packages/**/README.md',
      //
      '!packages/cli-plugins/**',
      // Exclude AI module until ready for public consumption (see fusion-core-tasks#692)
      '!packages/modules/ai/**',
      '!packages/cli-plugins/ai-*/**',
      '!packages/cli/docs/ai-commands.md',
      // Exclude boilerplate endpoint/parameter generators that produce low-value
      // one-liner TSDoc chunks and pollute search results for "http client" queries
      '!packages/modules/services/src/**/generate-parameters.ts',
      '!packages/modules/services/src/**/endpoints/**',
    ],
    rawPatterns: ['cookbooks/**/*.{ts,tsx}'],

    // Promoted fields — top-level Azure AI Search fields for direct filtering
    // without the `any()` OData operator (see fusion-core-tasks#1011)
    schema: defineIndexSchema({
      shape: z.object({
        pkg_name: z.string().optional(),
        type: z.string(),
        ts_kind: z.string().optional(),
        tags: z.array(z.string()).default([]),
        source_dir: z.string(),
        git_commit_date: z.string().optional(),
      }),
      prepareAttributes: (attrs, doc) => {
        const source = doc.metadata.source;
        // Build up tags based on source location — attrs.tags is string[] | undefined ✅
        attrs.tags ??= [];
        if (source.includes('packages/')) {
          attrs.tags.push('package');
        }
        if (source.includes('packages/react/')) {
          attrs.tags.push('react');
        }
        if (source.includes('packages/react/app')) {
          attrs.tags.push('app');
        }
        if (source.includes('packages/modules/')) {
          attrs.tags.push('module');
        }
        if (source.includes('packages/utils/')) {
          attrs.tags.push('utils');
        }
        if (source.includes('packages/cli/')) {
          attrs.tags.push('cli', 'node');
        }
        if (source.includes('cookbooks/')) {
          attrs.tags.push('cookbook', 'examples', 'howtos', 'tutorials', 'guides');
        }
        if (source.includes('CHANGELOG.md')) {
          attrs.tags.push('changelog', 'release notes');
        }
        // Fold package keywords into tags for richer faceting
        const keywords = doc.metadata.attributes?.pkg_keywords;
        if (Array.isArray(keywords)) {
          attrs.tags.push(...keywords.filter((k): k is string => typeof k === 'string'));
        }
        return attrs;
      },
      resolve: (doc) => ({
        pkg_name: doc.metadata.attributes?.pkg_name as string | undefined,
        type: (doc.metadata.attributes?.type as string) ?? 'unknown',
        ts_kind: doc.metadata.attributes?.ts_kind as string | undefined,
        tags: (doc.metadata.attributes?.tags as string[]) ?? [],
        // Top-level directory for scoping filters (e.g. "packages", "cookbooks")
        source_dir: doc.metadata.source.split('/')[0],
        git_commit_date: doc.metadata.attributes?.git_commit_date as string | undefined,
      }),
    }),
    // Metadata processing configuration
    metadata: {
      resolvePackage: true,
    },
  },
};
