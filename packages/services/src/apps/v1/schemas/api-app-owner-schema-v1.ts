import { z } from 'zod';

/**
 * Zod schema for the `ApiAppOwner` model published by the Fusion Apps API 1.0.
 *
 * An Azure AD account registered as an owner of a Fusion application. Owners are responsible for
 * the application and its governance.
 */
export const ApiAppOwnerSchemaV1 = z
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
    /** The internal unique identifier for this owner record. */
    id: z.string().optional().describe('The internal unique identifier for this owner record.'),
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
    'An Azure AD account registered as an owner of a Fusion application. Owners are responsible for the application and its governance.',
  );

/**
 * An Azure AD account registered as an owner of a Fusion application. Owners are responsible for
 * the application and its governance.
 *
 * Apps API 1.0 model inferred from {@link ApiAppOwnerSchemaV1}, so `ApiAppOwnerV1` and the runtime
 * validator can never describe different shapes.
 */
export type ApiAppOwnerV1 = z.infer<typeof ApiAppOwnerSchemaV1>;
