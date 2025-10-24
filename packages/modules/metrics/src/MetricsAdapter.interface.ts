import type { MetricEvent } from './types.js';

export interface IMetricsAdapter<T extends MetricEvent = MetricEvent> extends Disposable {
  /**
   * Initializes the metric adapter for setup and configuration.
   *
   * @returns Promise that resolves when initialization is complete, or void for synchronous initialization.
   */
  initialize?(): Promise<void> | void;

  /**
   * Exports metric event to the configured backend.
   *
   * @param events - Array of metric events to export.
   * @returns Promise that resolves when export is complete.
   */
  registerMetric(event: T): Promise<void> | void;
}
