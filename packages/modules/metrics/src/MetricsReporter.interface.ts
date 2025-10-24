import type { Subscribable } from 'rxjs';
import type { MetricEvent } from './types.js';

export interface IMetricsReporter<T extends MetricEvent = MetricEvent> extends Subscribable<T> {
  /**
   * Initializes the metric reporter for setup and configuration.
   * This method is optional - if not implemented, the reporter should be directly subscribable.
   *
   * @returns Promise that resolves when initialization is complete, or void for synchronous initialization.
   */
  initialize?(): Promise<void> | void;
}
