import type { FieldFakerFn, FieldFakerMap } from './types';

/** What {@link applyFieldFakers} returns. */
export interface ApplyFieldFakersResult {
  /** The dereferenced schema, annotated with a `faker: "..."` keyword wherever `fakerMap` matched a field. */
  schema: unknown;
  /**
   * Function-valued {@link FieldFakerMap} entries, keyed by the synthetic
   * `faker: "__custom.<key>"` path {@link schema} was annotated with — merge
   * this into `generateMockFromSchema`'s faker facade so those keys resolve.
   */
  customFakers: Record<string, FieldFakerFn>;
}

/**
 * Recursively dereferences `node`, tracking the named component schema
 * (`modelName`) and field `path` each node was reached through so
 * {@link annotate} can match it against `fakerMap`.
 */
function walk(
  node: unknown,
  document: unknown,
  modelName: string | undefined,
  path: readonly string[],
  fakerMap: FieldFakerMap,
  customFakers: Record<string, FieldFakerFn>,
  seen: ReadonlySet<string>,
): unknown {
  // Arrays require recursive traversal to preserve every nested schema item.
  if (Array.isArray(node)) {
    // Preserve array shape while recursively applying refs and field overrides.
    return node.map((item) => walk(item, document, modelName, path, fakerMap, customFakers, seen));
  }
  // Primitive values need no schema traversal.
  if (!node || typeof node !== 'object') return node;

  const record = node as Record<string, unknown>;
  const ref = record.$ref;
  // References are expanded here so overrides can match fields inside shared models.
  if (typeof ref === 'string' && ref.startsWith('#/')) {
    // Stop recursive references from expanding indefinitely.
    if (seen.has(ref)) return {};
    // Leave unresolved references intact so callers can diagnose incomplete documents.
    const resolved = resolvePointer(document, ref);
    // A missing target cannot be safely replaced with a fabricated schema.
    if (resolved === undefined) return node;
    // entering a named model resets the tracked path, so keys read "<Model>.<field>"
    // rather than accumulating the outer model's name in front of it
    const nextModel = ref.split('/').pop();
    return walk(resolved, document, nextModel, [], fakerMap, customFakers, new Set(seen).add(ref));
  }

  const properties = record.properties;
  const result: Record<string, unknown> = {};
  // Visit each property so its model-relative path can select a faker override.
  for (const [key, value] of Object.entries(record)) {
    // Properties need special handling to attach the matching faker annotation.
    if (key === 'properties' && properties && typeof properties === 'object') {
      result[key] = walkProperties(
        properties as Record<string, unknown>,
        document,
        modelName,
        path,
        fakerMap,
        customFakers,
        seen,
      );
      // Avoid traversing properties a second time through the generic branch.
      continue;
    }
    result[key] = walk(value, document, modelName, path, fakerMap, customFakers, seen);
  }
  return result;
}

/** Walks and annotates every entry of a schema's `properties` map, keying each by its own field path. */
function walkProperties(
  properties: Record<string, unknown>,
  document: unknown,
  modelName: string | undefined,
  path: readonly string[],
  fakerMap: FieldFakerMap,
  customFakers: Record<string, FieldFakerFn>,
  seen: ReadonlySet<string>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(properties)
      // Keep each property's name in the path used to find its override.
      .map(([propName, propSchema]) => {
        const propPath = [...path, propName];
        const walked = walk(propSchema, document, modelName, propPath, fakerMap, customFakers, seen);
        return [propName, annotate(walked, modelName, propPath, fakerMap, customFakers)];
      }),
  );
}

/** Adds a `faker: "..."` keyword to `schema` if `"<modelName>.<path>"` matches an entry in `fakerMap`. */
function annotate(
  schema: unknown,
  modelName: string | undefined,
  path: readonly string[],
  fakerMap: FieldFakerMap,
  customFakers: Record<string, FieldFakerFn>,
): unknown {
  // Without a model name there is no stable key against which to match an override.
  if (!modelName) return schema;
  const value = fakerMap[`${modelName}.${path.join('.')}`];
  // An absent map entry means the schema should retain its original shape.
  if (value === undefined) return schema;

  const base = schema && typeof schema === 'object' ? (schema as Record<string, unknown>) : {};
  // Functions must be registered separately because schema keywords only hold strings.
  if (typeof value === 'function') {
    const fakerKey = `field$${Object.keys(customFakers).length}`;
    // json-schema-faker calls a resolved faker-path function with no arguments, so the
    // field's own model/path context is captured in this closure instead
    customFakers[fakerKey] = () => value({ modelName, path });
    return { ...base, faker: `__custom.${fakerKey}` };
  }
  return { ...base, faker: value };
}

/** Walks a JSON pointer (`#/a/b/c`) against `document`, returning `undefined` if any segment is missing. */
function resolvePointer(document: unknown, ref: string): unknown {
  const segments = ref.slice(2).split('/');
  // Decode each pointer segment before using it as an object key.
  const path = segments.map((segment) =>
    decodeURIComponent(segment.replace(/~1/g, '/').replace(/~0/g, '~')),
  );
  let current: unknown = document;
  // Follow each pointer segment until the target is found or the path becomes invalid.
  for (const segment of path) {
    // A non-object cannot contain another pointer segment.
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * Dereferences `schema` the same way {@link dereferenceSchema} does, while
 * additionally tracking which named component schema (`$ref` target) and
 * field path each node was reached through, and annotating any node whose
 * `"<ModelName>.<field>"` key matches an entry in `fakerMap`.
 *
 * @remarks
 * Entering a `$ref` resets the tracked field path to `[]` under the ref's own
 * name — so a field is addressed as `"User.address.city"` only while
 * `address` is an inline (non-`$ref`) object nested directly under `User`;
 * once `address` is itself a named component schema (e.g. `Address`), its
 * fields are addressed as `"Address.city"` instead. Function-valued entries
 * cannot be inlined as a schema keyword directly, so each is assigned a
 * synthetic `__custom.<n>` key and collected into {@link ApplyFieldFakersResult.customFakers}
 * for the caller to merge into the faker facade at generation time.
 *
 * @param schema - The schema (or sub-schema) to dereference and annotate.
 * @param document - The full document `$ref` pointers are resolved against.
 * @param fakerMap - The field overrides to annotate matching nodes with.
 * @returns The annotated schema and function-valued faker overrides.
 */
export function applyFieldFakers(
  schema: unknown,
  document: unknown,
  fakerMap: FieldFakerMap,
): ApplyFieldFakersResult {
  const customFakers: Record<string, FieldFakerFn> = {};
  const annotated = walk(schema, document, undefined, [], fakerMap, customFakers, new Set());
  return { schema: annotated, customFakers };
}
export default applyFieldFakers;
