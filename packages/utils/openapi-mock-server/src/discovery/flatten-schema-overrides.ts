import type { FieldFakerMap, FieldFakerValue } from '@equinor/fusion-openapi-mock';

/**
 * Flattens a `components`-shaped override map into a flat `FieldFakerMap` (`"Model.field"` keys).
 *
 * @param components - A `<key>.overrides.*` sidecar's `components` map, keyed by model then field name.
 * @returns The flattened `FieldFakerMap`, or `undefined` when `components` was omitted.
 */
export function flattenSchemaOverrides(
  components: Record<string, Record<string, FieldFakerValue>> | undefined,
): FieldFakerMap | undefined {
  // No components override at all: nothing to flatten.
  if (!components) return undefined;
  const fields: FieldFakerMap = {};
  // Walk each model's overrides, one at a time, flattening its fields as we go.
  for (const [modelName, modelFields] of Object.entries(components)) {
    // Flatten this model's fields into the shared "Model.field" key format `createOpenApiMock` expects.
    for (const [fieldName, value] of Object.entries(modelFields)) {
      // Prefix each field name with its model, so two models' same-named fields don't collide.
      fields[`${modelName}.${fieldName}`] = value;
    }
  }
  return fields;
}

export default flattenSchemaOverrides;
