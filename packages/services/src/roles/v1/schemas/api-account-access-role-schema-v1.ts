import { z } from 'zod';
import { ApiAccessRoleSchemaV1 } from './api-access-role-schema-v1';
import { ApiSimpleSystemSchemaV1 } from './api-simple-system-schema-v1';

/** Zod schema for the access role nested in an account access-role assignment. */
export const ApiAccountAccessRoleSchemaV1 = ApiAccessRoleSchemaV1.and(
  z.object({
    /** The system that owns this record, if any. */
    system: ApiSimpleSystemSchemaV1.optional().describe(
      'The system that owns this record, if any.',
    ),
  }),
).describe('The access role nested in an account access-role assignment.');

/**
 * An access role as embedded in an account-centric access role assignment, including the system
 * that owns it.
 *
 * Roles API 1.0 model inferred from {@link ApiAccountAccessRoleSchemaV1}, so
 * `ApiAccountAccessRoleV1` and the runtime validator can never describe different shapes.
 */
export type ApiAccountAccessRoleV1 = z.infer<typeof ApiAccountAccessRoleSchemaV1>;
