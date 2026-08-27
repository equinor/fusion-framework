import { z } from 'zod';

/** Zod schema for the body of a create-access-role request. */
export const CreateAccessRoleRequestSchemaV1 = z
  .object({
    /** Name of the access role. Only URL-safe characters are accepted. */
    name: z
      .string()
      .optional()
      .describe('Name of the access role. Only URL-safe characters are accepted.'),
    /** Description of the access role. */
    description: z.string().optional().describe('Description of the access role.'),
    /** Scope type ID or name the access role is scoped by. */
    scopeTypeIdentifier: z
      .string()
      .nullish()
      .describe('Scope type ID or name the access role is scoped by.'),
  })
  .describe('The body of a create-access-role request.');

/**
 * Request body for creating a new access role.
 *
 * Roles API 1.0 model inferred from {@link CreateAccessRoleRequestSchemaV1}, so
 * `CreateAccessRoleRequestV1` and the runtime validator can never describe different shapes.
 */
export type CreateAccessRoleRequestV1 = z.infer<typeof CreateAccessRoleRequestSchemaV1>;
