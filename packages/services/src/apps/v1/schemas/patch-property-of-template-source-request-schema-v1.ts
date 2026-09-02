import type { z } from 'zod';
import { TemplateSourceRequestSchemaV1 } from './template-source-request-schema-v1';

/**
 * Zod schema for the `PatchPropertyOfTemplateSourceRequest` model published by the Fusion Apps API
 * 1.0.
 *
 * The template source to use. Only applicable for apps of type template-app. Syntax:
 * templatename@version.
 */
export const PatchPropertyOfTemplateSourceRequestSchemaV1 =
  TemplateSourceRequestSchemaV1.nullable().describe(
    'The template source to use. Only applicable for apps of type template-app. Syntax: templatename@version.',
  );

/**
 * The template source to use. Only applicable for apps of type template-app. Syntax:
 * templatename@version.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfTemplateSourceRequestSchemaV1}, so
 * `PatchPropertyOfTemplateSourceRequestV1` and the runtime validator can never describe different
 * shapes.
 */
export type PatchPropertyOfTemplateSourceRequestV1 = z.infer<
  typeof PatchPropertyOfTemplateSourceRequestSchemaV1
>;
