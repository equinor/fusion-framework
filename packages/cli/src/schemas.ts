import { z } from 'zod';

/**
 * Api config object
 */
export const ApiAppConfigSchema = z.object({
  environment: z.record(z.any()).optional().default({}),
  endpoints: z
    .record(
      z.object({
        url: z.string(),
        scopes: z.array(z.string()).optional().default([]),
      }),
    )
    .optional(),
});

export type ApiAppConfig = z.infer<typeof ApiAppConfigSchema>;
