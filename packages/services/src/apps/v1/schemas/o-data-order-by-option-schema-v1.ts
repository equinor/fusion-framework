import { z } from 'zod';
import { SortDirectionSchemaV1 } from './sort-direction-schema-v1';

/**
 * Zod schema for the `ODataOrderByOption` model published by the Fusion Apps API 1.0.
 *
 * One `$orderby` option of a parsed OData query.
 */
export const ODataOrderByOptionSchemaV1 = z
  .strictObject({
    /** Direction this option sorts in. */
    direction: SortDirectionSchemaV1.optional().describe('Direction this option sorts in.'),
    /** Field this option sorts by. */
    field: z.string().nullish().describe('Field this option sorts by.'),
  })
  .describe('One `$orderby` option of a parsed OData query.');

/**
 * One `$orderby` option of a parsed OData query.
 *
 * Apps API 1.0 model inferred from {@link ODataOrderByOptionSchemaV1}, so `ODataOrderByOptionV1`
 * and the runtime validator can never describe different shapes.
 */
export type ODataOrderByOptionV1 = z.infer<typeof ODataOrderByOptionSchemaV1>;
