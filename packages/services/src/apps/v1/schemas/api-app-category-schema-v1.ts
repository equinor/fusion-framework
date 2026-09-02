import { z } from 'zod';

/**
 * Zod schema for the `ApiAppCategory` model published by the Fusion Apps API 1.0.
 *
 * Represents a category that groups related Fusion applications together.
 */
export const ApiAppCategorySchemaV1 = z
  .object({
    /** Accent colour for this category, expressed as a CSS colour string (e.g. #0084C4). */
    color: z
      .string()
      .optional()
      .describe(
        'Accent colour for this category, expressed as a CSS colour string (e.g. #0084C4).',
      ),
    /** Default icon identifier for apps in this category. */
    defaultIcon: z
      .string()
      .optional()
      .describe('Default icon identifier for apps in this category.'),
    /** Human-readable display name for this category. */
    displayName: z.string().optional().describe('Human-readable display name for this category.'),
    /** The unique identifier for this category. */
    id: z.string().optional().describe('The unique identifier for this category.'),
    /** The unique machine-readable name for this category, e.g. project-tools. */
    name: z
      .string()
      .optional()
      .describe('The unique machine-readable name for this category, e.g. project-tools.'),
    /** Determines the display order of this category; lower values appear first. */
    sortOrder: z
      .union([z.number(), z.string()])
      .optional()
      .describe('Determines the display order of this category; lower values appear first.'),
  })
  .describe('Represents a category that groups related Fusion applications together.');

/**
 * Represents a category that groups related Fusion applications together.
 *
 * Apps API 1.0 model inferred from {@link ApiAppCategorySchemaV1}, so `ApiAppCategoryV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiAppCategoryV1 = z.infer<typeof ApiAppCategorySchemaV1>;
