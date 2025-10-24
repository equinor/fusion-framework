import type { ObservableInput, Subscription } from 'rxjs';
import type { MetricEvent } from './types.js';

export interface IMetricsProvider {
  /**
   * Tracks a metric event.
   *
   * @param event - The metric event to track.
   */
  trackMetric(event: MetricEvent): void;

  /**
   * Uses a metric stream and returns both Disposable and Subscription for cleanup.
   *
   * @param metric$ - Observable input stream of metric events.
   * @returns Object containing both IDisposable and Subscription for proper cleanup.
   */
  trackMetric$(metric$: ObservableInput<MetricEvent>): Disposable & Subscription;
}
