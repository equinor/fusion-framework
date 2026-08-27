import { z } from 'zod';

/** Zod schema fragment validating an `$expand` expression. */
export const ExpandSchemaV1 = z.string().optional().describe('An `$expand` expression.');

/**
 * The `$expand` expression Roles API 1.0 accepts on endpoints that can inline related
 * resources.
 *
 * Roles API 1.0 model inferred from {@link ExpandSchemaV1}, so `ExpandV1` and the runtime
 * validator can never describe different shapes.
 */
export type ExpandV1 = z.infer<typeof ExpandSchemaV1>;
