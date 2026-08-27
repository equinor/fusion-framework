import { z } from 'zod';
import { ApiSimpleRoleSchemaV1 } from './api-simple-role-schema-v1';

/** Zod schema for the minimal role assignment that contributed an account access role. */
export const ApiSimpleRoleAssignmentSchemaV1 = z
  .object({
    /** Unique identifier of the role assignment. */
    id: z.string().optional().describe('Unique identifier of the role assignment.'),
    /** The role this record refers to. */
    role: ApiSimpleRoleSchemaV1.optional().describe('The role this record refers to.'),
  })
  .describe('The minimal role assignment that contributed an account access role.');

/**
 * A role assignment in condensed form, as embedded in the access role assignment it triggered.
 *
 * Roles API 1.0 model inferred from {@link ApiSimpleRoleAssignmentSchemaV1}, so
 * `ApiSimpleRoleAssignmentV1` and the runtime validator can never describe different shapes.
 */
export type ApiSimpleRoleAssignmentV1 = z.infer<typeof ApiSimpleRoleAssignmentSchemaV1>;
