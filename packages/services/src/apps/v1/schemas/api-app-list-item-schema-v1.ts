import { z } from 'zod';
import { ApiAppAdminSchemaV1 } from './api-app-admin-schema-v1';
import { ApiAppCategorySchemaV1 } from './api-app-category-schema-v1';
import { ApiAppComplianceSummarySchemaV1 } from './api-app-compliance-summary-schema-v1';
import { ApiAppContextSchemaV1 } from './api-app-context-schema-v1';
import { ApiAppOwnerSchemaV1 } from './api-app-owner-schema-v1';
import { ApiAppVersionSchemaV1 } from './api-app-version-schema-v1';
import { ApiAppVisualizationSchemaV1 } from './api-app-visualization-schema-v1';
import { ApiDataClassificationSchemaV1 } from './api-data-classification-schema-v1';

/**
 * Zod schema for the `ApiAppListItem` model published by the Fusion Apps API 1.0.
 *
 * A condensed list-view representation of a Fusion application. Used in collection endpoints where
 * full app details are not required.
 */
export const ApiAppListItemSchemaV1 = z
  .object({
    /** Accounts registered as administrators of this application. */
    admins: z
      .array(ApiAppAdminSchemaV1)
      .nullish()
      .describe('Accounts registered as administrators of this application.'),
    /** The unique short identifier for the application, e.g. my-app. */
    appKey: z
      .string()
      .optional()
      .describe('The unique short identifier for the application, e.g. my-app.'),
    /** Build the application currently serves, when one is registered. */
    build: ApiAppVersionSchemaV1.nullish().describe(
      'Build the application currently serves, when one is registered.',
    ),
    /** Category the application is filed under, when one is assigned. */
    category: ApiAppCategorySchemaV1.nullish().describe(
      'Category the application is filed under, when one is assigned.',
    ),
    /** Data classification registered for the application. */
    classification: ApiDataClassificationSchemaV1.nullish().describe(
      'Data classification registered for the application.',
    ),
    /** Counts of the compliance findings currently open. */
    complianceSummary: ApiAppComplianceSummarySchemaV1.nullish().describe(
      'Counts of the compliance findings currently open.',
    ),
    /** Context types this application supports. when the app is context-independent. */
    contexts: z
      .array(ApiAppContextSchemaV1)
      .nullish()
      .describe('Context types this application supports. when the app is context-independent.'),
    /** Short description of the application's purpose. */
    description: z.string().optional().describe("Short description of the application's purpose."),
    /** Human-readable display name shown in the Fusion portal. */
    displayName: z
      .string()
      .optional()
      .describe('Human-readable display name shown in the Fusion portal.'),
    /** The internal unique identifier for the application. */
    id: z.string().optional().describe('The internal unique identifier for the application.'),
    /** Free-text keywords used for search and discovery. */
    keywords: z
      .array(z.string())
      .nullish()
      .describe('Free-text keywords used for search and discovery.'),
    /** Accounts registered as owners of this application. */
    owners: z
      .array(ApiAppOwnerSchemaV1)
      .nullish()
      .describe('Accounts registered as owners of this application.'),
    /** The app key of the template this application is based on, if any. */
    templateSource: z
      .string()
      .nullish()
      .describe('The app key of the template this application is based on, if any.'),
    /** Application type name, e.g. standalone or report. */
    type: z.string().optional().describe('Application type name, e.g. standalone or report.'),
    /** Icon, colour, and sort order used when the app is presented. */
    visualization: ApiAppVisualizationSchemaV1.nullish().describe(
      'Icon, colour, and sort order used when the app is presented.',
    ),
  })
  .describe(
    'A condensed list-view representation of a Fusion application. Used in collection endpoints where full app details are not required.',
  );

/**
 * A condensed list-view representation of a Fusion application. Used in collection endpoints where
 * full app details are not required.
 *
 * Apps API 1.0 model inferred from {@link ApiAppListItemSchemaV1}, so `ApiAppListItemV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiAppListItemV1 = z.infer<typeof ApiAppListItemSchemaV1>;
