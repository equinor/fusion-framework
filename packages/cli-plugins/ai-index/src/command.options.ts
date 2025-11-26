import { z } from 'zod';

import { AiOptionsSchema } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

/**
 * Zod schema for validating command options for the embeddings command.
 *
 * This schema extends the base AI options schema with embeddings-specific options,
 * ensuring type safety and runtime validation of command arguments.
 *
 * Note: Some optional AI options become required for the embeddings command
 * (openaiEmbeddingDeployment, azureSearchEndpoint, azureSearchApiKey, azureSearchIndexName)
 * because the command uses withAiOptions with includeEmbedding and includeSearch set to true.
 */
export const CommandOptionsSchema = AiOptionsSchema.extend({
  // Override optional AI options to make them required for embeddings command
  openaiEmbeddingDeployment: z
    .string({ message: 'Embedding deployment name is required for embeddings command.' })
    .min(1, 'Embedding deployment name must be a non-empty string.')
    .describe('Azure OpenAI embedding deployment name'),
  azureSearchEndpoint: z
    .string({ message: 'Azure Search endpoint is required for embeddings command.' })
    .url('Azure Search endpoint must be a valid URL.')
    .min(1, 'Azure Search endpoint must be a non-empty string.')
    .describe('Azure Search endpoint URL'),
  azureSearchApiKey: z
    .string({ message: 'Azure Search API key is required for embeddings command.' })
    .min(1, 'Azure Search API key must be a non-empty string.')
    .describe('Azure Search API key'),
  azureSearchIndexName: z
    .string({ message: 'Azure Search index name is required for embeddings command.' })
    .min(1, 'Azure Search index name must be a non-empty string.')
    .describe('Azure Search index name'),

  // Embeddings-specific options
  dryRun: z
    .boolean({ message: 'dryRun must be a boolean value.' })
    .describe('Show what would be processed without actually doing it'),
  config: z
    .string({ message: 'Config file path is required and must be a non-empty string.' })
    .min(1, 'Config file path must be a non-empty string.')
    .describe('Path to a config file'),
  diff: z
    .boolean({ message: 'diff must be a boolean value.' })
    .describe('Process only changed files (workflow mode)'),
  baseRef: z.string().min(1).optional().describe('Git reference to compare against'),
  clean: z
    .boolean({ message: 'clean must be a boolean value.' })
    .describe('Delete all existing documents from the vector store before processing'),
}).describe('Command options for the embeddings command');

/**
 * Type representing the validated command options.
 *
 * This type is inferred from the Zod schema and should be used throughout the command
 * to ensure type safety and consistency with the schema.
 */
export type CommandOptions = z.infer<typeof CommandOptionsSchema>;
