import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
  type ConfigBuilderCallback,
} from '@equinor/fusion-framework-module';
import type { IMetricsConfigurator, MetricsConfig } from './MetricsConfigurator.interface.js';
import type { IMetricsReporter } from './MetricsReporter.interface.js';
import type { IMetricsAdapter } from './MetricsAdapter.interface.js';
import type { MetricEvent } from './types.js';
import { from, type ObservableInput } from 'rxjs';

import { map, scan, filter, defaultIfEmpty, shareReplay, mergeMap } from 'rxjs/operators';

export class MetricsConfigurator
  extends BaseConfigBuilder<MetricsConfig>
  implements IMetricsConfigurator
{
  #reporterCallbacks: Record<string, ConfigBuilderCallback<IMetricsReporter>> = {};
  #adapterCallbacks: Record<string, ConfigBuilderCallback<IMetricsAdapter>> = {};

  constructor() {
    super();

    // Configure async reporters resolution using mergeMap to handle Promise/Observable reporter factories
    this._set(
      'reporters',
      (args: ConfigBuilderCallbackArgs): ObservableInput<Record<string, IMetricsReporter>> => {
        return from(Object.entries(this.#reporterCallbacks)).pipe(
          mergeMap(([identifier, reporterFn]) =>
            from(reporterFn(args)).pipe(
              filter((reporter): reporter is IMetricsReporter => !!reporter),
              map((reporter) => [identifier, reporter] as const),
            ),
          ),
          scan(
            (acc, [identifier, reporter]) => {
              acc[identifier] = reporter;
              return acc;
            },
            {} as Record<string, IMetricsReporter>,
          ),
          defaultIfEmpty({}),
          shareReplay({ bufferSize: 1, refCount: true }),
        );
      },
    );

    // Configure async adapters resolution using mergeMap to handle Promise/Observable adapter factories
    this._set(
      'adapters',
      (args: ConfigBuilderCallbackArgs): ObservableInput<Record<string, IMetricsAdapter>> => {
        return from(Object.entries(this.#adapterCallbacks)).pipe(
          mergeMap(([identifier, adapterFn]) =>
            from(adapterFn(args)).pipe(
              filter((adapter): adapter is IMetricsAdapter => !!adapter),
              map((adapter) => [identifier, adapter] as const),
            ),
          ),
          scan(
            (acc, [identifier, adapter]) => {
              acc[identifier] = adapter;
              return acc;
            },
            {} as Record<string, IMetricsAdapter>,
          ),
          defaultIfEmpty({}),
          shareReplay({ bufferSize: 1, refCount: true }),
        );
      },
    );
  }

  setReporter<T extends MetricEvent>(
    identifier: string,
    callback: ConfigBuilderCallback<IMetricsReporter<T>>,
  ): this {
    this.#reporterCallbacks[identifier] = callback;
    return this;
  }

  setAdapter<T extends MetricEvent>(
    identifier: string,
    callback: ConfigBuilderCallback<IMetricsAdapter<T>>,
  ): this {
    this.#adapterCallbacks[identifier] = callback;
    return this;
  }
}
