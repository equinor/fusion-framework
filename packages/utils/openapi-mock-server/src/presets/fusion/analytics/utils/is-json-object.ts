/**
 * Checks whether a parsed JSON value is an object with keys, as opposed to `null`, an array, or a
 * primitive. Used to read untrusted OpenTelemetry payloads without throwing on unexpected shapes.
 *
 * @param value - Any parsed JSON value.
 * @returns `true` when `value` is a non-null, non-array object.
 */
export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export default isJsonObject;
