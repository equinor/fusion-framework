import { z } from 'zod';

/**
 * Zod schema for the `ApiBusinessOwner` model published by the Fusion Apps API 1.0.
 *
 * Represents an individual registered as a business owner of a Fusion application, including their
 * assigned role and the rationale for their ownership.
 */
export const ApiBusinessOwnerSchemaV1 = z
  .object({
    /** The Azure AD object ID of the business owner. */
    azureUniqueId: z.string().optional().describe('The Azure AD object ID of the business owner.'),
    /** The UTC date and time when this person was added as a business owner. */
    createdAt: z
      .string()
      .optional()
      .describe('The UTC date and time when this person was added as a business owner.'),
    /** when the account is expired and should no longer have access. */
    isExpired: z
      .boolean()
      .optional()
      .describe('when the account is expired and should no longer have access.'),
    /** The email address of the business owner. */
    mail: z.string().nullish().describe('The email address of the business owner.'),
    /** The justification provided when this person was designated as a business owner. */
    reason: z
      .string()
      .nullish()
      .describe('The justification provided when this person was designated as a business owner.'),
    /** The machine-readable role name assigned to this business owner, e.g. BusinessOwner. */
    role: z
      .string()
      .optional()
      .describe(
        'The machine-readable role name assigned to this business owner, e.g. BusinessOwner.',
      ),
    /** Human-readable display name for the business owner role. */
    roleDisplayName: z
      .string()
      .optional()
      .describe('Human-readable display name for the business owner role.'),
    /** The User Principal Name (UPN) of the business owner, e.g. jdoe@equinor.com. */
    upn: z
      .string()
      .nullish()
      .describe('The User Principal Name (UPN) of the business owner, e.g. jdoe@equinor.com.'),
  })
  .describe(
    'Represents an individual registered as a business owner of a Fusion application, including their assigned role and the rationale for their ownership.',
  );

/**
 * Represents an individual registered as a business owner of a Fusion application, including their
 * assigned role and the rationale for their ownership.
 *
 * Apps API 1.0 model inferred from {@link ApiBusinessOwnerSchemaV1}, so `ApiBusinessOwnerV1` and
 * the runtime validator can never describe different shapes.
 */
export type ApiBusinessOwnerV1 = z.infer<typeof ApiBusinessOwnerSchemaV1>;
