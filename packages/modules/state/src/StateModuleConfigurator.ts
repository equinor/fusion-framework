import { type Observable, forkJoin, from } from 'rxjs';
import { concatMap, filter, last, map, mergeMap, reduce, share } from 'rxjs/operators';
import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';
import type {
  StateModuleConfig,
  StateModuleAdapterConfigCallback,
} from './types.js';
import type { IStorageAdapter } from './adapters/StorageAdapter.js';
import type { IStateItem } from './StateItem.js';

export interface IStateModuleConfigurator extends BaseConfigBuilder<StateModuleConfig> {
  /**
   * Adds a adapter to store state configurator.
   *
   * You most likely want `enableCgi` or `enableApi`
   *
   * @param handler The callback function that configures the storage adapter.
   */
  addAdapter(handler: StateModuleAdapterConfigCallback): void;
}

export class StateConfigurator
  extends BaseConfigBuilder<StateModuleConfig>
  implements IStateModuleConfigurator
{
  /**
   * Array of storage adapter configuration callbacks.
   */
  #adapters: StateModuleAdapterConfigCallback[] = [];

  public addAdapter(handler: StateModuleAdapterConfigCallback) {
    this.#adapters.push(handler);
    return this;
  }

  protected _processConfig(
    config: Partial<StateModuleConfig>,
    init: ConfigBuilderCallbackArgs,
  ): Observable<StateModuleConfig> {
    /**
     * Observable stream that emits the initialized adapters.
     */
    const adapters$: Observable<Array<IStorageAdapter>> = from(this.#adapters).pipe(
      /** initialize adapters */
      mergeMap((adapter) => adapter(init)),
      /** skip empty adapter definitions */
      filter((adapter) => Object.keys(adapter).length > 0),
      reduce(
        (acc, adapter) => {
          acc.push(adapter);
          return acc;
        },
        [] as Array<IStorageAdapter>,
      ),
      last(),
      share(),
    );

    /**
     * Observable stream that emits the initial feature flags based on the plugins.
     */
    const initial$: Observable<IStateItem[]> = adapters$.pipe(
      concatMap((adapters) =>
        from(adapters.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))).pipe(
          /** only get initial value from adapters that support functionality */
          filter((adapter): adapter is Required<IStorageAdapter> => !!adapter.initial),
          concatMap((adapter) => from(adapter.initial)),
          reduce((acc, items) => {
            return acc.concat(items);
          }, [] as IStateItem[]),
        ),
      ),
    );

    /**
     * Observable that emits the merged configuration of initial feature flags and plugins.
     */
    const config$: Observable<StateModuleConfig> = forkJoin({
      initial: initial$,
      adapters: adapters$,
    }).pipe(map((resolve) => ({ ...config, ...resolve })));

    return config$;
  }
}

export default StateConfigurator;
