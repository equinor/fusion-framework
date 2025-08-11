import { toObservable } from '@equinor/fusion-observable';

import {
  TelemetryType,
  type MetadataExtractor,
  type MetadataExtractorArgs,
  type TelemetryItem,
} from '@equinor/fusion-framework-module-telemetry';

import { merge, of, type Observable } from 'rxjs';
import { catchError, defaultIfEmpty, first, map } from 'rxjs/operators';
import { mergeTelemetryItem } from './merge-telemetry-item.js';
import { TelemetryExceptionSchema } from '../schemas.js';

export const resolveMetadata = (
  metadata: MetadataExtractor,
  args: MetadataExtractorArgs,
): Observable<TelemetryItem['metadata']> => {
  return toObservable(metadata, args);
};

/**
 * Applies metadata to a telemetry item by resolving metadata asynchronously.
 *
 * This function takes a metadata extractor and its arguments, resolves the metadata,
 * and merges it into the provided telemetry item. If an error occurs during metadata resolution,
 * it emits both an error telemetry item and the original item.
 *
 * @remarks
 * - When resolving metadata, it will only take the first emitted value!.
 * - The metadata extractor can be a function or an object that implements the `DynamicInputValue` interface.
 * - The `args` parameter must include the telemetry item from which metadata is extracted.
 * - The function returns an Observable that emits the telemetry item with applied metadata or an error telemetry item if resolution fails.
 *
 * @param metadata - The metadata extractor function or object used to resolve metadata.
 * @param args - The arguments required by the metadata extractor, including the telemetry item.
 * @returns An Observable emitting the telemetry item with applied metadata, or an error telemetry item if resolution fails.
 */
export const applyMetadata = (
  metadata: MetadataExtractor,
  args: MetadataExtractorArgs,
): Observable<TelemetryItem> => {
  return resolveMetadata(metadata, args).pipe(
    defaultIfEmpty({}), // Ensure we always have an object to merge with
    first(), // Take the first emitted value from the metadata extractor
    // Merge the resolved metadata with the telemetry item.
    // resolved metadata is always target, else item metadata would be overwritten
    map((data) => mergeTelemetryItem({ metadata: data }, args.item)),
    catchError((error) => {
      const errorItem = TelemetryExceptionSchema.parse({
        type: TelemetryType.Exception,
        name: 'TelemetryMetadataError',
        exception: error,
        properties: {
          sourceMetricName: args.item.name,
          sourceMetricType: args.item.type,
        },
      });
      return merge(of(errorItem), of(args.item)) as Observable<TelemetryItem>;
    }),
  );
};
