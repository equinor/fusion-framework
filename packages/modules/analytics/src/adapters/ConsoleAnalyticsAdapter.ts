import type { IAnalyticsAdapter } from './AnalyticsAdapter.interface.js';
import type { AnalyticsEvent } from '../types.js';

/**
 * Analytics adapter that logs every event to the browser console.
 *
 * @remarks
 * Useful during development and debugging. Each event is logged with the
 * prefix `Analytics::Adapter::Console`.
 *
 * @template T - Analytics event type, defaults to {@link AnalyticsEvent}.
 *
 * @example
 * ```ts
 * import { ConsoleAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/adapters';
 *
 * builder.setAdapter('console', async () => new ConsoleAnalyticsAdapter());
 * ```
 */
export class ConsoleAnalyticsAdapter<T extends AnalyticsEvent = AnalyticsEvent>
  implements IAnalyticsAdapter
{
  /** Logs the event to the console. */
  registerAnalytic(event: T): Promise<void> | void {
    console.log('Analytics::Adapter::Console', event);
  }

  [Symbol.dispose]() {
    // no-op
  }
}
