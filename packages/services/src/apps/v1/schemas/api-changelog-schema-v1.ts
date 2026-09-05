import { z } from 'zod';

/**
 * Zod schema for the `ApiChangelog` model published by the Fusion Apps API 1.0.
 *
 * A single audit log entry recording a state-changing command executed against a Fusion
 * application.
 */
export const ApiChangelogSchemaV1 = z
  .object({
    /** The Application Insights activity/trace ID associated with the request that triggered this change. */
    activityId: z
      .string()
      .nullish()
      .describe(
        'The Application Insights activity/trace ID associated with the request that triggered this change.',
      ),
    /** The Azure AD object ID of the actor who performed the change. */
    actorAzureUniqueId: z
      .string()
      .nullish()
      .describe('The Azure AD object ID of the actor who performed the change.'),
    /** The display name of the actor who performed the change. */
    actorName: z
      .string()
      .nullish()
      .describe('The display name of the actor who performed the change.'),
    /** The UPN of the actor who performed the change. */
    actorUpn: z.string().nullish().describe('The UPN of the actor who performed the change.'),
    /** The app key of the application affected by this change. for system-level changes. */
    appKey: z
      .string()
      .nullish()
      .describe(
        'The app key of the application affected by this change. for system-level changes.',
      ),
    /** The version identifier of the application build affected, if applicable. */
    appVersionIdentifier: z
      .string()
      .nullish()
      .describe('The version identifier of the application build affected, if applicable.'),
    /** The Azure AD application (client) ID of the service principal that performed the change, if applicable. */
    azureAppId: z
      .string()
      .nullish()
      .describe(
        'The Azure AD application (client) ID of the service principal that performed the change, if applicable.',
      ),
    /** The name of the application category affected, if applicable. */
    categoryName: z
      .string()
      .nullish()
      .describe('The name of the application category affected, if applicable.'),
    /** The name of the MediatR command that produced this change, e.g. UpdateAppCommand. */
    commandName: z
      .string()
      .optional()
      .describe(
        'The name of the MediatR command that produced this change, e.g. UpdateAppCommand.',
      ),
    /** The unique identifier for this changelog entry. */
    id: z.string().optional().describe('The unique identifier for this changelog entry.'),
    /** The serialized JSON payload of the command, containing the input data for the change. */
    payload: z
      .string()
      .nullish()
      .describe(
        'The serialized JSON payload of the command, containing the input data for the change.',
      ),
    /** The UTC date and time when the command was executed. */
    timestamp: z
      .string()
      .optional()
      .describe('The UTC date and time when the command was executed.'),
  })
  .describe(
    'A single audit log entry recording a state-changing command executed against a Fusion application.',
  );

/**
 * A single audit log entry recording a state-changing command executed against a Fusion
 * application.
 *
 * Apps API 1.0 model inferred from {@link ApiChangelogSchemaV1}, so `ApiChangelogV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiChangelogV1 = z.infer<typeof ApiChangelogSchemaV1>;
