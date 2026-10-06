import type { AnalyticsJsonValue } from '../../types.js';

/**
 * Serializes a JSON value the way Python's `json.dumps(value, ensure_ascii=False)` does, which is
 * how Fusion's analytics pipeline writes the `data_body` and `data_attributes` columns.
 *
 * @remarks
 * Python's default separators are `", "` and `": "`, unlike the compact output of
 * `JSON.stringify`. Matching them keeps stored text byte-for-byte equal to production, so tests
 * and recordings can compare columns as strings. Non-ASCII characters are written as they are.
 *
 * @param value - The JSON value to serialize.
 * @returns The serialized text.
 *
 * @example
 * ```typescript
 * toPythonJson({ route: '/demands', tags: ['a', 'b'] });
 * // → '{"route": "/demands", "tags": ["a", "b"]}'
 * ```
 */
export function toPythonJson(value: AnalyticsJsonValue): string {
  // Arrays use Python's `, ` item separator.
  if (Array.isArray(value)) {
    // Each item is serialized recursively with the same separators.
    return `[${value.map((item) => toPythonJson(item)).join(', ')}]`;
  }
  // Objects use Python's `, ` and `: ` separators, keeping insertion order.
  if (value !== null && typeof value === 'object') {
    // Each member is serialized recursively with the same separators.
    const members = Object.entries(value).map(
      ([key, item]) => `${JSON.stringify(key)}: ${toPythonJson(item)}`,
    );
    return `{${members.join(', ')}}`;
  }
  // 64-bit integers are written with every digit, as Python writes its ints.
  if (typeof value === 'bigint') return value.toString();
  return JSON.stringify(value);
}

export default toPythonJson;
