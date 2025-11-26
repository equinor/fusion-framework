import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';
import type { ChangedFile } from '../utils/git/index.js';
import type { CommandOptions } from '../command.options.js';
import type { FrameworkInstance } from '@equinor/fusion-framework-cli-plugin-ai-base';
import type { FusionAIConfigWithIndex } from '../config.js';

/**
 * Result of updating the vector store with new documents
 * @internal
 */
export type UpdateVectorStoreResult = { status: 'added'; documents: VectorStoreDocument[] };

/**
 * Result of deleting removed files from the vector store
 * @internal
 */
export type DeleteRemovedFilesResult = { status: 'deleted'; files: { relativePath: string }[] };

/**
 * File with enriched metadata for processing
 * @internal
 */
export type ProcessedFile = {
  path: string;
  status: ChangedFile['status'];
  projectRoot: string | undefined;
  relativePath: string;
};

/**
 * Document entry with status for processing
 * @internal
 */
export type DocumentEntry = {
  status: ChangedFile['status'];
  documents: VectorStoreDocument[];
};

/**
 * Options for the embeddings bin
 * @internal
 */
export interface EmbeddingsBinOptions {
  framework: FrameworkInstance;
  options: CommandOptions;
  config: FusionAIConfigWithIndex;
  filePatterns: string[];
}
