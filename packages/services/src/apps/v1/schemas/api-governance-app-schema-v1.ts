import { z } from 'zod';
import { ApiBusinessOwnerOrgUnitSchemaV1 } from './api-business-owner-org-unit-schema-v1';
import { ApiBusinessOwnerSchemaV1 } from './api-business-owner-schema-v1';
import { ApiDataClassificationSchemaV1 } from './api-data-classification-schema-v1';
import { ApiGovernanceConfirmationSchemaV1 } from './api-governance-confirmation-schema-v1';
import { ApiGovernanceDocumentSchemaV1 } from './api-governance-document-schema-v1';
import { ApiProjectCategorySchemaV1 } from './api-project-category-schema-v1';
import { ApiProjectPhaseSchemaV1 } from './api-project-phase-schema-v1';
import { ApiTechnologyProductSchemaV1 } from './api-technology-product-schema-v1';

/**
 * Zod schema for the `ApiGovernanceApp` model published by the Fusion Apps API 1.0.
 *
 * Full governance details for a Fusion application, including data classification, business
 * ownership, project scoping, and supporting documents.
 */
export const ApiGovernanceAppSchemaV1 = z
  .object({
    /** The unique short identifier for the application, e.g. my-app. */
    appKey: z
      .string()
      .optional()
      .describe('The unique short identifier for the application, e.g. my-app.'),
    /** Organisational unit owning the application. */
    businessOwnerOrgUnit: ApiBusinessOwnerOrgUnitSchemaV1.nullish().describe(
      'Organisational unit owning the application.',
    ),
    /** The individuals registered as business owners for this application. */
    businessOwners: z
      .array(ApiBusinessOwnerSchemaV1)
      .optional()
      .describe('The individuals registered as business owners for this application.'),
    /** Data classification registered for the application. */
    classification: ApiDataClassificationSchemaV1.nullish().describe(
      'Data classification registered for the application.',
    ),
    /** Most recent confirmation of the governance information. */
    confirmation: ApiGovernanceConfirmationSchemaV1.nullish().describe(
      'Most recent confirmation of the governance information.',
    ),
    /** Human-readable display name for the application. */
    displayName: z.string().optional().describe('Human-readable display name for the application.'),
    /** All governance documents (policies, risk assessments, etc.) associated with this application. */
    documents: z
      .array(ApiGovernanceDocumentSchemaV1)
      .optional()
      .describe(
        'All governance documents (policies, risk assessments, etc.) associated with this application.',
      ),
    /** Project categories this application is applicable to. */
    projectCategories: z
      .array(ApiProjectCategorySchemaV1)
      .optional()
      .describe('Project categories this application is applicable to.'),
    /** Project phases this application is applicable to. */
    projectPhases: z
      .array(ApiProjectPhaseSchemaV1)
      .optional()
      .describe('Project phases this application is applicable to.'),
    /** Additional custom properties attached to this governance record. */
    properties: z
      .record(z.string(), z.unknown())
      .nullish()
      .describe('Additional custom properties attached to this governance record.'),
    /** when this application is applicable to all project categories, not just the listed ones. */
    supportsAllProjectCategories: z
      .boolean()
      .optional()
      .describe(
        'when this application is applicable to all project categories, not just the listed ones.',
      ),
    /** when this application is applicable to all project phases, not just the listed ones. */
    supportsAllProjectPhases: z
      .boolean()
      .optional()
      .describe(
        'when this application is applicable to all project phases, not just the listed ones.',
      ),
    /** Technology product the application belongs to. */
    technologyProduct: ApiTechnologyProductSchemaV1.nullish().describe(
      'Technology product the application belongs to.',
    ),
    /** The UTC date and time when governance information was last updated. */
    updatedAt: z
      .string()
      .nullish()
      .describe('The UTC date and time when governance information was last updated.'),
  })
  .describe(
    'Full governance details for a Fusion application, including data classification, business ownership, project scoping, and supporting documents.',
  );

/**
 * Full governance details for a Fusion application, including data classification, business
 * ownership, project scoping, and supporting documents.
 *
 * Apps API 1.0 model inferred from {@link ApiGovernanceAppSchemaV1}, so `ApiGovernanceAppV1` and
 * the runtime validator can never describe different shapes.
 */
export type ApiGovernanceAppV1 = z.infer<typeof ApiGovernanceAppSchemaV1>;
