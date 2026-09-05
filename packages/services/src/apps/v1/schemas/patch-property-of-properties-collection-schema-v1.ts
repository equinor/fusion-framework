import { z } from 'zod';

/**
 * Zod schema for the `PatchPropertyOfPropertiesCollection` model published by the Fusion Apps API
 * 1.0.
 *
 * Updated set of arbitrary key-value properties associated with the app governance record.
 */
export const PatchPropertyOfPropertiesCollectionSchemaV1 = z
  .record(z.string(), z.unknown())
  .nullable()
  .describe(
    'Updated set of arbitrary key-value properties associated with the app governance record.',
  );

/**
 * Updated set of arbitrary key-value properties associated with the app governance record.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfPropertiesCollectionSchemaV1}, so
 * `PatchPropertyOfPropertiesCollectionV1` and the runtime validator can never describe different
 * shapes.
 */
export type PatchPropertyOfPropertiesCollectionV1 = z.infer<
  typeof PatchPropertyOfPropertiesCollectionSchemaV1
>;
