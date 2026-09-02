import { z } from 'zod';
import { ApiAccessRoleSchemaV1 } from './api-access-role-schema-v1';
import { ApiSimpleSystemSchemaV1 } from './api-simple-system-schema-v1';

/** Zod schema for an access role returned by the global access-role endpoint with its owning system. */
export const ApiExtendedAccessRoleSchemaV1 = ApiAccessRoleSchemaV1.and(
  z.object({
    /** The system that owns this record, if any. */
    system: ApiSimpleSystemSchemaV1.optional().describe(
      'The system that owns this record, if any.',
    ),
  }),
).describe('An access role returned by the global access-role endpoint with its owning system.');

/**
 * Represents an access role with extended details including system information.
 *
 * Roles API 1.0 model inferred from {@link ApiExtendedAccessRoleSchemaV1}, so
 * `ApiExtendedAccessRoleV1` and the runtime validator can never describe different shapes.
 */
export type ApiExtendedAccessRoleV1 = z.infer<typeof ApiExtendedAccessRoleSchemaV1>;
