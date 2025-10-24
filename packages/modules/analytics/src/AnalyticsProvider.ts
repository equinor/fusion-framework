import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import { version } from './version.js';

import type { AnalyticsConfig } from './AnalyticsConfigurator.interface.js';
import type { IAnalyticsProvider } from './AnalyticsProvider.interface.js';
import type { AnalyticsEvent } from './types.js';
import { from, type ObservableInput, Subject, Subscription } from 'rxjs';
import type { IAnalyticsCollector } from './collectors/AnalyticsCollector.interface.js';
import type { IAnalyticsAdapter } from './adapters/AnalyticsAdapter.interface.js';

class DisposableSubscription extends Subscription {
  constructor(subscription: Subscription) {
    super(subscription.unsubscribe);
  }

  [Symbol.dispose] = () => {
    this.unsubscribe();
  };
}

/**
 * Provides analytics tracking, adapters integration and collectors for application instrumentation.
 *
 * The `AnalyticsProvider` class is responsible for collecting, processing and relaying analytics
 * data to the adapters. The events are collected with collectors.
 *
 * @typeParam AnalyticsConfig - The configuration type for analytics.
 * @implements IAnalyticsProvider
 * @extends BaseModuleProvider<AnalyticsConfig>
 */
export class AnalyticsProvider
  extends BaseModuleProvider<AnalyticsConfig>
  implements IAnalyticsProvider
{
  #analytics: Subject<AnalyticsEvent>;
  #collectors: Record<string, IAnalyticsCollector>;
  #adapters: Record<string, IAnalyticsAdapter>;

  constructor(config: AnalyticsConfig) {
    super({ version, config });

    this.#analytics = new Subject();
    this.#collectors = config.collectors;
    this.#adapters = config.adapters;
  }

  /**
   * Initializes the analytics provider with adapters and collectors.
   *
   * This method sets up the provider for operation by:
   * 1. Storing the provided adapters
   * 2. Initializing all adapters
   * 3. Storing the provided collectors
   * 4. Initializing all collectors
   * 5. Setting up subscription for analytics processing
   *
   * @returns A promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    const initializedCollectors = Object.values(this.#collectors).map((collector) =>
      Promise.resolve(collector.initialize?.()),
    );
    const initializedAdapters = Object.values(this.#adapters).map((adapters) =>
      Promise.resolve(adapters.initialize?.()),
    );

    await Promise.allSettled(initializedCollectors);
    await Promise.allSettled(initializedAdapters);

    for (const collector of Object.values(this.#collectors)) {
      const subscription = collector.subscribe({
        next: (event) => {
          this.#analytics.next(event);
        },
      });

      this._addTeardown(subscription);
    }

    const adapterSubscription = this.#analytics.subscribe({
      next: (event) => {
        for (const adapter of Object.values(this.#adapters)) {
          adapter.registerAnalytic(event);
        }
      },
    });
    this._addTeardown(adapterSubscription);
  }

  /**
   * Tracks an analytics event
   *
   * @param event - The analytics event to track
   */
  trackAnalytic(event: AnalyticsEvent): void {
    // @TODO: Validate AnalyticsEvent includes name, value and attributes
    this.#analytics.next(event);
  }

  /**
   * Uses a analytics stream and returns both Disposable and Subscription for cleanup.
   *
   * @param analytic$ - Observable input stream of analytic events.
   * @returns Object containing both Disposable and Subscription for proper cleanup.
   */
  trackAnalytic$(analytic$: ObservableInput<AnalyticsEvent>): Disposable & Subscription {
    const subscription = from(analytic$)
      // @TODO: Validate AnalyticsEvent includes name, value and attributes
      .subscribe({
        next: (event) => {
          this.#analytics.next(event);
        },
      });

    return new DisposableSubscription(subscription);
  }
}
