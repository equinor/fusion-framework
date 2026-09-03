import { z } from 'zod';

/**
 * Zod schema for the `CreateContextTypeRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to create a new context type that apps can associate with.
 */
export const CreateContextTypeRequestSchemaV1 = z
  .object({
    /** A description explaining the purpose of this context type. Required when `isCustom` is true. */
    description: z
      .string()
      .nullish()
      .describe(
        'A description explaining the purpose of this context type. Required when `isCustom` is true.',
      ),
    /** Indicates whether this is a custom context type. Custom context types require a description. */
    isCustom: z
      .boolean()
      .optional()
      .describe(
        'Indicates whether this is a custom context type. Custom context types require a description.',
      ),
    /** The unique system name for the context type. Must be 2–50 URL-safe characters. */
    name: z
      .string()
      .optional()
      .describe('The unique system name for the context type. Must be 2–50 URL-safe characters.'),
  })
  .describe('Request to create a new context type that apps can associate with.');

/**
 * Request to create a new context type that apps can associate with.
 *
 * Apps API 1.0 model inferred from {@link CreateContextTypeRequestSchemaV1}, so
 * `CreateContextTypeRequestV1` and the runtime validator can never describe different shapes.
 */
export type CreateContextTypeRequestV1 = z.infer<typeof CreateContextTypeRequestSchemaV1>;
