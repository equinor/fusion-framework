import deepmerge from 'deepmerge/index.js';

import type { TelemetryItem } from '@equinor/fusion-framework-module-telemetry';

/**
 * Merges two `MetaData` objects into a single object.
 *
 * If both `source` and `target` are undefined, returns `undefined`.
 * Otherwise, performs a deep merge of the two objects, with properties from `target` overriding those in `source`.
 *
 * @param source - The base `MetaData` object to merge from.
 * @param target - The `MetaData` object whose properties will override those in `source`.
 * @returns The merged `MetaData` object, or `undefined` if both inputs are undefined.
 */
export const mergeMetadata = (
  source?: TelemetryItem['metadata'],
  target?: TelemetryItem['metadata'],
): TelemetryItem['metadata'] => {
  if (!source && !target) {
    return undefined;
  }
  return deepmerge(source ?? {}, target ?? {});
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
export const mergeTelemetryItem = (
  target: Partial<TelemetryItem>,
  source: Partial<TelemetryItem>,
): TelemetryItem => {
  if (!target || !source) {
    throw new Error('Both target and source must be defined for merging telemetry items.');
  }
  if (target.type && source.type && target.type !== source.type) {
    throw new Error('Mismatched telemetry item types.');
  }
  const scope = [...new Set([...(target.scope ?? []), ...(source.scope ?? [])])];
  const metadata = mergeMetadata(target.metadata, source.metadata);
  return { ...target, ...source, scope, metadata } as TelemetryItem;
};
