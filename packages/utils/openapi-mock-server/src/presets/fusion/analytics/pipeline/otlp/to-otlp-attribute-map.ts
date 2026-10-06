import { isJsonObject } from '../../utils/index.js';

/**
 * Reads OpenTelemetry resource attributes into a one-level `key → text` map, the way Fusion's
 * analytics pipeline reads `session.id`, `user.id`, `portal.id`, and `module.version`.
 *
 * @remarks
 * Mirrors `kv_to_map` in the `nb_fcore_featurelogs` notebook. Each value becomes the text of its
 * first present scalar variant (string, int, double, bool). Nested `kvlistValue` and `arrayValue`
 * are kept as their raw OpenTelemetry JSON instead of being unwrapped. Entries without a key are
 * skipped, and a repeated key keeps its last value, so a `user.id` the Monitor service appends
 * wins over one sent by the client.
 *
 * @param attributes - The resource `attributes` list, or `null`/`undefined` when missing.
 * @returns The attribute map; empty when there are no attributes.
 *
 * @example
 * ```typescript
 * toOtlpAttributeMap([{ key: 'portal.id', value: { stringValue: 'fusion' } }]);
 * // → { 'portal.id': 'fusion' }
 * ```
 */
export function toOtlpAttributeMap(attributes: unknown): Record<string, string | null> {
  const map: Record<string, string | null> = {};
  // Missing attributes are read as an empty map, like the pipeline's `coalesce(col, array())`.
  if (!Array.isArray(attributes)) return map;

  // Each entry is reduced to text so callers can look values up by key without unwrapping.
  for (const entry of attributes) {
    // Entries without a key cannot be looked up, so they are left out.
    if (!isJsonObject(entry) || typeof entry.key !== 'string') continue;
    map[entry.key] = toAttributeText(entry.value);
  }
  return map;
}

/**
 * Reduces one OpenTelemetry `AnyValue` to the text `get_json_object` would return for its first
 * present variant.
 *
 * @param value - An OpenTelemetry `AnyValue`.
 * @returns The variant's text, compact JSON for nested variants, or `null` when no variant is set.
 */
function toAttributeText(value: unknown): string | null {
  // A value that is not an AnyValue has no text.
  if (!isJsonObject(value)) return null;
  // Same variant order as the pipeline's `coalesce`, so mixed payloads resolve identically.
  for (const variant of ['stringValue', 'intValue', 'doubleValue', 'boolValue'] as const) {
    const scalar = value[variant];
    // The first present scalar wins.
    if (scalar !== undefined && scalar !== null) return String(scalar);
  }
  // Nested values are kept as raw OpenTelemetry JSON, since this map is only one level deep.
  for (const variant of ['kvlistValue', 'arrayValue'] as const) {
    const nested = value[variant];
    // The first present nested variant wins.
    if (nested !== undefined && nested !== null) return JSON.stringify(nested);
  }
  return null;
}

export default toOtlpAttributeMap;
