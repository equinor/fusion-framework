import { z } from 'zod';

import { AiOptionsSchema } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

/**
 * Zod schema for validating command options for the `ai index add` command.
 *
 * Extends the base AI options schema ({@link AiOptionsSchema}) with
 * add-specific options such as `--dry-run`, `--diff`, `--config`,
 * `--base-ref`, and `--clean`.
 *
 * Azure Search and embedding options that are optional in the base schema
 * become **required** because the add command always writes to a
 * vector store.
 *
 * @example
 * ```ts
 * const validated = await CommandOptionsSchema.parseAsync(rawOptions);
 * // validated.dryRun, validated.azureSearchEndpoint, etc.
 * ```
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
 * Validated options for the `ai index add` command.
 *
 * Inferred from {@link CommandOptionsSchema} and used as the single
 * source of truth for option types throughout the add/embeddings pipeline.
 */
export type CommandOptions = z.infer<typeof CommandOptionsSchema>;
