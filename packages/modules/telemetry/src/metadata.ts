import deepmerge from 'deepmerge';

import { lastValueFrom } from 'rxjs';

import { toObservable } from '@equinor/fusion-observable';

import type { MetaData, TelemetryConfig } from './TelemetryConfigurator.interface.js';

/**
 * Asynchronously resolves the provided telemetry metadata.
 *
 * Converts the given metadata, which may be in various forms, into an observable and returns a promise
 * that resolves with the final `MetaData` value or `undefined` if no value is emitted.
 *
 * @param metadata - The telemetry metadata configuration to resolve.
 * @returns A promise that resolves to the resolved `MetaData` or `undefined`.
 */
export const resolveMetadataAsync = (
  metadata: TelemetryConfig['metadata'],
): Promise<MetaData | undefined> => {
  return lastValueFrom(toObservable(metadata));
};

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
export const mergeMetadata = (source?: MetaData, target?: MetaData): MetaData | undefined => {
  if (!source && !target) {
    return undefined;
  }
  return deepmerge(source ?? {}, target ?? {});
};
