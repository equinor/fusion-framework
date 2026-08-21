/**
 * Walks a JSON pointer (`#/a/b/c`) against `document`, returning `undefined` if any segment is missing.
 *
 * @param document - The parsed document to walk the pointer against.
 * @param ref - A `#/...` JSON pointer, as found in an OpenAPI `$ref`.
 * @returns The value at the pointer, or `undefined` if any segment doesn't resolve.
 */
export function resolvePointer(document: unknown, ref: string): unknown {
  const segments = ref.slice(2).split('/');
  // Decode each pointer segment before using it as an object key.
  const path = segments.map((segment) =>
    decodeURIComponent(segment.replace(/~1/g, '/').replace(/~0/g, '~')),
  );
  // Follow the pointer one segment at a time to locate the referenced value.
  return path.reduce<unknown>((current, segment) => {
    // Stop when a pointer walks into a scalar or null value.
    if (current == null || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[segment];
  }, document);
}
export default resolvePointer;
