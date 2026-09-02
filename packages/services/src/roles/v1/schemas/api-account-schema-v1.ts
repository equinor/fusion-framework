import { z } from 'zod';

/** Zod schema for a Fusion account reference embedded in Roles V2 responses. */
export const ApiAccountSchemaV1 = z
  .object({
    /** Azure Active Directory unique object ID, if known. */
    azureUniqueId: z
      .string()
      .nullish()
      .describe('Azure Active Directory unique object ID, if known.'),
    /** Email address, if available. */
    mail: z.string().nullish().describe('Email address, if available.'),
    /** Display name. */
    displayName: z.string().optional().describe('Display name.'),
    /** User principal name (UPN), if available. */
    upn: z.string().nullish().describe('User principal name (UPN), if available.'),
    /** Account type (e.g. Employee, Consultant, ExternalHire). */
    accountType: z
      .string()
      .optional()
      .describe('Account type (e.g. Employee, Consultant, ExternalHire).'),
    /** Account classification, if available. */
    accountClassification: z.string().nullish().describe('Account classification, if available.'),
  })
  .describe('A Fusion account reference embedded in Roles V2 responses.');

/**
 * A Fusion account — a user or an application — as referenced by Roles API 1.0 responses.
 *
 * Roles API 1.0 model inferred from {@link ApiAccountSchemaV1}, so `ApiAccountV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiAccountV1 = z.infer<typeof ApiAccountSchemaV1>;
