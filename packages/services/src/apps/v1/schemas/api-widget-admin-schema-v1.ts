import { z } from 'zod';

/**
 * Zod schema for the `ApiWidgetAdmin` model published by the Fusion Apps API 1.0.
 *
 * An Azure AD account registered as an administrator of a Fusion widget.
 */
export const ApiWidgetAdminSchemaV1 = z
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
    /** The email address of the account. */
    mail: z.string().nullish().describe('The email address of the account.'),
    /** The User Principal Name (UPN) of the account, e.g. jdoe@equinor.com. */
    upn: z
      .string()
      .nullish()
      .describe('The User Principal Name (UPN) of the account, e.g. jdoe@equinor.com.'),
  })
  .describe('An Azure AD account registered as an administrator of a Fusion widget.');

/**
 * An Azure AD account registered as an administrator of a Fusion widget.
 *
 * Apps API 1.0 model inferred from {@link ApiWidgetAdminSchemaV1}, so `ApiWidgetAdminV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiWidgetAdminV1 = z.infer<typeof ApiWidgetAdminSchemaV1>;
