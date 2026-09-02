import { z } from 'zod';

/**
 * Zod schema for the `ApiBusinessOwnerOrgUnit` model published by the Fusion Apps API 1.0.
 *
 * The organisational unit responsible for business ownership. if not configured.
 */
export const ApiBusinessOwnerOrgUnitSchemaV1 = z
  .object({
    /** An error message set when could not be resolved from the SAP ID. */
    error: z
      .string()
      .nullish()
      .describe('An error message set when could not be resolved from the SAP ID.'),
    /** The full department path resolved from the SAP ID. when resolution fails; see @error. */
    fullDepartment: z
      .string()
      .nullish()
      .describe(
        'The full department path resolved from the SAP ID. when resolution fails; see @error.',
      ),
    /** The SAP ID (department code) for this organisational unit, e.g. TPD RD REN FE2. */
    sapId: z
      .string()
      .optional()
      .describe('The SAP ID (department code) for this organisational unit, e.g. TPD RD REN FE2.'),
  })
  .describe('The organisational unit responsible for business ownership. if not configured.');

/**
 * The organisational unit responsible for business ownership. if not configured.
 *
 * Apps API 1.0 model inferred from {@link ApiBusinessOwnerOrgUnitSchemaV1}, so
 * `ApiBusinessOwnerOrgUnitV1` and the runtime validator can never describe different shapes.
 */
export type ApiBusinessOwnerOrgUnitV1 = z.infer<typeof ApiBusinessOwnerOrgUnitSchemaV1>;
