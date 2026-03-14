import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';
import type { FusionAIConfig } from '@equinor/fusion-framework-cli-plugin-ai-base';

/**
 * Index-specific configuration for Fusion AI document indexing operations.
 *
 * Controls which files are collected, how they are chunked, and what metadata
 * is attached before being sent to the Azure AI Search vector store.
 *
 * @example
 * ```ts
 * const indexConfig: IndexConfig = {
 *   patterns: ['**/*.ts', '**/*.md'],
 *   ignore: ['**/dist/**', '**/node_modules/**'],
 *   metadata: { resolvePackage: true, resolveGit: true },
 *   embedding: { chunkSize: 2000, chunkOverlap: 300 },
 * };
 * ```
 */
export interface IndexConfig {
  /** Glob patterns for files to process (defaults to `['**/*.ts', '**/*.md', '**/*.mdx']`). */
  patterns?: string[];
  /** Glob patterns for files that should be indexed as-is, without chunking or transformation. */
  rawPatterns?: string[];
  /** Glob patterns to ignore — only applied when file paths are provided to the command. */
  ignore?: string[];
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
}

/**
 * Fusion AI configuration extended with {@link IndexConfig | index-specific settings}.
 *
 * Used as the return type of `configureFusionAI()` when the `ai embeddings` or
 * `ai delete` commands are configured.
 *
 * @example
 * ```ts
 * import { configureFusionAI, type FusionAIConfigWithIndex } from '@equinor/fusion-framework-cli-plugin-ai-index';
 *
 * export default configureFusionAI((): FusionAIConfigWithIndex => ({
 *   index: {
 *     patterns: ['packages/**/*.ts', 'packages/**/*.md'],
 *   },
 * }));
 * ```
 */
export interface FusionAIConfigWithIndex extends FusionAIConfig {
  /** Index-specific configuration for document collection, chunking, and metadata. */
  index?: IndexConfig;
}
