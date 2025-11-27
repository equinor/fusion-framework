import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';
import type { FusionAIConfig } from '@equinor/fusion-framework-cli-plugin-ai-base';

/**
 * Index-specific configuration for Fusion AI operations
 */
export interface IndexConfig {
  patterns?: string[];
  /** Files will be processed as is, without any chunking or transformation */
  rawPatterns?: string[];
  /** Globby patterns to ignored, only used when providing paths to the command */
  ignore?: string[];
  /** Metadata processing configuration */
  metadata?: {
    /** Automatically resolve package information from source file paths */
    resolvePackage?: boolean;
    resolveGit?: boolean;
    /** Custom metadata processors to transform metadata before embedding */
    attributeProcessor?: (
      metadata: Record<string, unknown>,
      document: VectorStoreDocument,
    ) => Record<string, unknown>;
  };

  /** Embedding generation configuration */
  embedding?: {
    /** Size of text chunks for embedding */
    chunkSize?: number;
    /** Overlap between chunks */
    chunkOverlap?: number;
  };
}

/**
 * Extended Fusion AI configuration with index-specific settings
 */
export interface FusionAIConfigWithIndex extends FusionAIConfig {
  index?: IndexConfig;
}
