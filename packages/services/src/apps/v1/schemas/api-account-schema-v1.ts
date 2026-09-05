import { z } from 'zod';

/**
 * Zod schema for the `ApiAccount` model published by the Fusion Apps API 1.0.
 *
 * The account that uploaded this build. for legacy builds.
 */
export const ApiAccountSchemaV1 = z
  .object({
    /** The classification of the account, e.g. Internal or External. */
    accountClassification: z
      .string()
      .nullish()
      .describe('The classification of the account, e.g. Internal or External.'),
    /** The Azure AD account type, e.g. Employee, Consultant. */
    accountType: z
      .string()
      .optional()
      .describe('The Azure AD account type, e.g. Employee, Consultant.'),
    /** The Azure AD object ID for this account. */
    azureUniqueId: z.string().optional().describe('The Azure AD object ID for this account.'),
    /** The display name of the account, e.g. John Doe. */
    displayName: z.string().optional().describe('The display name of the account, e.g. John Doe.'),
    /** when the account is expired and should no longer have active access. */
    isExpired: z
      .boolean()
      .optional()
      .describe('when the account is expired and should no longer have active access.'),
    /** The email address of the account. */
    mail: z.string().nullish().describe('The email address of the account.'),
    /** The User Principal Name (UPN) of the account, e.g. jdoe@equinor.com. */
    upn: z
      .string()
      .nullish()
      .describe('The User Principal Name (UPN) of the account, e.g. jdoe@equinor.com.'),
  })
  .describe('The account that uploaded this build. for legacy builds.');

/**
 * The account that uploaded this build. for legacy builds.
 *
 * Apps API 1.0 model inferred from {@link ApiAccountSchemaV1}, so `ApiAccountV1` and the runtime
 * validator can never describe different shapes.
 */
export type ApiAccountV1 = z.infer<typeof ApiAccountSchemaV1>;
