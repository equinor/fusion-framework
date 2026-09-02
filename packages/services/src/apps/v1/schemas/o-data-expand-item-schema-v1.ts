import { z } from 'zod';

/**
 * Zod schema for the `ODataExpandItem` model published by the Fusion Apps API 1.0.
 *
 * One `$expand` item of a parsed OData query.
 */
export const ODataExpandItemSchemaV1 = z
  .strictObject({
    /** Field the `$expand` item expands. */
    field: z.string().nullish().describe('Field the `$expand` item expands.'),
    /** Whether the expanded field carries a `$select` list. */
    hasSelect: z
      .boolean()
      .optional()
      .describe('Whether the expanded field carries a `$select` list.'),
    /** Fields selected on the expanded field. */
    select: z.array(z.string()).nullish().describe('Fields selected on the expanded field.'),
  })
  .describe('One `$expand` item of a parsed OData query.');

/**
 * One `$expand` item of a parsed OData query.
 *
 * Apps API 1.0 model inferred from {@link ODataExpandItemSchemaV1}, so `ODataExpandItemV1` and the
 * runtime validator can never describe different shapes.
 */
export type ODataExpandItemV1 = z.infer<typeof ODataExpandItemSchemaV1>;
