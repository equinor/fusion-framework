import { z } from 'zod';
import { ApiClaimableAccessRoleMappingSchemaV1 } from './api-claimable-access-role-mapping-schema-v1';
import { ApiSimpleSystemSchemaV1 } from './api-simple-system-schema-v1';

/** Zod schema for the minimal claimable role returned in assignment responses. */
export const ApiSimpleClaimableRoleSchemaV1 = z
  .object({
    /** Unique identifier of the claimable role. */
    id: z.string().optional().describe('Unique identifier of the claimable role.'),
    /** Name of the claimable role. */
    name: z.string().optional().describe('Name of the claimable role.'),
    /** Human-readable display name of the claimable role. */
    displayName: z
      .string()
      .optional()
      .describe('Human-readable display name of the claimable role.'),
    /** Description of the claimable role. */
    description: z.string().optional().describe('Description of the claimable role.'),
    /** Access role mappings granted when this claimable role is activated, if expanded. */
    accessRoleMappings: z
      .array(ApiClaimableAccessRoleMappingSchemaV1)
      .nullish()
      .describe('Access role mappings granted when this claimable role is activated, if expanded.'),
    /** The system that owns this record, if any. */
    system: ApiSimpleSystemSchemaV1.nullish().describe('The system that owns this record, if any.'),
  })
  .describe('The minimal claimable role returned in assignment responses.');

/**
 * A claimable role in condensed form, as embedded in assignments and consolidated views.
 *
 * Roles API 1.0 model inferred from {@link ApiSimpleClaimableRoleSchemaV1}, so
 * `ApiSimpleClaimableRoleV1` and the runtime validator can never describe different shapes.
 */
export type ApiSimpleClaimableRoleV1 = z.infer<typeof ApiSimpleClaimableRoleSchemaV1>;
