import { z } from 'zod';

/**
 * Zod schema for the `ApiPinnedAppCategory` model published by the Fusion Apps API 1.0.
 *
 * The category this pinned application belongs to. if the app is uncategorised.
 */
export const ApiPinnedAppCategorySchemaV1 = z
  .object({
    /** Accent color for this category, expressed as a CSS color string (e.g. #0084C4). */
    color: z
      .string()
      .optional()
      .describe('Accent color for this category, expressed as a CSS color string (e.g. #0084C4).'),
    /** Human-readable display name for this category. */
    displayName: z.string().optional().describe('Human-readable display name for this category.'),
    /** Icon identifier for this category. */
    icon: z.string().optional().describe('Icon identifier for this category.'),
    /** The unique identifier for this category. */
    id: z.string().optional().describe('The unique identifier for this category.'),
  })
  .describe('The category this pinned application belongs to. if the app is uncategorised.');

/**
 * The category this pinned application belongs to. if the app is uncategorised.
 *
 * Apps API 1.0 model inferred from {@link ApiPinnedAppCategorySchemaV1}, so
 * `ApiPinnedAppCategoryV1` and the runtime validator can never describe different shapes.
 */
export type ApiPinnedAppCategoryV1 = z.infer<typeof ApiPinnedAppCategorySchemaV1>;
