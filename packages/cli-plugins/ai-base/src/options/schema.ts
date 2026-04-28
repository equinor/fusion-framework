import z from 'zod';

/**
 * Base Zod schema for Fusion AI command options.
 *
 * All fields are optional — when omitted the service URL and token are
 * resolved automatically from Fusion service discovery and MSAL auth.
 *
 * @example
 * ```ts
 * import { AiOptionsSchema } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';
 * const MySchema = AiOptionsSchema.extend({ extra: z.string() });
 * ```
 */
export const AiOptionsSchema = z
  .object({
    env: z.string().optional(),
    token: z.string().optional(),
    tenantId: z.string().optional(),
    clientId: z.string().optional(),
    chatModel: z.string().min(1).optional(),
    embedModel: z.string().min(1).optional(),
    indexName: z.string().min(1).optional(),
    debug: z.coerce.boolean().default(false),
  })
  .describe('Base Fusion AI command options');

export type AiOptionsType = z.infer<typeof AiOptionsSchema>;
