import type z from 'zod';

import type { Modules, ModulesInstanceType } from '@equinor/fusion-framework-module';
import type { DynamicInputValue } from '@equinor/fusion-observable';

import type {
  TelemetryItemSchema,
  TelemetryEventSchema,
  TelemetryExceptionSchema,
  TelemetryMetricSchema,
  TelemetryCustomEventSchema,
} from './schemas.js';

export type MetadataExtractorArgs = {
  /**
   * The modules instance, which may be undefined.
   * This is typically used to access module-specific data or functionality.
   */
  modules?: ModulesInstanceType<Modules>;

  /**
   * The telemetry item from which metadata is extracted.
   * This is the source of the metadata to be processed.
   */
  item: TelemetryItem;
};
/**
 * Represents a function that extracts metadata from a telemetry item.
 *
 * @template TelemetryItem.metadata - The type of metadata to extract.
 * @template [ModulesInstanceType<Modules> | undefined] - The arguments required for extraction, typically an instance of modules or undefined.
 *
 * @remarks
 * This type is used to define extractors that can dynamically retrieve metadata from telemetry items,
 * potentially using module instances as context.
 */
export type MetadataExtractor = DynamicInputValue<
  TelemetryItem['metadata'],
  [MetadataExtractorArgs]
>;

/**
 * Represents a telemetry item as defined by the {@link TelemetryItemSchema}.
 *
 * This type is inferred from the Zod schema and includes all properties and validation rules
 * specified in the schema. Use this type to ensure type safety when working with telemetry data.
 */
export type TelemetryItem = z.infer<typeof TelemetryItemSchema>;

/**
 * Represents a telemetry event as defined by the `TelemetryEventSchema`.
 *
 * This type is inferred from the Zod schema and includes all properties
 * and validation rules specified in `TelemetryEventSchema`.
 *
 * @see TelemetryEventSchema
 */
export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;

/**
 * Represents an exception or error event captured by the telemetry system.
 *
 * This type is inferred from the `TelemetryExceptionSchema` and includes all properties
 * defined by that schema. It is used to standardize the structure of exception data
 * reported for monitoring and diagnostics purposes.
 *
 * @see TelemetryExceptionSchema
 */
export type TelemetryException = z.infer<typeof TelemetryExceptionSchema>;

/**
 * Represents a telemetry metric as defined by the {@link TelemetryMetricSchema}.
 *
 * This type is inferred from the Zod schema and describes the structure of a telemetry metric
 * used throughout the telemetry module. The exact shape of the object depends on the schema definition.
 *
 * @see TelemetryMetricSchema
 */
export type TelemetryMetric = z.infer<typeof TelemetryMetricSchema>;

/**
 * Represents a custom telemetry event as defined by the {@link TelemetryCustomEventSchema}.
 *
 * This type is inferred from the Zod schema and includes all properties and validation rules
 * specified in the schema. It is used to capture custom telemetry events that do not fit into
 * the standard event, exception, or metric categories.
 *
 * @see TelemetryCustomEventSchema
 */
export type TelemetryCustomEvent = z.infer<typeof TelemetryCustomEventSchema>;

/**
 * Represents an adapter for processing telemetry items.
 *
 * Implementations of this interface are responsible for handling telemetry data
 * and are identified by a unique string identifier.
 *
 * @property identifier - A unique string that identifies the telemetry adapter.
 * @method processItem - Processes a given telemetry item.
 * @param item - The telemetry item to be processed.
 */
export interface TelemetryAdapter {
  readonly identifier: string;
  processItem(item: TelemetryItem): void;
}

/**
 * A mapping of adapter identifiers to their corresponding `TelemetryAdapter` instances.
 *
 * Each key in the object represents a unique identifier for a telemetry adapter,
 * and the value is the adapter instance itself.
 *
 * @remarks
 * This interface allows for dynamic registration and retrieval of multiple telemetry adapters
 * by their string identifiers.
 *
 * @example
 * ```typescript
 * const adapters: TelemetryAdapters = {
 *   'console': new ConsoleTelemetryAdapter(),
 *   'remote': new RemoteTelemetryAdapter(),
 * };
 * ```
 */
export interface TelemetryAdapters {
  [identifier: string]: TelemetryAdapter;
}
