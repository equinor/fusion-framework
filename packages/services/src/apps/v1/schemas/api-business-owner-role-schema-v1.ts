import { z } from 'zod';

/**
 * Zod schema for the `ApiBusinessOwnerRole` model published by the Fusion Apps API 1.0.
 *
 * Defines a role that can be assigned to a business owner of a Fusion application.
 */
export const ApiBusinessOwnerRoleSchemaV1 = z
  .object({
    /** Human-readable display name for the role. */
    displayName: z.string().optional().describe('Human-readable display name for the role.'),
    /** The machine-readable role name, e.g. BusinessOwner. */
    name: z.string().optional().describe('The machine-readable role name, e.g. BusinessOwner.'),
  })
  .describe('Defines a role that can be assigned to a business owner of a Fusion application.');

/**
 * Defines a role that can be assigned to a business owner of a Fusion application.
 *
 * Apps API 1.0 model inferred from {@link ApiBusinessOwnerRoleSchemaV1}, so
 * `ApiBusinessOwnerRoleV1` and the runtime validator can never describe different shapes.
 */
export type ApiBusinessOwnerRoleV1 = z.infer<typeof ApiBusinessOwnerRoleSchemaV1>;
