import { z } from 'zod';

import { AiOptionsSchema } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

/**
 * Zod schema for validating options of the `ai index remove` command.
 *
 * Extends the base AI options schema ({@link AiOptionsSchema}) to require
 * Azure Search credentials and the embedding deployment (needed to initialise
 * the vector store service for document removal).
 *
 * @example
 * ```ts
 * const validated = await DeleteOptionsSchema.parseAsync(rawOptions);
 * // validated.dryRun, validated.filter, validated.azureSearchEndpoint, etc.
 * ```
 */
export const DeleteOptionsSchema = AiOptionsSchema.extend({
  openaiEmbeddingDeployment: z
    .string({ message: 'Embedding deployment name is required to initialise the vector store.' })
    .min(1, 'Embedding deployment name must be a non-empty string.')
    .describe('Azure OpenAI embedding deployment name'),
  azureSearchEndpoint: z
    .string({ message: 'Azure Search endpoint is required for deletion.' })
    .url('Azure Search endpoint must be a valid URL.')
    .min(1, 'Azure Search endpoint must be a non-empty string.')
    .describe('Azure Search endpoint URL'),
  azureSearchApiKey: z
    .string({ message: 'Azure Search API key is required for deletion.' })
    .min(1, 'Azure Search API key must be a non-empty string.')
    .describe('Azure Search API key'),
  azureSearchIndexName: z
    .string({ message: 'Azure Search index name is required for deletion.' })
    .min(1, 'Azure Search index name must be a non-empty string.')
    .describe('Azure Search index name'),
  dryRun: z
    .boolean({ message: 'dryRun must be a boolean value.' })
    .describe('Preview what would be deleted without making changes'),
  filter: z
    .string()
    .min(1, 'Filter expression must be a non-empty string.')
    .optional()
    .describe('Raw OData filter expression for selecting documents to delete'),
}).describe('Command options for the delete command');

/**
 * Validated options for the `ai index remove` command.
 *
 * Inferred from {@link DeleteOptionsSchema}.
 */
export type DeleteOptions = z.infer<typeof DeleteOptionsSchema>;
