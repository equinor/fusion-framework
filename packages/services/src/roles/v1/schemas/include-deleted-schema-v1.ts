import { z } from 'zod';

/** Zod schema fragment validating the `includeDeleted` toggle on role binding configurations. */
export const IncludeDeletedSchemaV1 = z
  .boolean()
  .optional()
  .describe('The `includeDeleted` toggle on role binding configurations.');

/**
 * The `includeDeleted` toggle Roles API 1.0 accepts on role binding configuration reads, which
 * also returns soft-deleted records.
 *
 * Roles API 1.0 model inferred from {@link IncludeDeletedSchemaV1}, so `IncludeDeletedV1` and
 * the runtime validator can never describe different shapes.
 */
export type IncludeDeletedV1 = z.infer<typeof IncludeDeletedSchemaV1>;
