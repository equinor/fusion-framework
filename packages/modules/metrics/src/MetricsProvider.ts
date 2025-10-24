import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import { version } from './version.js';

import type { MetricsConfig } from './MetricsConfigurator.interface.js';
import type { IMetricsProvider } from './MetricsProvider.interface.js';
import type { MetricEvent } from './types.js';
import { from, map, type ObservableInput, Subject, Subscription } from 'rxjs';
import type { IMetricsReporter } from './MetricsReporter.interface.js';
import type { IMetricsAdapter } from './MetricsAdapter.interface.js';
import { MetricEventSchema } from './schemas/index.js';

class DisposableSubscription extends Subscription {
  constructor(subscription: Subscription) {
    super(subscription.unsubscribe);
  }

  [Symbol.dispose] = () => {
    this.unsubscribe();
  };
}

export class MetricsProvider extends BaseModuleProvider<MetricsConfig> implements IMetricsProvider {
  #metrics: Subject<MetricEvent>;
  #reporters: Record<string, IMetricsReporter>;
  #adapters: Record<string, IMetricsAdapter>;

  constructor(config: MetricsConfig) {
    super({ version, config });

    this.#metrics = new Subject();
    this.#reporters = config.reporters;
    this.#adapters = config.adapters;
  }

  async initialize(): Promise<void> {
    const initializedReporters = Object.values(this.#reporters).map((reporter) =>
      Promise.resolve(reporter.initialize?.()),
    );
    const initializedAdapters = Object.values(this.#adapters).map((adapters) =>
      Promise.resolve(adapters.initialize?.()),
    );

    await Promise.allSettled(initializedReporters);
    await Promise.allSettled(initializedAdapters);

    for (const reporter of Object.values(this.#reporters)) {
      const subscription = reporter.subscribe({
        next: (event) => {
          this.#metrics.next(event);
        },
      });

      this._addTeardown(subscription);
    }

    const adapterSubscription = this.#metrics.subscribe({
      next: (event) => {
        for (const adapter of Object.values(this.#adapters)) {
          adapter.registerMetric(event);
        }
      },
    });
    this._addTeardown(adapterSubscription);
  }

  trackMetric(event: MetricEvent): void {
    const parsedEvent = MetricEventSchema.parse(event);
    this.#metrics.next(parsedEvent);
  }

  trackMetric$(metric$: ObservableInput<MetricEvent>): Disposable & Subscription {
    const subscription = from(metric$)
      .pipe(map((event) => MetricEventSchema.parse(event)))
      .subscribe({
        next: (event) => {
          this.#metrics.next(event);
        },
      });

    return new DisposableSubscription(subscription);
  }
}
