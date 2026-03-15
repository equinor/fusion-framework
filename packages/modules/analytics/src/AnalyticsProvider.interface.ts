import type { ObservableInput, Subscription } from 'rxjs';
import type { AnalyticsEvent } from './types.js';

/**
 * Public interface for the analytics provider exposed by the `analytics` module.
 *
 * @remarks
 * Use `trackAnalytic` to push a single event or `trackAnalytic$` to forward
 * an observable stream of events. Both methods route events to all registered
 * adapters.
 */
export interface IAnalyticsProvider {
  /**
   * Pushes a single analytics event to all registered adapters.
   *
   * @param event - The analytics event to track.
   *
   * @example
   * ```ts
   * provider.trackAnalytic({
   *   name: 'button-click',
   *   value: 'save',
   *   attributes: { page: 'settings' },
   * });
   * ```
   */
  trackAnalytic(event: AnalyticsEvent): void;

  /**
   * Subscribes to an observable stream of analytics events and forwards each
   * emission to all registered adapters.
   *
   * @param analytic$ - Observable input stream of analytics events.
   * @returns A combined `Disposable & Subscription` handle for cleanup.
   *
   * @example
   * ```ts
   * const sub = provider.trackAnalytic$(myEvent$);
   * // later
   * sub.unsubscribe();
   * ```
   */
  trackAnalytic$(analytic$: ObservableInput<AnalyticsEvent>): Disposable & Subscription;
}
