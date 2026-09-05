import { z } from 'zod';

/**
 * Zod schema for the `CreateAppCategoryRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to create a new app category used to group apps in the portal.
 */
export const CreateAppCategoryRequestSchemaV1 = z
  .object({
    /** The display color for the category, e.g. a hex color code. */
    color: z
      .string()
      .optional()
      .describe('The display color for the category, e.g. a hex color code.'),
    /** The default icon identifier for apps in this category. */
    defaultIcon: z
      .string()
      .optional()
      .describe('The default icon identifier for apps in this category.'),
    /** The human-readable display name shown in the UI. */
    displayName: z.string().optional().describe('The human-readable display name shown in the UI.'),
    /** The unique system name for the category. Must be URL-safe and 3–50 characters. */
    name: z
      .string()
      .optional()
      .describe('The unique system name for the category. Must be URL-safe and 3–50 characters.'),
    /** Optional sort order that controls the category's position in lists. */
    sortOrder: z
      .union([z.number(), z.string()])
      .nullish()
      .describe("Optional sort order that controls the category's position in lists."),
  })
  .describe('Request to create a new app category used to group apps in the portal.');

/**
 * Request to create a new app category used to group apps in the portal.
 *
 * Apps API 1.0 model inferred from {@link CreateAppCategoryRequestSchemaV1}, so
 * `CreateAppCategoryRequestV1` and the runtime validator can never describe different shapes.
 */
export type CreateAppCategoryRequestV1 = z.infer<typeof CreateAppCategoryRequestSchemaV1>;
