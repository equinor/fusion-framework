import type { AnalyticsEvent } from '../types.js';

/**
 * Contract for an analytics adapter that receives events and exports them to a backend.
 *
 * @remarks
 * Implement this interface to create a custom adapter. Register it via
 * {@link IAnalyticsConfigurator.setAdapter}. The adapter must also implement
 * `Disposable` for resource cleanup.
 *
 * @template T - The analytics event type handled by the adapter, defaults to {@link AnalyticsEvent}.
 *
 * @example
 * ```ts
 * class MyAdapter implements IAnalyticsAdapter {
 *   registerAnalytic(event) { fetch('/analytics', { method: 'POST', body: JSON.stringify(event) }); }
 *   [Symbol.dispose]() { /* cleanup *\/ }
 * }
 * ```
 */
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
