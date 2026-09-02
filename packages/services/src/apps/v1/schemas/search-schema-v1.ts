import { z } from 'zod';

/** Zod schema fragment validating a `$search` term. */
export const SearchSchemaV1 = z.string().optional().describe('a `$search` term.');

/**
 * The free-text `$search` term Apps API 1.0 accepts on searchable collection endpoints.
 *
 * Apps API 1.0 model inferred from {@link SearchSchemaV1}, so `SearchV1` and the runtime validator can
 * never describe different shapes.
 */
export type SearchV1 = z.infer<typeof SearchSchemaV1>;
