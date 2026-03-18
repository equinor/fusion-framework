import type { Subscribable } from 'rxjs';
import type { AnalyticsEvent } from '../types.js';

/**
 * Contract for an analytics collector that observes application state and emits
 * structured analytics events.
 *
 * @remarks
 * Implement this interface (or extend {@link BaseCollector}) to create a custom
 * collector. Register it via {@link IAnalyticsConfigurator.setCollector}.
 *
 * The collector must be `Subscribable` so the provider can listen for emitted
 * events. Optionally implement `initialize` for async setup (e.g. resolving
 * module dependencies).
 *
 * @template T - Analytics event type emitted by this collector, defaults to {@link AnalyticsEvent}.
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
