import type { IMetricsAdapter } from '../MetricsAdapter.interface.js';
import type { MetricEvent } from '../types.js';

export class ConsoleMetricsAdapter<T extends MetricEvent = MetricEvent> implements IMetricsAdapter {
  registerMetric(event: T): Promise<void> | void {
    console.log('Metrics::Adapter::Console', event);
  }

  [Symbol.dispose]() {
    // no-op
  }
}
