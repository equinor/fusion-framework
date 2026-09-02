import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';
import { ApiRoleAssignmentSchemaV1 } from './api-role-assignment-schema-v1';

/** Zod schema for a role assignment returned from an account-centric query. */
export const ApiAccountRoleAssignmentSchemaV1 = ApiRoleAssignmentSchemaV1.and(
  z.object({
    /** Account that created the record. */
    createdBy: ApiAccountSchemaV1.optional().describe('Account that created the record.'),
    /** Date and time this assignment was created. */
    createdDate: z.string().optional().describe('Date and time this assignment was created.'),
  }),
).describe('A role assignment returned from an account-centric query.');

/**
 * Represents a role assignment as seen from an account context, including audit fields.
 *
 * Roles API 1.0 model inferred from {@link ApiAccountRoleAssignmentSchemaV1}, so
 * `ApiAccountRoleAssignmentV1` and the runtime validator can never describe different shapes.
 */
export type ApiAccountRoleAssignmentV1 = z.infer<typeof ApiAccountRoleAssignmentSchemaV1>;
