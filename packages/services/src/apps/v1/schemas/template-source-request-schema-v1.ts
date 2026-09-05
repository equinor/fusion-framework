import { z } from 'zod';

/**
 * Zod schema for the `TemplateSourceRequest` model published by the Fusion Apps API 1.0.
 *
 * Used by template-app to set which template to use. Syntax templatename@latest.
 *
 * The contract lists helper properties beside `type: string`, but Fusion Apps serialises
 * the value as a plain string, so the schema validates the string the wire carries.
 */
export const TemplateSourceRequestSchemaV1 = z
  .string()
  .describe('Used by template-app to set which template to use. Syntax templatename@latest.');

/**
 * Used by template-app to set which template to use. Syntax templatename@latest.
 *
 * Apps API 1.0 model inferred from {@link TemplateSourceRequestSchemaV1}, so
 * `TemplateSourceRequestV1` and the runtime validator can never describe different shapes.
 */
export type TemplateSourceRequestV1 = z.infer<typeof TemplateSourceRequestSchemaV1>;
