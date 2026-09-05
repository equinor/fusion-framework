import { z } from 'zod';

/** Zod schema fragment validating an OData `$orderby` expression. */
export const OrderBySchemaV1 = z.string().optional().describe('an OData `$orderby` expression.');

/**
 * The OData `$orderby` expression Apps API 1.0 accepts on collection endpoints.
 *
 * Apps API 1.0 model inferred from {@link OrderBySchemaV1}, so `OrderByV1` and the runtime validator can
 * never describe different shapes.
 */
export type OrderByV1 = z.infer<typeof OrderBySchemaV1>;
