import { z } from 'zod';
import { PatchPropertyOfAppCategoryIdentifierSchemaV1 } from './patch-property-of-app-category-identifier-schema-v1';
import { PatchPropertyOfListOfAccountIdentifierSchemaV1 } from './patch-property-of-list-of-account-identifier-schema-v1';
import { PatchPropertyOfListOfAppContextRequestSchemaV1 } from './patch-property-of-list-of-app-context-request-schema-v1';
import { PatchPropertyOfListOfStringSchemaV1 } from './patch-property-of-list-of-string-schema-v1';
import { PatchPropertyOfPatchAppServiceNowConfigurationRequestSchemaV1 } from './patch-property-of-patch-app-service-now-configuration-request-schema-v1';
import { PatchPropertyOfPatchAppVisualizationRequestSchemaV1 } from './patch-property-of-patch-app-visualization-request-schema-v1';
import { PatchPropertyOfStringSchemaV1 } from './patch-property-of-string-schema-v1';
import { PatchPropertyOfTemplateSourceRequestSchemaV1 } from './patch-property-of-template-source-request-schema-v1';

/**
 * Zod schema for the `PatchAppRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to partially update an existing app. Only fields that are explicitly set will be applied.
 */
export const PatchAppRequestSchemaV1 = z
  .object({
    /** Accounts administering the application. */
    admins: PatchPropertyOfListOfAccountIdentifierSchemaV1.optional().describe(
      'Accounts administering the application.',
    ),
    /** Category the application is filed under. */
    category: PatchPropertyOfAppCategoryIdentifierSchemaV1.optional().describe(
      'Category the application is filed under.',
    ),
    /** Context types the application supports. */
    contexts: PatchPropertyOfListOfAppContextRequestSchemaV1.optional().describe(
      'Context types the application supports.',
    ),
    /** Short description of the application. */
    description: PatchPropertyOfStringSchemaV1.optional().describe(
      'Short description of the application.',
    ),
    /** Display name shown in the Fusion portal. */
    displayName: PatchPropertyOfStringSchemaV1.optional().describe(
      'Display name shown in the Fusion portal.',
    ),
    /** Keywords used for search and discovery. */
    keywords: PatchPropertyOfListOfStringSchemaV1.optional().describe(
      'Keywords used for search and discovery.',
    ),
    /** Accounts owning the application. */
    owners: PatchPropertyOfListOfAccountIdentifierSchemaV1.optional().describe(
      'Accounts owning the application.',
    ),
    /** ServiceNow support configuration of the app. */
    serviceNowConfiguration:
      PatchPropertyOfPatchAppServiceNowConfigurationRequestSchemaV1.optional().describe(
        'ServiceNow support configuration of the app.',
      ),
    /** Template app and build this application is based on. */
    templateSource: PatchPropertyOfTemplateSourceRequestSchemaV1.optional().describe(
      'Template app and build this application is based on.',
    ),
    /** Application type, such as standalone or report. */
    type: PatchPropertyOfStringSchemaV1.optional().describe(
      'Application type, such as standalone or report.',
    ),
    /** Icon, colour, and sort order used when presenting the app. */
    visualization: PatchPropertyOfPatchAppVisualizationRequestSchemaV1.optional().describe(
      'Icon, colour, and sort order used when presenting the app.',
    ),
  })
  .describe(
    'Request to partially update an existing app. Only fields that are explicitly set will be applied.',
  );

/**
 * Request to partially update an existing app. Only fields that are explicitly set will be applied.
 *
 * Apps API 1.0 model inferred from {@link PatchAppRequestSchemaV1}, so `PatchAppRequestV1` and the
 * runtime validator can never describe different shapes.
 */
export type PatchAppRequestV1 = z.infer<typeof PatchAppRequestSchemaV1>;
