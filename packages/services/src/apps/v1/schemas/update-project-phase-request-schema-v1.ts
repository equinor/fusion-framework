import { z } from 'zod';

/**
 * Zod schema for the `UpdateProjectPhaseRequest` model published by the Fusion Apps API 1.0.
 *
 * Identifies a project phase to associate with an app.
 */
export const UpdateProjectPhaseRequestSchemaV1 = z
  .object({
    /** The external identifier of the project phase. */
    externalId: z.string().optional().describe('The external identifier of the project phase.'),
  })
  .describe('Identifies a project phase to associate with an app.');

/**
 * Identifies a project phase to associate with an app.
 *
 * Apps API 1.0 model inferred from {@link UpdateProjectPhaseRequestSchemaV1}, so
 * `UpdateProjectPhaseRequestV1` and the runtime validator can never describe different shapes.
 */
export type UpdateProjectPhaseRequestV1 = z.infer<typeof UpdateProjectPhaseRequestSchemaV1>;
