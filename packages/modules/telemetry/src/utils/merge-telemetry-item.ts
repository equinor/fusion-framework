import type { TelemetryItem } from '@equinor/fusion-framework-module-telemetry';

/**
 * Checks whether a metadata value is an object literal that should merge key by key.
 * Arrays and class instances such as `Error` are excluded so they are kept intact.
 *
 * @param value - Metadata value to inspect.
 * @returns `true` when the value is a plain object.
 */
const isPlainMetadata = (value: unknown): value is Record<string, unknown> => {
  // Primitives and null are kept as-is
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

/**
 * Lists a metadata object's entries without `__proto__`, which would replace the prototype of an
 * object it is assigned to (GHSA-gcqx-w48m-w2h4).
 *
 * @param value - Metadata object whose entries are listed.
 * @returns The entries that are safe to assign.
 */
const safeEntries = (value: Record<string, unknown>): Array<[string, unknown]> =>
  // `JSON.parse` keeps `__proto__` as an own key, so untrusted metadata can carry one
  Object.entries(value).filter(([key]) => key !== '__proto__');

/**
 * Copies plain objects and arrays from incoming metadata, dropping `__proto__` keys at any depth
 * so a value with no existing counterpart is cleaned the same way as a merged one.
 *
 * @param value - Incoming metadata value.
 * @returns A cleaned copy of plain objects and arrays; any other value as-is.
 */
const sanitizeMetadata = (value: unknown): unknown => {
  // Arrays may contain plain objects that carry `__proto__` keys
  if (Array.isArray(value)) {
    // Clean every item, since items never merge with an existing value
    return value.map(sanitizeMetadata);
  }
  // Class instances such as `Error` and primitives are kept as-is
  if (!isPlainMetadata(value)) {
    return value;
  }
  // Clean each nested value too, since none of them has an existing value to merge with
  const entries = safeEntries(value).map(([key, entryValue]) => [
    key,
    sanitizeMetadata(entryValue),
  ]);
  return Object.fromEntries(entries);
};

/**
 * Merges one metadata value into another: plain objects merge recursively, arrays are appended,
 * and any other value from `override` wins.
 *
 * @param base - Existing metadata value.
 * @param override - Metadata value that takes precedence.
 * @returns The merged value, as a new object or array when anything was merged.
 */
const mergeMetadataValue = (base: unknown, override: unknown): unknown => {
  // Lists of values accumulate rather than replace each other
  if (Array.isArray(base) && Array.isArray(override)) {
    // Clean incoming items before appending them to the existing list
    return base.concat(override.map(sanitizeMetadata));
  }
  // Anything other than two plain objects is replaced by the override
  if (!isPlainMetadata(base) || !isPlainMetadata(override)) {
    return sanitizeMetadata(override);
  }
  // Start from the base keys so keys absent from the override survive
  const result: Record<string, unknown> = Object.fromEntries(safeEntries(base));
  // Overlay each override key, recursing where both sides define it
  for (const [key, value] of safeEntries(override)) {
    result[key] = Object.hasOwn(base, key)
      ? mergeMetadataValue(base[key], value)
      : sanitizeMetadata(value);
  }
  return result;
};

/**
 * Merges two `MetaData` objects into a single object.
 *
 * If both `source` and `target` are undefined, returns `undefined`.
 * Otherwise, performs a deep merge of the two objects, with properties from `target` overriding those in `source`.
 * Neither input is mutated.
 *
 * @param source - The base `MetaData` object to merge from.
 * @param target - The `MetaData` object whose properties will override those in `source`.
 * @returns The merged `MetaData` object, or `undefined` if both inputs are undefined.
 */
export const mergeMetadata = (
  source?: TelemetryItem['metadata'],
  target?: TelemetryItem['metadata'],
): TelemetryItem['metadata'] => {
  // Nothing to merge when neither side has metadata
  if (!source && !target) {
    return undefined;
  }
  return mergeMetadataValue(source ?? {}, target ?? {}) as TelemetryItem['metadata'];
};

/**
 * Merges two partial `TelemetryItem` objects into a single `TelemetryItem`.
 *
 * @remarks
 * - Throws an error if either `target` or `source` is not defined.
 * - Throws an error if both `target.type` and `source.type` are defined and do not match.
 * - Combines the `scope` arrays from both objects, removing duplicates.
 * - Merges the `metadata` properties using the `mergeMetadata` function.
 * - Properties from `source` override those in `target` where applicable.
 *
 * @param target - The base partial `TelemetryItem` to merge into.
 * @param source - The partial `TelemetryItem` whose properties will override those in `target`.
 * @returns The merged `TelemetryItem`.
 * @throws {Error} If either argument is undefined or if telemetry item types mismatch.
 *
 * @internal
 */
// Deliberately co-located with `mergeMetadata` above
// fusion-lint-disable-next-line single-export-per-file
export const mergeTelemetryItem = (
  target: Partial<TelemetryItem>,
  source: Partial<TelemetryItem>,
): TelemetryItem => {
  // Both arguments are required to produce a valid merged telemetry item
  if (!target || !source) {
    throw new Error('Both target and source must be defined for merging telemetry items.');
  }
  // A type mismatch would produce an inconsistent telemetry item, so fail fast
  if (target.type && source.type && target.type !== source.type) {
    throw new Error('Mismatched telemetry item types.');
  }
  // Combine both scopes and de-duplicate via a Set before flattening back to an array
  const scope = [...new Set([...(target.scope ?? []), ...(source.scope ?? [])])];
  const metadata = mergeMetadata(target.metadata, source.metadata);
  // Source properties take precedence over target, with scope/metadata merged separately above
  return { ...target, ...source, scope, metadata } as TelemetryItem;
};
