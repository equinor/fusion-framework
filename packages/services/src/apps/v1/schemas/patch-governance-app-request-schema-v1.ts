import { z } from 'zod';
import { PatchPropertyOfBooleanSchemaV1 } from './patch-property-of-boolean-schema-v1';
import { PatchPropertyOfDataClassificationRequestSchemaV1 } from './patch-property-of-data-classification-request-schema-v1';
import { PatchPropertyOfListOfUpdateBusinessOwnerRequestSchemaV1 } from './patch-property-of-list-of-update-business-owner-request-schema-v1';
import { PatchPropertyOfListOfUpdateProjectCategoryRequestSchemaV1 } from './patch-property-of-list-of-update-project-category-request-schema-v1';
import { PatchPropertyOfListOfUpdateProjectPhaseRequestSchemaV1 } from './patch-property-of-list-of-update-project-phase-request-schema-v1';
import { PatchPropertyOfPropertiesCollectionSchemaV1 } from './patch-property-of-properties-collection-schema-v1';
import { PatchPropertyOfUpdateBusinessOwnerOrgUnitRequestSchemaV1 } from './patch-property-of-update-business-owner-org-unit-request-schema-v1';
import { PatchPropertyOfUpdateTechnologyProductForAppRequestSchemaV1 } from './patch-property-of-update-technology-product-for-app-request-schema-v1';

/**
 * Zod schema for the `PatchGovernanceAppRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to partially update the governance information of an app. Only fields that are explicitly
 * set will be applied.
 */
export const PatchGovernanceAppRequestSchemaV1 = z
  .object({
    /** Organisational unit owning the application. */
    businessOwnerOrgUnit:
      PatchPropertyOfUpdateBusinessOwnerOrgUnitRequestSchemaV1.optional().describe(
        'Organisational unit owning the application.',
      ),
    /** Accounts owning the application from the business side. */
    businessOwners: PatchPropertyOfListOfUpdateBusinessOwnerRequestSchemaV1.optional().describe(
      'Accounts owning the application from the business side.',
    ),
    /** Data classification of the application. */
    classification: PatchPropertyOfDataClassificationRequestSchemaV1.optional().describe(
      'Data classification of the application.',
    ),
    /** Project categories the application supports. */
    projectCategories:
      PatchPropertyOfListOfUpdateProjectCategoryRequestSchemaV1.optional().describe(
        'Project categories the application supports.',
      ),
    /** Project phases the application supports. */
    projectPhases: PatchPropertyOfListOfUpdateProjectPhaseRequestSchemaV1.optional().describe(
      'Project phases the application supports.',
    ),
    /** Free-form governance properties of the application. */
    properties: PatchPropertyOfPropertiesCollectionSchemaV1.optional().describe(
      'Free-form governance properties of the application.',
    ),
    /** Whether the application supports every project category. */
    supportsAllProjectCategories: PatchPropertyOfBooleanSchemaV1.optional().describe(
      'Whether the application supports every project category.',
    ),
    /** Whether the application supports every project phase. */
    supportsAllProjectPhases: PatchPropertyOfBooleanSchemaV1.optional().describe(
      'Whether the application supports every project phase.',
    ),
    /** Technology product the application belongs to. */
    technologyProduct:
      PatchPropertyOfUpdateTechnologyProductForAppRequestSchemaV1.optional().describe(
        'Technology product the application belongs to.',
      ),
  })
  .describe(
    'Request to partially update the governance information of an app. Only fields that are explicitly set will be applied.',
  );

/**
 * Request to partially update the governance information of an app. Only fields that are explicitly
 * set will be applied.
 *
 * Apps API 1.0 model inferred from {@link PatchGovernanceAppRequestSchemaV1}, so
 * `PatchGovernanceAppRequestV1` and the runtime validator can never describe different shapes.
 */
export type PatchGovernanceAppRequestV1 = z.infer<typeof PatchGovernanceAppRequestSchemaV1>;
