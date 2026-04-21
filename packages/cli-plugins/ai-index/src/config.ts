import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';
import type { FusionAIConfig } from '@equinor/fusion-framework-cli-plugin-ai-base';
import type { IndexSchemaConfig } from './schema.js';

/**
 * Index-specific configuration for Fusion AI document indexing operations.
 *
 * Controls which files are collected, how they are chunked, and what metadata
 * is attached before being sent to the Azure AI Search vector store.
 *
 * @example
 * ```ts
 * const indexConfig: IndexConfig = {
 *   patterns: ['src/\**\/*.ts', 'docs/\**\/*.md'],
 *   ignore: ['dist/\**', 'node_modules/\**'],
 *   metadata: { resolvePackage: true, resolveGit: true },
 *   embedding: { chunkSize: 2000, chunkOverlap: 300 },
 * };
 * ```
 */
export interface IndexConfig {
  /** Azure Cognitive Search index name. Overridden by the `--azure-search-index-name` CLI flag. */
  name?: string;
  /** Azure OpenAI embedding deployment name. Overridden by the `--openai-embedding-deployment` CLI flag. */
  model?: string;
  // Glob patterns for files to process (defaults to ['**/*.ts', '**/*.md', '**/*.mdx']).
  patterns?: string[];
  /** Glob patterns for files that should be indexed as-is, without chunking or transformation. */
  rawPatterns?: string[];
  /** Glob patterns to ignore — only applied when file paths are provided to the command. */
  ignore?: string[];
  /** Respect `.gitignore` rules when globbing files. Defaults to `true`. Set to `false` for build-output directories that are gitignored. */
  gitignore?: boolean;
  /** Metadata processing configuration. */
  metadata?: {
    /** Automatically resolve the nearest `package.json` and attach package name/version/keywords. */
    resolvePackage?: boolean;
    /** Resolve git metadata (commit hash, date, permalink) for each source file. Defaults to `true`. */
    resolveGit?: boolean;
    /**
     * Custom callback to transform document attributes before embedding.
     *
     * @param metadata - The current attribute map for the document.
     * @param document - The full vector-store document being processed.
     * @returns The transformed attribute map.
     */
    attributeProcessor?: (
      metadata: Record<string, unknown>,
      document: VectorStoreDocument,
    ) => Record<string, unknown>;
  };

  /** Embedding generation configuration. */
  embedding?: {
    /** Maximum token size of each text chunk sent for embedding generation. */
    chunkSize?: number;
    /** Number of overlapping tokens between consecutive chunks. */
    chunkOverlap?: number;
  };

  /**
   * Custom index schema that promotes frequently-filtered metadata to
   * top-level Azure AI Search fields.
   *
   * When defined, the schema resolver runs after metadata enrichment and
   * places resolved values as top-level document fields in Azure Search,
   * enabling direct OData filters without the `any()` operator.
   *
   * @see {@link IndexSchemaConfig} for details and examples.
   */
  schema?: IndexSchemaConfig;
}

/**
 * Fusion AI configuration extended with {@link IndexConfig | index-specific settings}.
 *
 * Used as the return type of `configureFusionAI()` when the `ai index add` or
 * `ai index remove` commands are configured.
 *
 * @example
 * ```ts
 * import { configureFusionAI, type FusionAIConfigWithIndex } from '@equinor/fusion-framework-cli-plugin-ai-index';
 *
 * export default configureFusionAI((): FusionAIConfigWithIndex => ({
 *   index: {
 *     patterns: ['packages/\**\/*.ts', 'packages/\**\/*.md'],
 *   },
 * }));
 * ```
 */
export interface FusionAIConfigWithIndex extends FusionAIConfig {
  /** Index-specific configuration for document collection, chunking, and metadata. */
  index?: IndexConfig;
}
