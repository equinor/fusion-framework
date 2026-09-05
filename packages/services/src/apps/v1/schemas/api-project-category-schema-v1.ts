import { z } from 'zod';

/**
 * Zod schema for the `ApiProjectCategory` model published by the Fusion Apps API 1.0.
 *
 * Represents a project category (e.g. brownfield, greenfield) that a Fusion application is
 * applicable to.
 */
export const ApiProjectCategorySchemaV1 = z
  .object({
    /** The UTC date and time when this category was registered. */
    createdAt: z
      .string()
      .optional()
      .describe('The UTC date and time when this category was registered.'),
    /** A description of this project category. when the category could not be resolved. */
    description: z
      .string()
      .nullish()
      .describe('A description of this project category. when the category could not be resolved.'),
    /** An error message when the category details could not be resolved from the external system. */
    error: z
      .string()
      .nullish()
      .describe(
        'An error message when the category details could not be resolved from the external system.',
      ),
    /** The external identifier for this category as defined in the source system (e.g. ProCoSys). */
    externalId: z
      .string()
      .optional()
      .describe(
        'The external identifier for this category as defined in the source system (e.g. ProCoSys).',
      ),
    /** The internal unique identifier for this project category. */
    id: z.string().optional().describe('The internal unique identifier for this project category.'),
    /** The display name for this category. when the category could not be resolved; see @error. */
    name: z
      .string()
      .nullish()
      .describe(
        'The display name for this category. when the category could not be resolved; see @error.',
      ),
  })
  .describe(
    'Represents a project category (e.g. brownfield, greenfield) that a Fusion application is applicable to.',
  );

/**
 * Represents a project category (e.g. brownfield, greenfield) that a Fusion application is
 * applicable to.
 *
 * Apps API 1.0 model inferred from {@link ApiProjectCategorySchemaV1}, so `ApiProjectCategoryV1`
 * and the runtime validator can never describe different shapes.
 */
export type ApiProjectCategoryV1 = z.infer<typeof ApiProjectCategorySchemaV1>;
