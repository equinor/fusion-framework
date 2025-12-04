import type { Subscribable } from 'rxjs';
import type { AnalyticsEvent } from '../types.js';

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
