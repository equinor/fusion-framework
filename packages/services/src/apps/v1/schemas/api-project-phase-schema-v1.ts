import { z } from 'zod';

/**
 * Zod schema for the `ApiProjectPhase` model published by the Fusion Apps API 1.0.
 *
 * Represents a project phase (e.g. FEED, Execute) that a Fusion application is applicable to.
 */
export const ApiProjectPhaseSchemaV1 = z
  .object({
    /** The UTC date and time when this phase was registered. */
    createdAt: z
      .string()
      .optional()
      .describe('The UTC date and time when this phase was registered.'),
    /** A description of this project phase. when the phase could not be resolved. */
    description: z
      .string()
      .nullish()
      .describe('A description of this project phase. when the phase could not be resolved.'),
    /** An error message when the phase details could not be resolved from the external system. */
    error: z
      .string()
      .nullish()
      .describe(
        'An error message when the phase details could not be resolved from the external system.',
      ),
    /** The external identifier for this phase as defined in the source system (e.g. ProCoSys). */
    externalId: z
      .string()
      .optional()
      .describe(
        'The external identifier for this phase as defined in the source system (e.g. ProCoSys).',
      ),
    /** The internal unique identifier for this project phase. */
    id: z.string().optional().describe('The internal unique identifier for this project phase.'),
    /** The display name for this phase. when the phase could not be resolved; see @error. */
    name: z
      .string()
      .nullish()
      .describe(
        'The display name for this phase. when the phase could not be resolved; see @error.',
      ),
  })
  .describe(
    'Represents a project phase (e.g. FEED, Execute) that a Fusion application is applicable to.',
  );

/**
 * Represents a project phase (e.g. FEED, Execute) that a Fusion application is applicable to.
 *
 * Apps API 1.0 model inferred from {@link ApiProjectPhaseSchemaV1}, so `ApiProjectPhaseV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiProjectPhaseV1 = z.infer<typeof ApiProjectPhaseSchemaV1>;
