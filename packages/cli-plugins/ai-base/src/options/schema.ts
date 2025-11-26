import z from 'zod';

/**
 * Base Zod schema for AI-related command options.
 *
 * This schema defines the validation rules for all AI options. Other AI plugins
 * can extend this schema to add their own command-specific options.
 *
 * @example
 * ```ts
 * import { AiOptionsSchema } from '@equinor/fusion-framework-cli-plugin-ai-base';
 * import { z } from 'zod';
 *
 * const MyCommandOptionsSchema = AiOptionsSchema.extend({
 *   myOption: z.string(),
 * });
 * ```
 */
export const AiOptionsSchema = z
  .object({
    // Required AI options
    openaiApiKey: z
      .string({ message: 'Azure OpenAI API key is required and must be a non-empty string.' })
      .min(1, 'API key must be a non-empty string.')
      .describe('Azure OpenAI API key for authentication'),
    openaiApiVersion: z
      .string({ message: 'Azure OpenAI API version is required and must be a non-empty string.' })
      .min(1, 'API version must be a non-empty string.')
      .describe('Azure OpenAI API version'),
    openaiInstance: z
      .string({ message: 'Azure OpenAI instance name is required and must be a non-empty string.' })
      .min(1, 'Instance name must be a non-empty string.')
      .describe('Azure OpenAI instance name'),

    // Optional AI options
    openaiChatDeployment: z
      .string()
      .min(1, 'Chat deployment name must be a non-empty string.')
      .optional()
      .describe('Azure OpenAI chat deployment name'),
    openaiEmbeddingDeployment: z
      .string()
      .min(1, 'Embedding deployment name must be a non-empty string.')
      .optional()
      .describe('Azure OpenAI embedding deployment name'),
    azureSearchEndpoint: z
      .string()
      .url('Azure Search endpoint must be a valid URL.')
      .min(1, 'Azure Search endpoint must be a non-empty string.')
      .optional()
      .describe('Azure Search endpoint URL'),
    azureSearchApiKey: z
      .string()
      .min(1, 'Azure Search API key must be a non-empty string.')
      .optional()
      .describe('Azure Search API key'),
    azureSearchIndexName: z
      .string()
      .min(1, 'Azure Search index name must be a non-empty string.')
      .optional()
      .describe('Azure Search index name'),
  })
  .describe('Base AI-related command options');

/**
 * Type representing the validated AI options.
 *
 * This type is inferred from the Zod schema and should be used throughout AI plugins
 * to ensure type safety and consistency with the schema.
 */
export type AiOptionsType = z.infer<typeof AiOptionsSchema>;
