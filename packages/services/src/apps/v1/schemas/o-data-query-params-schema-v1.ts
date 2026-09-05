import { z } from 'zod';
import { ODataExpandItemSchemaV1 } from './o-data-expand-item-schema-v1';
import { ODataExpressionSchemaV1 } from './o-data-expression-schema-v1';
import { ODataOrderByOptionSchemaV1 } from './o-data-order-by-option-schema-v1';

/**
 * Zod schema for the `ODataQueryParams` model published by the Fusion Apps API 1.0.
 *
 * The OData query options the Apps service parsed from a request.
 */
export const ODataQueryParamsSchemaV1 = z
  .strictObject({
    /** Parsed `$expand` items of the query. */
    expand: z
      .array(ODataExpandItemSchemaV1)
      .nullish()
      .describe('Parsed `$expand` items of the query.'),
    /** Parsed `$filter` expression of the query. */
    filter: ODataExpressionSchemaV1.optional().describe(
      'Parsed `$filter` expression of the query.',
    ),
    /** Whether the query carries `$expand`. */
    hasExpand: z.boolean().optional().describe('Whether the query carries `$expand`.'),
    /** Whether an expanded field carries `$select`. */
    hasExpandSelect: z
      .boolean()
      .optional()
      .describe('Whether an expanded field carries `$select`.'),
    /** Whether the query carries `$filter`. */
    hasFilter: z.boolean().optional().describe('Whether the query carries `$filter`.'),
    /** Whether the query carries `$orderby`. */
    hasOrderBy: z.boolean().optional().describe('Whether the query carries `$orderby`.'),
    /** Whether the query carries `$search`. */
    hasSearch: z.boolean().optional().describe('Whether the query carries `$search`.'),
    /** Whether the query carries `$select`. */
    hasSelect: z.boolean().optional().describe('Whether the query carries `$select`.'),
    /** Whether the query carries no OData option at all. */
    isEmpty: z.boolean().optional().describe('Whether the query carries no OData option at all.'),
    /** Parsed `$orderby` options of the query. */
    orderBy: z
      .array(ODataOrderByOptionSchemaV1)
      .nullish()
      .describe('Parsed `$orderby` options of the query.'),
    /** Parsed `$search` term of the query. */
    search: z.string().nullish().describe('Parsed `$search` term of the query.'),
    /** Parsed `$select` fields of the query. */
    select: z.array(z.string()).nullish().describe('Parsed `$select` fields of the query.'),
    /** Parsed `$skip` value of the query. */
    skip: z.number().nullish().describe('Parsed `$skip` value of the query.'),
    /** Parsed `$top` value of the query. */
    top: z.number().nullish().describe('Parsed `$top` value of the query.'),
  })
  .describe('The OData query options the Apps service parsed from a request.');

/**
 * The OData query options the Apps service parsed from a request.
 *
 * Apps API 1.0 model inferred from {@link ODataQueryParamsSchemaV1}, so `ODataQueryParamsV1` and
 * the runtime validator can never describe different shapes.
 */
export type ODataQueryParamsV1 = z.infer<typeof ODataQueryParamsSchemaV1>;
