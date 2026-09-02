import { z } from 'zod';

/**
 * Zod schema for the `SortDirection` model published by the Fusion Apps API 1.0.
 *
 * The direction an OData `$orderby` option sorts in.
 */
export const SortDirectionSchemaV1 = z
  .enum(['asc', 'desc'])
  .describe('The direction an OData `$orderby` option sorts in.');

/**
 * The direction an OData `$orderby` option sorts in.
 *
 * Apps API 1.0 model inferred from {@link SortDirectionSchemaV1}, so `SortDirectionV1` and the
 * runtime validator can never describe different shapes.
 */
export type SortDirectionV1 = z.infer<typeof SortDirectionSchemaV1>;
