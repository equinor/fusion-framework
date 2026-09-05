import { z } from 'zod';

/**
 * Zod schema for the `ApiTaggedPerson` model published by the Fusion Apps API 1.0.
 *
 * Represents a person who has been tagged with a specific app tag, combining person identity
 * information with the tag name.
 */
export const ApiTaggedPersonSchemaV1 = z
  .record(z.string(), z.unknown())
  .describe(
    'Represents a person who has been tagged with a specific app tag, combining person identity information with the tag name.',
  );

/**
 * Represents a person who has been tagged with a specific app tag, combining person identity
 * information with the tag name.
 *
 * Apps API 1.0 model inferred from {@link ApiTaggedPersonSchemaV1}, so `ApiTaggedPersonV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiTaggedPersonV1 = z.infer<typeof ApiTaggedPersonSchemaV1>;
