import type { ObservableInput, Subscription } from 'rxjs';
import type { AnalyticsEvent } from './types.js';

/**
 * Interface for analytics providers used to track analytics events.
 */
export interface IAnalyticsProvider {
  /**
   * Tracks a analytics event.
   *
   * @param event - The analytic event to track.
   */
  trackAnalytic(event: AnalyticsEvent): void;

  /**
   * Uses a analytics stream and returns both Disposable and Subscription for cleanup.
   *
   * @param analytic$ - Observable input stream of analytic events.
   * @returns Object containing both Disposable and Subscription for proper cleanup.
   */
  trackAnalytic$(analytic$: ObservableInput<AnalyticsEvent>): Disposable & Subscription;
}
