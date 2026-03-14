import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import { version } from './version.js';

import type { AnalyticsConfig } from './AnalyticsConfigurator.interface.js';
import type { IAnalyticsProvider } from './AnalyticsProvider.interface.js';
import type { AnalyticsEvent } from './types.js';
import { from, type ObservableInput, Subject, Subscription } from 'rxjs';
import type { IAnalyticsCollector } from './collectors/AnalyticsCollector.interface.js';
import type { IAnalyticsAdapter } from './adapters/AnalyticsAdapter.interface.js';

/**
 * An RxJS `Subscription` that also implements the TC39 `Disposable` protocol.
 *
 * @remarks
 * Returned by {@link AnalyticsProvider.trackAnalytic$} so callers can clean up
 * with either `subscription.unsubscribe()` or `using` / `Symbol.dispose`.
 */
class DisposableSubscription extends Subscription {
  constructor(subscription: Subscription) {
    super(subscription.unsubscribe);
  }

  [Symbol.dispose] = () => {
    this.unsubscribe();
  };
}

/**
 * Runtime analytics provider that collects events from collectors and dispatches
 * them to adapters.
 *
 * @remarks
 * Created by the analytics module during initialisation. The provider:
 *
 * 1. Initialises all registered adapters and collectors.
 * 2. Subscribes to every collector and merges their events into a shared stream.
 * 3. Forwards each emitted event to every registered adapter via
 *    {@link IAnalyticsAdapter.registerAnalytic}.
 *
 * Consumers can also push ad-hoc events with {@link AnalyticsProvider.trackAnalytic}
 * or subscribe an observable stream with {@link AnalyticsProvider.trackAnalytic$}.
 *
 * @extends BaseModuleProvider<AnalyticsConfig>
 * @implements IAnalyticsProvider
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
   * Initialises all adapters and collectors, then wires collector output into
   * the adapter pipeline.
   *
   * @remarks
   * Initialisation is idempotent within the module lifecycle — the module calls
   * this once during `module.initialize`. Steps:
   *
   * 1. Initialise all collectors (via `Promise.allSettled`).
   * 2. Initialise all adapters (via `Promise.allSettled`).
   * 3. Subscribe to each collector and forward events into the shared subject.
   * 4. Subscribe to the shared subject and dispatch to every adapter.
   *
   * All subscriptions are registered as teardowns on the base provider.
   *
   * @returns A promise that resolves when all adapters and collectors are initialised.
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
   * Pushes a single analytics event to all registered adapters.
   *
   * @param event - The analytics event to track.
   */
  trackAnalytic(event: AnalyticsEvent): void {
    // @TODO: Validate AnalyticsEvent includes name, value and attributes
    this.#analytics.next(event);
  }

  /**
   * Subscribes to an observable stream of analytics events and forwards each
   * emission to all registered adapters.
   *
   * @param analytic$ - Observable input stream of analytics events.
   * @returns A {@link DisposableSubscription} supporting both `unsubscribe()` and `Symbol.dispose`.
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
