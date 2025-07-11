import type { TelemetryAdapter, TelemetryItem } from './types.js';
import type { DynamicInputValue } from '@equinor/fusion-observable';
import type { ITelemetryProvider } from './TelemetryProvider.interface.js';

/**
 * Configuration options for telemetry integration.
 *
 * @property adapters - Optional array of telemetry adapters to be used for event reporting.
 * @property parent - Optional parent telemetry provider for hierarchical telemetry propagation.
 * @property event - Optional event module provider for event handling and dispatching.
 * @property metadata - Optional dynamic input value containing metadata to be associated with telemetry events.
 * @property defaultScope - Optional array of strings specifying the default scope for telemetry events.
 */
export type TelemetryConfig = {
  adapters?: TelemetryAdapter[];
  parent?: ITelemetryProvider;
  metadata?: DynamicInputValue<TelemetryItem['metadata']>;
  defaultScope?: string[];
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
   * Registers a telemetry adapter to be used for event reporting.
   *
   * @param adapter - The telemetry adapter instance to register.
   * @returns The configurator instance for method chaining.
   */
  setAdapter(adapter: TelemetryAdapter): this;

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
}
