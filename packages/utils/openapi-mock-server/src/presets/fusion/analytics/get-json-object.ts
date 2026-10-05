import { isJsonObject } from './is-json-object.js';

/**
 * Extracts one field from a JSON string the way Spark's `get_json_object` does, which is how
 * Fusion's analytics pipeline promotes event fields such as `data_feature` and `data_body_data`.
 *
 * @remarks
 * Follows the pipeline-visible behavior of `get_json_object(json, '$.a.b')`:
 * - a string field is returned as its plain text, without quotes;
 * - a number or boolean field is returned as its text;
 * - an object or array field is returned as compact JSON;
 * - a missing field, a JSON `null`, a `null` input, or invalid JSON returns `null`.
 *
 * @param json - The JSON text to read, for example a record's `data_body`.
 * @param path - Object keys to follow from the root, for example `['context', 'id']` for `$.context.id`.
 * @returns The field's text, or `null`.
 *
 * @example
 * ```typescript
 * getJsonObject('{"feature": "page-viewed", "data": {"route": "/"}}', ['data']);
 * // → '{"route":"/"}'
 * ```
 */
export function getJsonObject(json: string | null, path: readonly string[]): string | null {
  // A null column stays null, as in Spark.
  if (json === null) return null;

  let current: unknown;
  try {
    current = JSON.parse(json);
  } catch {
    // Spark returns null for text it cannot parse instead of failing the whole row.
    return null;
  }

  // Walk object keys only; arrays and scalars on the way mean the field does not exist.
  for (const key of path) {
    // A missing key or a non-object on the way yields null instead of an error.
    if (!isJsonObject(current) || !(key in current)) return null;
    current = current[key];
  }

  // JSON null reads as a missing value.
  if (current === null || current === undefined) return null;
  // Strings are returned unquoted, so promoted columns hold plain text.
  if (typeof current === 'string') return current;
  // Objects and arrays are returned as compact JSON, as Spark re-serializes them.
  if (typeof current === 'object') return JSON.stringify(current);
  return String(current);
}

export default getJsonObject;
