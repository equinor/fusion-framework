import type { Subscribable } from 'rxjs';
import type { AnalyticsEvent } from '../types.js';

/**
 * Interface representing an analytics collector responsible for sending analytics events.
 *
 * @template T - The type of analytics event handled by the adapter. Defaults to `AnalyticsEvent`.
 */
export interface IAnalyticsCollector<T extends AnalyticsEvent = AnalyticsEvent>
  extends Subscribable<T> {
  /**
   * Initializes the analytics collector for setup and configuration.
   * This method is optional - if not implemented, the collector should be directly subscribable.
   *
   * @returns Promise that resolves when initialization is complete, or void for synchronous initialization.
   */
  initialize?(): Promise<void> | void;
}
