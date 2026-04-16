import { z } from 'zod';
import { AiOptionsSchema } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';

/**
 * Zod schema for the `ai index remove` command.
 *
 * Extends the base AI options schema making `indexName` required.
 */
export const DeleteOptionsSchema = AiOptionsSchema.extend({
  indexName: z
    .string({ message: 'Index name is required for deletion.' })
    .min(1, 'Index name must be a non-empty string.'),
  dryRun: z.boolean().describe('Preview what would be deleted without making changes'),
  filter: z
    .string()
    .min(1)
    .optional()
    .describe('Raw OData filter expression for selecting documents to delete'),
}).describe('Command options for the delete command');

export type DeleteOptions = z.infer<typeof DeleteOptionsSchema>;
