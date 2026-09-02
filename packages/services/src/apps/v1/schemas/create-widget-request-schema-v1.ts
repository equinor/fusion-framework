import { z } from 'zod';
import { AccountIdentifierSchemaV1 } from './account-identifier-schema-v1';

/**
 * Zod schema for the `CreateWidgetRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to create a new widget.
 */
export const CreateWidgetRequestSchemaV1 = z
  .object({
    /** One or more accounts that will be administrators of the widget. */
    admins: z
      .array(AccountIdentifierSchemaV1)
      .optional()
      .describe('One or more accounts that will be administrators of the widget.'),
    /** An optional description of the widget's purpose. */
    description: z.string().nullish().describe("An optional description of the widget's purpose."),
    /** The unique name for the widget. Must be 3–100 URL-safe characters. */
    name: z
      .string()
      .optional()
      .describe('The unique name for the widget. Must be 3–100 URL-safe characters.'),
  })
  .describe('Request to create a new widget.');

/**
 * Request to create a new widget.
 *
 * Apps API 1.0 model inferred from {@link CreateWidgetRequestSchemaV1}, so `CreateWidgetRequestV1`
 * and the runtime validator can never describe different shapes.
 */
export type CreateWidgetRequestV1 = z.infer<typeof CreateWidgetRequestSchemaV1>;
