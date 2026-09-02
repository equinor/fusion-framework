import { z } from 'zod';

/**
 * Zod schema for the `AppContextRequest` model published by the Fusion Apps API 1.0.
 *
 * Represents a context type associated with an app.
 */
export const AppContextRequestSchemaV1 = z
  .object({
    /** Optional human-readable description of the context type. */
    description: z
      .string()
      .nullish()
      .describe('Optional human-readable description of the context type.'),
    /** Indicates whether this is a custom context type. */
    isCustom: z.boolean().nullish().describe('Indicates whether this is a custom context type.'),
    /** The context type identifier, e.g. ProjectMaster. */
    type: z.string().optional().describe('The context type identifier, e.g. ProjectMaster.'),
  })
  .describe('Represents a context type associated with an app.');

/**
 * Represents a context type associated with an app.
 *
 * Apps API 1.0 model inferred from {@link AppContextRequestSchemaV1}, so `AppContextRequestV1` and
 * the runtime validator can never describe different shapes.
 */
export type AppContextRequestV1 = z.infer<typeof AppContextRequestSchemaV1>;
