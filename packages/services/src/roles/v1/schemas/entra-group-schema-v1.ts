import { z } from 'zod';

/** Zod schema for an Entra ID (Azure AD) group reference. */
export const EntraGroupSchemaV1 = z
  .object({
    /** Azure AD group object ID. */
    id: z.string().describe('Azure AD group object ID.'),
    /** Display name of the group. */
    name: z.string().nullish().describe('Display name of the group.'),
  })
  .describe('An Entra ID (Azure AD) group reference.');

/**
 * Reference to an Entra ID (Azure AD) group.
 *
 * Roles API 1.0 model inferred from {@link EntraGroupSchemaV1}, so `EntraGroupV1` and the
 * runtime validator can never describe different shapes.
 */
export type EntraGroupV1 = z.infer<typeof EntraGroupSchemaV1>;
