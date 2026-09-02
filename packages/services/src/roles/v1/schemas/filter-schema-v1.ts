import { z } from 'zod';

/** Zod schema fragment validating an OData `$filter` expression. */
export const FilterSchemaV1 = z.string().optional().describe('An OData `$filter` expression.');

/**
 * The OData `$filter` expression Roles API 1.0 accepts on collection endpoints.
 *
 * Roles API 1.0 model inferred from {@link FilterSchemaV1}, so `FilterV1` and the runtime
 * validator can never describe different shapes.
 */
export type FilterV1 = z.infer<typeof FilterSchemaV1>;
