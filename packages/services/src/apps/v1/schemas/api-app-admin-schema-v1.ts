import { z } from 'zod';

/**
 * Zod schema for the `ApiAppAdmin` model published by the Fusion Apps API 1.0.
 *
 * An Azure AD account registered as an administrator of a Fusion application. Administrators can
 * manage app settings and deployments.
 */
export const ApiAppAdminSchemaV1 = z
  .object({
    /** The classification of the account, e.g. Internal or External. */
    accountClassification: z
      .string()
      .nullish()
      .describe('The classification of the account, e.g. Internal or External.'),
    /** The Azure AD account type, e.g. Employee, Consultant. */
    accountType: z
      .string()
      .nullish()
      .describe('The Azure AD account type, e.g. Employee, Consultant.'),
    /** The Azure AD object ID for this account. if the account could not be resolved. */
    azureUniqueId: z
      .string()
      .nullish()
      .describe('The Azure AD object ID for this account. if the account could not be resolved.'),
    /** The display name of the account, e.g. John Doe. */
    displayName: z.string().nullish().describe('The display name of the account, e.g. John Doe.'),
    /** The internal unique identifier for this admin record. */
    id: z.string().optional().describe('The internal unique identifier for this admin record.'),
    /** when the account is expired and should no longer have access. */
    isExpired: z
      .boolean()
      .optional()
      .describe('when the account is expired and should no longer have access.'),
    /** The email address of the account. */
    mail: z.string().nullish().describe('The email address of the account.'),
    /** The User Principal Name (UPN) of the account, e.g. jdoe@equinor.com. */
    upn: z
      .string()
      .nullish()
      .describe('The User Principal Name (UPN) of the account, e.g. jdoe@equinor.com.'),
  })
  .describe(
    'An Azure AD account registered as an administrator of a Fusion application. Administrators can manage app settings and deployments.',
  );

/**
 * An Azure AD account registered as an administrator of a Fusion application. Administrators can
 * manage app settings and deployments.
 *
 * Apps API 1.0 model inferred from {@link ApiAppAdminSchemaV1}, so `ApiAppAdminV1` and the runtime
 * validator can never describe different shapes.
 */
export type ApiAppAdminV1 = z.infer<typeof ApiAppAdminSchemaV1>;
