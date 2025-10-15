import type { ObservableInput } from 'rxjs';
import type { MetadataExtractor, TelemetryItem } from './types.js';
import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import type { ITelemetryAdapter } from './TelemetryAdapter.js';
import { ConfigBuilderCallback } from '@equinor/fusion-framework-module';

/**
 * Configuration options for setting up telemetry within the application.
 *
 * @property adapters - Optional array of telemetry adapters to be used for sending telemetry data.
 * @property parent - Optional parent telemetry provider for hierarchical telemetry configuration.
 * @property metadata - Optional function or extractor to provide additional metadata for telemetry items.
 * @property defaultScope - Optional array of strings defining the default scope for telemetry events.
 * @property items$ - Optional observable input stream of telemetry items to be processed.
 */
export type TelemetryConfig = {
  adapters?: ITelemetryAdapter[];
  parent?: ITelemetryProvider;
  metadata?: MetadataExtractor;
  defaultScope?: string[];
  items$?: ObservableInput<TelemetryItem>;
};

/**
 * Interface for configuring telemetry within the application.
 *
 * Provides methods to set the telemetry adapter, metadata, and default scope.
 *
 * @interface ITelemetryConfigurator
 */
export interface ITelemetryConfigurator {
  /**
   * Sets the parent telemetry provider for hierarchical telemetry propagation.
   *
   * @param parent - The parent telemetry provider instance.
   * @returns The configurator instance for method chaining.
   */
  setParent(parent: ITelemetryProvider | undefined): this;

  /**
   * Configures a telemetry adapter with the configurator.
   *
   * @param adapter - The telemetry adapter instance to register.
   * @returns The configurator instance for method chaining.
   */
  configureAdapter(adapter: ConfigBuilderCallback<ITelemetryAdapter>): this;

  /**
   * Registers a telemetry adapter to be used for event reporting.
   *
   * @param adapter - The telemetry adapter instance to register.
   * @returns The configurator instance for method chaining.
   */
  setAdapter(adapter: ITelemetryAdapter): this;

  /**
   * Sets the metadata to be associated with telemetry events.
   *
   * @param metadata - A dynamic input value containing metadata.
   * @returns The configurator instance for method chaining.
   */
  setMetadata(metadata: TelemetryConfig['metadata']): this;

  /**
   * Sets the default scope for telemetry events.
   *
   * @param scope - An array of strings specifying the default scope.
   * @returns The configurator instance for method chaining.
   */
  setDefaultScope(scope: string[]): this;

  /**
   * Attaches an observable stream of telemetry items to the configurator.
   *
   * @param item$ - An observable input stream of telemetry items.
   * @returns The configurator instance for method chaining.
   */
  attachItems(item$: ObservableInput<TelemetryItem>): this;
}
