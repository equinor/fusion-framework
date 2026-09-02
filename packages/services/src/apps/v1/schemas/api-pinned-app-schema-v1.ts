import { z } from 'zod';
import { ApiPinnedAppCategorySchemaV1 } from './api-pinned-app-category-schema-v1';

/**
 * Zod schema for the `ApiPinnedApp` model published by the Fusion Apps API 1.0.
 *
 * A Fusion application that has been pinned to a user's personal portal launcher.
 */
export const ApiPinnedAppSchemaV1 = z
  .object({
    /** Accent color used for the application tile in the portal launcher, expressed as a CSS colour string. */
    accentColor: z
      .string()
      .optional()
      .describe(
        'Accent color used for the application tile in the portal launcher, expressed as a CSS colour string.',
      ),
    /** Category the pinned application is filed under. */
    appCategory: ApiPinnedAppCategorySchemaV1.nullish().describe(
      'Category the pinned application is filed under.',
    ),
    /** Short description of the application's purpose. */
    description: z.string().optional().describe("Short description of the application's purpose."),
    /** Icon identifier for this application in the portal launcher. */
    icon: z
      .string()
      .optional()
      .describe('Icon identifier for this application in the portal launcher.'),
    /** The unique short identifier (app key) for the application, e.g. my-app. */
    key: z
      .string()
      .optional()
      .describe('The unique short identifier (app key) for the application, e.g. my-app.'),
    /** Human-readable display name for the application. */
    name: z.string().optional().describe('Human-readable display name for the application.'),
  })
  .describe("A Fusion application that has been pinned to a user's personal portal launcher.");

/**
 * A Fusion application that has been pinned to a user's personal portal launcher.
 *
 * Apps API 1.0 model inferred from {@link ApiPinnedAppSchemaV1}, so `ApiPinnedAppV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiPinnedAppV1 = z.infer<typeof ApiPinnedAppSchemaV1>;
