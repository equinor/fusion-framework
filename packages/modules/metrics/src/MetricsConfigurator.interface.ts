import type { ConfigBuilderCallback } from '@equinor/fusion-framework-module';
import type { IMetricsReporter } from './MetricsReporter.interface.js';
import type { IMetricsAdapter } from './MetricsAdapter.interface.js';
import type { MetricEvent } from './types.js';

/**
 * Configuration options for setting up metrics within the framework.
 *
 * @property reporters - Optional record of metric reporters keyed by identifier to be used for reporting metric data.
 */
export type MetricsConfig = {
  reporters: Record<string, IMetricsReporter>;
  adapters: Record<string, IMetricsAdapter>;
};

export interface IMetricsConfigurator {
  /**
   * Sets a metric reporter with the given identifier and configuration callback.
   *
   * @param identifier - The unique identifier for the reporter.
   * @param callBack - Configuration callback that returns the reporter instance.
   * @returns The configurator instance for method chaining.
   */
  setReporter<T extends MetricEvent>(
    identifier: string,
    callBack: ConfigBuilderCallback<IMetricsReporter<T>>,
  ): this;

  setAdapter<T extends MetricEvent>(
    identifier: string,
    callback: ConfigBuilderCallback<IMetricsAdapter<T>>,
  ): this;
}
