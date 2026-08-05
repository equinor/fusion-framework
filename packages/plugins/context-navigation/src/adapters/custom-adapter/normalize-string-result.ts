/**
 * Normalize legacy app generator outputs to a plain string.
 *
 * Legacy apps may return their path values as either a bare string or
 * wrapped in an array (e.g. `['path']` or `[]`). This function unifies
 * both shapes into `string | undefined` so downstream code doesn't need
 * to branch on format.
 *
 * @param value - Raw return value from an app generator hook
 * @returns The resolved string, or `undefined` if the value is empty/invalid
 *
 * @example
 * ```ts
 * normalizeStringResult('/foo/bar');    // '/foo/bar'
 * normalizeStringResult(['/foo/bar']); // '/foo/bar'
 * normalizeStringResult([]);           // undefined
 * normalizeStringResult('');           // undefined
 * ```
 */
export function normalizeStringResult(value: unknown): string | undefined {
  // A non-empty string can be returned directly — the most common case for modern apps
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  // Legacy apps may wrap their return value in an array; unwrap the first element if present
  if (Array.isArray(value)) {
    const first = value[0];
    // Non-empty string at index 0 is the only valid array payload
    if (typeof first === 'string' && first.length > 0) {
      return first;
    }
    // Array was empty or held a non-string — treat as no result
    return undefined;
  }

  return undefined;
}
