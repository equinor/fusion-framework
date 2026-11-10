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
    return base.concat(override);
  }
  // Anything other than two plain objects is replaced by the override
  if (!isPlainMetadata(base) || !isPlainMetadata(override)) {
    return override;
  }
  // Start from the base keys so keys absent from the override survive
  const result: Record<string, unknown> = { ...base };
  // Skip `__proto__`: assigning it would replace the result's prototype (GHSA-gcqx-w48m-w2h4)
  const entries = Object.entries(override).filter(([key]) => key !== '__proto__');
  // Overlay each override key, recursing where both sides define it
  for (const [key, value] of entries) {
    result[key] = Object.hasOwn(base, key) ? mergeMetadataValue(base[key], value) : value;
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
