import { z } from 'zod';

/**
 * Zod schema for the `ApiContextType` model published by the Fusion Apps API 1.0.
 *
 * Describes a Fusion context type (e.g. ProjectMaster, Facility), defining which types of
 * project/operational contexts an application can be scoped to.
 */
export const ApiContextTypeSchemaV1 = z
  .object({
    /** A human-readable description of this context type. when no description has been provided. */
    description: z
      .string()
      .nullish()
      .describe(
        'A human-readable description of this context type. when no description has been provided.',
      ),
    /** The internal unique identifier for this context type. */
    id: z.string().optional().describe('The internal unique identifier for this context type.'),
    /** when this is a custom (service-defined) context type rather than a standard Fusion context type. */
    isCustom: z
      .boolean()
      .optional()
      .describe(
        'when this is a custom (service-defined) context type rather than a standard Fusion context type.',
      ),
    /** The machine-readable name for this context type, e.g. ProjectMaster. */
    name: z
      .string()
      .optional()
      .describe('The machine-readable name for this context type, e.g. ProjectMaster.'),
  })
  .describe(
    'Describes a Fusion context type (e.g. ProjectMaster, Facility), defining which types of project/operational contexts an application can be scoped to.',
  );

/**
 * Describes a Fusion context type (e.g. ProjectMaster, Facility), defining which types of
 * project/operational contexts an application can be scoped to.
 *
 * Apps API 1.0 model inferred from {@link ApiContextTypeSchemaV1}, so `ApiContextTypeV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiContextTypeV1 = z.infer<typeof ApiContextTypeSchemaV1>;
