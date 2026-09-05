import { z } from 'zod';
import { ExpressionTypeSchemaV1 } from './expression-type-schema-v1';

/**
 * Zod schema for the `ODataExpression` model published by the Fusion Apps API 1.0.
 *
 * A parsed OData filter expression node.
 */
export const ODataExpressionSchemaV1 = z
  .strictObject({
    /** Whether the expression tree holds any filter node. */
    hasFilters: z
      .boolean()
      .optional()
      .describe('Whether the expression tree holds any filter node.'),
    /** Kind of node this expression is. */
    type: ExpressionTypeSchemaV1.optional().describe('Kind of node this expression is.'),
  })
  .describe('A parsed OData filter expression node.');

/**
 * A parsed OData filter expression node.
 *
 * Apps API 1.0 model inferred from {@link ODataExpressionSchemaV1}, so `ODataExpressionV1` and the
 * runtime validator can never describe different shapes.
 */
export type ODataExpressionV1 = z.infer<typeof ODataExpressionSchemaV1>;
