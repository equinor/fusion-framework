import { z } from 'zod';

/**
 * Zod schema for the `ExpressionType` model published by the Fusion Apps API 1.0.
 *
 * The kind of node an OData expression tree holds.
 */
export const ExpressionTypeSchemaV1 = z
  .enum(['Empty', 'Group', 'FilterValue'])
  .describe('The kind of node an OData expression tree holds.');

/**
 * The kind of node an OData expression tree holds.
 *
 * Apps API 1.0 model inferred from {@link ExpressionTypeSchemaV1}, so `ExpressionTypeV1` and the
 * runtime validator can never describe different shapes.
 */
export type ExpressionTypeV1 = z.infer<typeof ExpressionTypeSchemaV1>;
