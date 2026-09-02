import { z } from 'zod';
import { AccountIdentifierSchemaV1 } from './account-identifier-schema-v1';
import { AppCategoryIdentifierSchemaV1 } from './app-category-identifier-schema-v1';
import { AppContextRequestSchemaV1 } from './app-context-request-schema-v1';
import { AppVisualizationSchemaV1 } from './app-visualization-schema-v1';
import { TemplateSourceRequestSchemaV1 } from './template-source-request-schema-v1';

/**
 * Zod schema for the `CreateAppRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to create a new Fusion application.
 */
export const CreateAppRequestSchemaV1 = z
  .object({
    /** One or more accounts that will be administrators of the app. */
    admins: z
      .array(AccountIdentifierSchemaV1)
      .optional()
      .describe('One or more accounts that will be administrators of the app.'),
    /** The unique key identifier for the app. Must be 3–50 URL-safe characters. */
    appKey: z
      .string()
      .optional()
      .describe('The unique key identifier for the app. Must be 3–50 URL-safe characters.'),
    /** Category to file the application under. */
    category: AppCategoryIdentifierSchemaV1.nullish().describe(
      'Category to file the application under.',
    ),
    /** The context types the app supports. Leave empty to support all contexts. */
    contexts: z
      .array(AppContextRequestSchemaV1)
      .nullish()
      .describe('The context types the app supports. Leave empty to support all contexts.'),
    /** Optional description of the app's purpose. */
    description: z.string().nullish().describe("Optional description of the app's purpose."),
    /** The human-readable display name for the app. */
    displayName: z.string().optional().describe('The human-readable display name for the app.'),
    /** Searchable keywords associated with the app. */
    keywords: z
      .array(z.string())
      .optional()
      .describe('Searchable keywords associated with the app.'),
    /** Optional accounts designated as owners of the app. */
    owners: z
      .array(AccountIdentifierSchemaV1)
      .nullish()
      .describe('Optional accounts designated as owners of the app.'),
    /** Template app and build this application is based on. */
    templateSource: TemplateSourceRequestSchemaV1.nullish().describe(
      'Template app and build this application is based on.',
    ),
    /** standalone | template | template-app | landing-page standalone is default. */
    type: z
      .string()
      .nullish()
      .describe('standalone | template | template-app | landing-page standalone is default.'),
    /** Icon, colour, and sort order used when presenting the app. */
    visualization: AppVisualizationSchemaV1.nullish().describe(
      'Icon, colour, and sort order used when presenting the app.',
    ),
  })
  .describe('Request to create a new Fusion application.');

/**
 * Request to create a new Fusion application.
 *
 * Apps API 1.0 model inferred from {@link CreateAppRequestSchemaV1}, so `CreateAppRequestV1` and
 * the runtime validator can never describe different shapes.
 */
export type CreateAppRequestV1 = z.infer<typeof CreateAppRequestSchemaV1>;
