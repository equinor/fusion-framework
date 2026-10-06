import { isJsonObject } from '../../utils/index.js';
import type { AnalyticsJsonValue } from '../../types.js';

/**
 * Unwraps an OpenTelemetry `AnyValue` (`{ stringValue }`, `{ kvlistValue }`, …) into a plain JSON
 * value, the way Fusion's analytics pipeline does before storing event bodies and attributes.
 *
 * @remarks
 * Mirrors `_flatten_otel_value` in the `nb_fcore_featurelogs` notebook: the first present variant
 * wins in the order string, int, double, bool, key-value list, array. Key-value lists become
 * objects and arrays become arrays, recursively. Empty values, `bytesValue`, and anything that is
 * not an `AnyValue` become `null`. Integers sent as strings (the protobuf JSON form of 64-bit
 * integers) are converted to numbers.
 *
 * @param value - An OpenTelemetry `AnyValue` from a parsed logs payload.
 * @returns The unwrapped JSON value.
 *
 * @example
 * ```typescript
 * flattenOtlpValue({
 *   kvlistValue: { values: [{ key: 'route', value: { stringValue: '/demands' } }] },
 * });
 * // → { route: '/demands' }
 * ```
 */
export function flattenOtlpValue(value: unknown): AnalyticsJsonValue {
  // The pipeline treats anything other than a non-empty object as "no value".
  if (!isJsonObject(value)) return null;

  const { stringValue, intValue, doubleValue, boolValue, kvlistValue, arrayValue } = value;
  // Variants are checked in the pipeline's order so a payload with several variants resolves the same way.
  if (stringValue !== undefined && stringValue !== null) return String(stringValue);
  // Integers may arrive as numbers or, for 64-bit values, as text.
  if (intValue !== undefined && intValue !== null) {
    // Python's int() accepts whole numbers as they are.
    if (typeof intValue === 'number' && Number.isFinite(intValue)) return Math.trunc(intValue);
    // Python's int() also accepts integer text; any other text is kept unconverted.
    if (typeof intValue === 'string' && /^\s*[+-]?\d+\s*$/.test(intValue)) {
      const parsed = Number(intValue);
      // Values beyond 2^53 stay exact as bigint, like Python's arbitrary-precision int.
      return Number.isSafeInteger(parsed) ? parsed : BigInt(intValue.trim());
    }
    return String(intValue);
  }
  // Doubles are converted like Python's float(); unconvertible values are kept as text.
  if (doubleValue !== undefined && doubleValue !== null) {
    // Python's float() rejects empty text, which Number() would read as 0.
    const parsed =
      typeof doubleValue === 'string' && !doubleValue.trim() ? Number.NaN : Number(doubleValue);
    return Number.isFinite(parsed) ? parsed : String(doubleValue);
  }
  // Booleans are coerced like Python's bool(), so any present value counts.
  if (boolValue !== undefined && boolValue !== null) return Boolean(boolValue);
  // Key-value lists become plain objects so stored payloads are readable JSON.
  if (isJsonObject(kvlistValue)) {
    const result: Record<string, AnalyticsJsonValue> = {};
    const entries = Array.isArray(kvlistValue.values) ? kvlistValue.values : [];
    // Entries without a key are skipped, as in the pipeline; a repeated key keeps the last value.
    for (const entry of entries) {
      // Only well-formed entries carry a key to store the value under.
      if (isJsonObject(entry) && 'key' in entry) {
        result[String(entry.key)] = flattenOtlpValue(entry.value);
      }
    }
    return result;
  }
  // Arrays become plain arrays so stored payloads are readable JSON.
  if (isJsonObject(arrayValue)) {
    const values = Array.isArray(arrayValue.values) ? arrayValue.values : [];
    // Each item is unwrapped on its own, since arrays may mix value types.
    return values.map((item) => flattenOtlpValue(item));
  }
  return null;
}

export default flattenOtlpValue;
