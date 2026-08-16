/** Walks a JSON pointer (`#/a/b/c`) against `document`, returning `undefined` if any segment is missing. */
function resolvePointer(document: unknown, ref: string): unknown {
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

/**
 * Resolves every `$ref` JSON pointer in `schema` against `document`,
 * replacing `{ $ref: '#/a/b' }` with the value it points to.
 *
 * @remarks
 * OpenAPI schemas commonly reference shared definitions under
 * `#/components/schemas/...`; `json-schema-faker` needs those inlined before
 * it can fake a value, so this walks the schema tree once up front rather
 * than relying on `json-schema-faker`'s own ref resolution, which targets
 * separate external documents rather than pointers within the same one.
 *
 * A schema that (indirectly) references itself would recurse forever, so the
 * second time one pointer is seen along a branch this returns an empty
 * (permissive) schema instead of resolving it again.
 *
 * @param schema - The schema (or sub-schema) to dereference.
 * @param document - The full document `$ref` pointers are resolved against.
 * @param seen - References already being expanded on the current branch.
 * @returns The schema with resolvable references recursively inlined.
 */
export function dereferenceSchema(
  schema: unknown,
  document: unknown,
  seen: ReadonlySet<string> = new Set(),
): unknown {
  // Arrays require recursive traversal to inline references in every item.
  if (Array.isArray(schema)) {
    const items = schema;
    // Recurse through array items because schemas can contain nested collections.
    return items.map((item) => dereferenceSchema(item, document, seen));
  }
  // Only objects can contain references or nested schema keywords.
  if (schema && typeof schema === 'object') {
    const ref = (schema as Record<string, unknown>).$ref;
    // References are expanded before ordinary keywords so their targets are traversed too.
    if (typeof ref === 'string' && ref.startsWith('#/')) {
      // Break cycles in recursive schemas instead of recursing forever.
      if (seen.has(ref)) return {};
      // Keep unresolved references visible rather than replacing them incorrectly.
      const resolved = resolvePointer(document, ref);
      // There is no safe value to inline when the pointer target is absent.
      if (resolved === undefined) return schema;
      return dereferenceSchema(resolved, document, new Set(seen).add(ref));
    }
    const entries = Object.entries(schema as Record<string, unknown>);
    // Recurse through every keyword because nested schemas may occur anywhere.
    return Object.fromEntries(
      entries.map(([key, value]) => [key, dereferenceSchema(value, document, seen)]),
    );
  }
  return schema;
}
export default dereferenceSchema;
