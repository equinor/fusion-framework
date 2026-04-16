import { z } from 'zod';
import { AiOptionsSchema } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

/**
 * Zod schema for the `ai index add` command.
 *
 * Extends the base AI options schema making `embedModel` and `indexName` required.
 */
export const CommandOptionsSchema = AiOptionsSchema.extend({
  embedModel: z
    .string({ message: 'Embedding model name is required for the index add command.' })
    .min(1, 'Embedding model name must be a non-empty string.'),
  indexName: z
    .string({ message: 'Index name is required for the index add command.' })
    .min(1, 'Index name must be a non-empty string.'),

  // Embeddings-specific options
  dryRun: z.boolean().describe('Show what would be processed without actually doing it'),
  config: z.string().min(1).describe('Path to a config file'),
  diff: z.boolean().describe('Process only changed files (workflow mode)'),
  baseRef: z.string().min(1).optional().describe('Git reference to compare against'),
  clean: z.boolean().describe('Delete all existing documents from the vector store before processing'),
}).describe('Command options for the embeddings command');

export type CommandOptions = z.infer<typeof CommandOptionsSchema>;
