import { z } from 'zod';

/** Zod schema fragment validating the `template` query option naming a template app key. */
export const TemplateSchemaV1 = z
  .string()
  .optional()
  .describe('the `template` query option naming a template app key.');

/**
 * The `template` query option Apps API 1.0 accepts when access is checked against a template app.
 *
 * Apps API 1.0 model inferred from {@link TemplateSchemaV1}, so `TemplateV1` and the runtime validator can
 * never describe different shapes.
 */
export type TemplateV1 = z.infer<typeof TemplateSchemaV1>;
