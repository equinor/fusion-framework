import { z } from 'zod';

/**
 * Zod schema for the `ApiAppContext` model published by the Fusion Apps API 1.0.
 *
 * Describes a context type that a Fusion application supports (e.g. ProjectMaster, Facility).
 */
export const ApiAppContextSchemaV1 = z
  .object({
    /** when the context type is a custom (service-defined) type rather than a standard Fusion context type. */
    isCustom: z
      .boolean()
      .optional()
      .describe(
        'when the context type is a custom (service-defined) type rather than a standard Fusion context type.',
      ),
    /** The context type identifier, e.g. ProjectMaster. */
    type: z.string().optional().describe('The context type identifier, e.g. ProjectMaster.'),
  })
  .describe(
    'Describes a context type that a Fusion application supports (e.g. ProjectMaster, Facility).',
  );

/**
 * Describes a context type that a Fusion application supports (e.g. ProjectMaster, Facility).
 *
 * Apps API 1.0 model inferred from {@link ApiAppContextSchemaV1}, so `ApiAppContextV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiAppContextV1 = z.infer<typeof ApiAppContextSchemaV1>;
