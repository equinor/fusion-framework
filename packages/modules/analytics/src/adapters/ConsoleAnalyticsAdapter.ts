import type { IAnalyticsAdapter } from './AnalyticsAdapter.interface.js';
import type { AnalyticsEvent } from '../types.js';

/**
 * An analytics adapter printing the events to the console.
 */
export class ConsoleAnalyticsAdapter<T extends AnalyticsEvent = AnalyticsEvent>
  implements IAnalyticsAdapter
{
  registerAnalytic(event: T): Promise<void> | void {
    console.log('Analytics::Adapter::Console', event);
  }

  [Symbol.dispose]() {
    // no-op
  }
}
