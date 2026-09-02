import { z } from 'zod';

/**
 * Zod schema for the `CreatePinnedAppRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to pin an app to a user's personal app list.
 */
export const CreatePinnedAppRequestSchemaV1 = z
  .object({
    /** The key identifier of the app to pin. */
    appKey: z.string().optional().describe('The key identifier of the app to pin.'),
  })
  .describe("Request to pin an app to a user's personal app list.");

/**
 * Request to pin an app to a user's personal app list.
 *
 * Apps API 1.0 model inferred from {@link CreatePinnedAppRequestSchemaV1}, so
 * `CreatePinnedAppRequestV1` and the runtime validator can never describe different shapes.
 */
export type CreatePinnedAppRequestV1 = z.infer<typeof CreatePinnedAppRequestSchemaV1>;
