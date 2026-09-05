import { z } from 'zod';
import { ApiWidgetAdminSchemaV1 } from './api-widget-admin-schema-v1';
import { ApiWidgetVersionSchemaV1 } from './api-widget-version-schema-v1';

/**
 * Zod schema for the `ApiWidget` model published by the Fusion Apps API 1.0.
 *
 * Detailed representation of a Fusion widget, including the latest build version and
 * administrators.
 */
export const ApiWidgetSchemaV1 = z
  .object({
    /** Accounts registered as administrators of this widget. if not expanded. */
    admins: z
      .array(ApiWidgetAdminSchemaV1)
      .nullish()
      .describe('Accounts registered as administrators of this widget. if not expanded.'),
    /** Build the widget currently serves, when one is registered. */
    build: ApiWidgetVersionSchemaV1.nullish().describe(
      'Build the widget currently serves, when one is registered.',
    ),
    /** Short description of the widget's purpose. */
    description: z.string().nullish().describe("Short description of the widget's purpose."),
    /** The internal unique identifier for this widget. */
    id: z.string().optional().describe('The internal unique identifier for this widget.'),
    /** The unique short identifier for the widget, e.g. my-widget. */
    widgetKey: z
      .string()
      .nullish()
      .describe('The unique short identifier for the widget, e.g. my-widget.'),
  })
  .describe(
    'Detailed representation of a Fusion widget, including the latest build version and administrators.',
  );

/**
 * Detailed representation of a Fusion widget, including the latest build version and
 * administrators.
 *
 * Apps API 1.0 model inferred from {@link ApiWidgetSchemaV1}, so `ApiWidgetV1` and the runtime
 * validator can never describe different shapes.
 */
export type ApiWidgetV1 = z.infer<typeof ApiWidgetSchemaV1>;
