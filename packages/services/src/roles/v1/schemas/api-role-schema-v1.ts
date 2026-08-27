import { z } from 'zod';
import { ApiAccessRoleMappingSchemaV1 } from './api-access-role-mapping-schema-v1';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';
import { ApiSimpleRoleSchemaV1 } from './api-simple-role-schema-v1';

/** Zod schema for a complete role returned by the Fusion Roles V2 API. */
export const ApiRoleSchemaV1 = ApiSimpleRoleSchemaV1.and(
  z.object({
    /** Access role mappings granted to holders of this role, when expanded. */
    accessRoleMappings: z
      .array(ApiAccessRoleMappingSchemaV1)
      .nullish()
      .describe('Access role mappings granted to holders of this role, when expanded.'),
    /** Account that created the record. */
    createdBy: ApiAccountSchemaV1.optional().describe('Account that created the record.'),
    /** Date and time this role was created. */
    createdDate: z.string().optional().describe('Date and time this role was created.'),
    /** Account that last updated the record, if it has been updated. */
    updatedBy: ApiAccountSchemaV1.nullish().describe(
      'Account that last updated the record, if it has been updated.',
    ),
    /** Date and time this role was last updated, if any. Omitted when null. */
    updatedDate: z
      .string()
      .nullish()
      .describe('Date and time this role was last updated, if any. Omitted when null.'),
  }),
).describe('A complete role returned by the Fusion Roles V2 API.');

/**
 * Represents a role with full details including access role mappings and audit fields.
 *
 * Roles API 1.0 model inferred from {@link ApiRoleSchemaV1}, so `ApiRoleV1` and the runtime
 * validator can never describe different shapes.
 */
export type ApiRoleV1 = z.infer<typeof ApiRoleSchemaV1>;
