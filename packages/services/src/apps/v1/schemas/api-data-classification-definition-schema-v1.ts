import { z } from 'zod';

/**
 * Zod schema for the `ApiDataClassificationDefinition` model published by the Fusion Apps API 1.0.
 *
 * Defines a data classification level, providing the name, description, and impact guidance for
 * that level to support self-service classification.
 */
export const ApiDataClassificationDefinitionSchemaV1 = z
  .object({
    /** Human-readable description explaining what types of data belong to this classification level. */
    description: z
      .string()
      .optional()
      .describe(
        'Human-readable description explaining what types of data belong to this classification level.',
      ),
    /** Guidance on the potential impact if data at this level is mishandled or disclosed. */
    impact: z
      .string()
      .optional()
      .describe(
        'Guidance on the potential impact if data at this level is mishandled or disclosed.',
      ),
    /** The machine-readable name for this classification level, e.g. Internal. */
    name: z
      .string()
      .optional()
      .describe('The machine-readable name for this classification level, e.g. Internal.'),
  })
  .describe(
    'Defines a data classification level, providing the name, description, and impact guidance for that level to support self-service classification.',
  );

/**
 * Defines a data classification level, providing the name, description, and impact guidance for
 * that level to support self-service classification.
 *
 * Apps API 1.0 model inferred from {@link ApiDataClassificationDefinitionSchemaV1}, so
 * `ApiDataClassificationDefinitionV1` and the runtime validator can never describe different
 * shapes.
 */
export type ApiDataClassificationDefinitionV1 = z.infer<
  typeof ApiDataClassificationDefinitionSchemaV1
>;
