import type { AnalyticsEvent } from '../types.js';

export interface IAnalyticsAdapter<T extends AnalyticsEvent = AnalyticsEvent> extends Disposable {
  /**
   * Initializes the analytics adapter for setup and configuration.
   *
   * @returns Promise that resolves when initialization is complete, or void for synchronous initialization.
   */
  initialize?(): Promise<void> | void;

  /**
   * Exports analytics event to the configured backend.
   *
   * @param events - Array of analytics events to export.
   * @returns Promise that resolves when export is complete.
   */
  registerAnalytic(event: T): Promise<void> | void;
}
