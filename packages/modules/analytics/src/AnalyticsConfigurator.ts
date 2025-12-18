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
 * Configures analytics settings for the module.
 *
 * The `AnalyticsConfigurator` class extends `BaseConfigBuilder` to provide a fluent API for
 * setting up analytics adapters and collectors.
 *
 * @remarks
 * - Adapters are managed internally and can be set using `setAdapter`.
 * - Collectors are managed internally and can be set using `setCollector`.
 * - All setter methods return `this` for method chaining.
 *
 * @see BaseConfigBuilder
 * @see IAnalyticsConfigurator
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
   * Registers a analytics collector with the configurator.
   *
   * @param identifier - The name of the collector
   * @param callback - A callback function that returns an analytics collector instance
   * @returns The current instance for method chaining
   */
  setCollector<T extends AnalyticsEvent>(
    identifier: string,
    callback: ConfigBuilderCallback<IAnalyticsCollector<T>>,
  ): this {
    this.#collectorCallbacks[identifier] = callback;
    return this;
  }

  /**
   * Registers a analytics adapter with the configurator.
   *
   * @param identifier - The name of the adapter
   * @param callback - A callback function that returns an analytics adapter instance
   * @returns The current instance for method chaining
   */
  setAdapter<T extends AnalyticsEvent>(
    identifier: string,
    callback: ConfigBuilderCallback<IAnalyticsAdapter<T>>,
  ): this {
    this.#adapterCallbacks[identifier] = callback;
    return this;
  }
}
