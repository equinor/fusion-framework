import { flattenOtlpValue } from './flatten-otlp-value.js';
import type { AnalyticsJsonValue } from './types.js';

/**
 * Unwraps an OpenTelemetry key-value list — log record attributes, or the `values` of a body's
 * `kvlistValue` — into a plain JSON object, the way Fusion's analytics pipeline does.
 *
 * @remarks
 * Mirrors `_flatten_kvlist` in the `nb_fcore_featurelogs` notebook. Every value is unwrapped
 * recursively with {@link flattenOtlpValue}. Entries without a key are skipped, and a repeated key
 * keeps its last value.
 *
 * @param values - The key-value list, or `null`/`undefined` when the payload has none.
 * @returns The unwrapped object, or `null` when `values` is missing — the pipeline stores `null`
 *   rather than `{}` in that case.
 *
 * @example
 * ```typescript
 * flattenOtlpKeyValues([
 *   { key: 'appKey', value: { stringValue: 'my-app' } },
 *   { key: 'context', value: { kvlistValue: { values: [{ key: 'id', value: { stringValue: 'abc' } }] } } },
 * ]);
 * // → { appKey: 'my-app', context: { id: 'abc' } }
 * ```
 */
export function flattenOtlpKeyValues(values: unknown): Record<string, AnalyticsJsonValue> | null {
  // A missing list is stored as null, not as an empty object, matching the pipeline.
  if (values === undefined || values === null) return null;
  const flattened = flattenOtlpValue({ kvlistValue: { values } });
  return flattened !== null && typeof flattened === 'object' && !Array.isArray(flattened)
    ? flattened
    : {};
}

export default flattenOtlpKeyValues;
