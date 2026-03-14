import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
  type ConfigBuilderCallback,
} from '@equinor/fusion-framework-module';
import type { IAnalyticsConfigurator, AnalyticsConfig } from './AnalyticsConfigurator.interface.js';
import type { IAnalyticsCollector } from './collectors/AnalyticsCollector.interface.js';
import type { IAnalyticsAdapter } from './adapters/AnalyticsAdapter.interface.js';
import type { AnalyticsEvent } from './types.js';
import { from, type ObservableInput } from 'rxjs';

import { map, scan, filter, defaultIfEmpty, shareReplay, mergeMap } from 'rxjs/operators';

/**
 * Default {@link IAnalyticsConfigurator} implementation for registering analytics adapters and collectors.
 *
 * @remarks
 * Extends `BaseConfigBuilder` to resolve adapter and collector factories
 * asynchronously at module-initialisation time using RxJS `mergeMap`. Each
 * registered factory is invoked with the module’s `ConfigBuilderCallbackArgs`
 * so it can resolve dependencies from the framework before returning its
 * adapter or collector instance.
 *
 * Use {@link AnalyticsConfigurator.setAdapter | setAdapter} and
 * {@link AnalyticsConfigurator.setCollector | setCollector} to register
 * components. Both methods return `this` for fluent chaining.
 *
 * @see {@link IAnalyticsConfigurator}
 * @see {@link BaseConfigBuilder}
 */
export class AnalyticsConfigurator
  extends BaseConfigBuilder<AnalyticsConfig>
  implements IAnalyticsConfigurator
{
  #collectorCallbacks: Record<string, ConfigBuilderCallback<IAnalyticsCollector>> = {};
  #adapterCallbacks: Record<string, ConfigBuilderCallback<IAnalyticsAdapter>> = {};

  constructor() {
    super();

    // Configure async collectors resolution using mergeMap to handle Promise/Observable collector factories
    this._set(
      'collectors',
      (args: ConfigBuilderCallbackArgs): ObservableInput<Record<string, IAnalyticsCollector>> => {
        return from(Object.entries(this.#collectorCallbacks)).pipe(
          mergeMap(([identifier, collectorFn]) =>
            from(collectorFn(args)).pipe(
              filter((collector): collector is IAnalyticsCollector => !!collector),
              map((collector) => [identifier, collector] as const),
            ),
          ),
          scan(
            (acc, [identifier, collector]) => {
              acc[identifier] = collector;
              return acc;
            },
            {} as Record<string, IAnalyticsCollector>,
          ),
          defaultIfEmpty({}),
          shareReplay({ bufferSize: 1, refCount: true }),
        );
      },
    );

    // Configure async adapters resolution using mergeMap to handle Promise/Observable adapter factories
    this._set(
      'adapters',
      (args: ConfigBuilderCallbackArgs): ObservableInput<Record<string, IAnalyticsAdapter>> => {
        return from(Object.entries(this.#adapterCallbacks)).pipe(
          mergeMap(([identifier, adapterFn]) =>
            from(adapterFn(args)).pipe(
              filter((adapter): adapter is IAnalyticsAdapter => !!adapter),
              map((adapter) => [identifier, adapter] as const),
            ),
          ),
          scan(
            (acc, [identifier, adapter]) => {
              acc[identifier] = adapter;
              return acc;
            },
            {} as Record<string, IAnalyticsAdapter>,
          ),
          defaultIfEmpty({}),
          shareReplay({ bufferSize: 1, refCount: true }),
        );
      },
    );
  }

  /**
   * Registers an analytics collector factory.
   *
   * @template T - The concrete analytics event type the collector emits.
   * @param identifier - Unique key for the collector.
   * @param callback - Factory that receives module-resolution args and returns a collector.
   * @returns `this` for method chaining.
   */
  setCollector<T extends AnalyticsEvent>(
    identifier: string,
    callback: ConfigBuilderCallback<IAnalyticsCollector<T>>,
  ): this {
    this.#collectorCallbacks[identifier] = callback;
    return this;
  }

  /**
   * Registers an analytics adapter factory.
   *
   * @template T - The concrete analytics event type the adapter handles.
   * @param identifier - Unique key for the adapter.
   * @param callback - Factory that receives module-resolution args and returns an adapter.
   * @returns `this` for method chaining.
   */
  setAdapter<T extends AnalyticsEvent>(
    identifier: string,
    callback: ConfigBuilderCallback<IAnalyticsAdapter<T>>,
  ): this {
    this.#adapterCallbacks[identifier] = callback;
    return this;
  }
}
