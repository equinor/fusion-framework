import type { Observable } from 'rxjs';

// import type { ModuleType } from '@equinor/fusion-framework-module';

import { createStore } from './StateProvider.store';
import { actions } from './StateProvider.actions';

import type { AllowedValue, IStateItem } from './StateItem';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import { flows } from './StateProvider.flows';
import type { StateModuleConfig } from './types';
import { version } from './version';

/**
 * Represents a state provider.
 */
export interface IStateProvider {
  /**
   * The collection of state items managed by the provider.
   */
  readonly items: Record<string, IStateItem>;

  /**
   * An observable stream of the state items managed by the provider.
   */
  readonly items$: Observable<Record<string, IStateItem>>;

  /**
   * Sets the feature flags for the provider.
   * @param features - The feature flags to set.
   */
  // storeItems(features: Array<IStateItem>): void; // @TODO: add later

  /**
   * Retrieves the feature flag with the specified key, if found.
   * @param key - The key of the feature flag to retrieve.
   * @returns The matching feature flag, or undefined if not found.
   */
  getItem<T extends AllowedValue>(key: string): IStateItem<T> | undefined;

  // /**
  //  * Retrieves the feature flags that match the specified selector function.
  //  * @param selector - The selector function to filter the feature flags.
  //  * @returns An array of feature flags that match the selector.
  //  */
  // getItems(selector: FeatureSelectorFn): Array<IFeatureFlag>; // @TODO: add later

  /**
   * Checks if the provider has a feature flag with the specified key.
   * @param key - The key of the feature flag to check.
   * @returns True if the feature flag exists, false otherwise.
   */
  hasItem(key: string): boolean;

  /**
   * Sets the state for the provider.
   * @param item The item to save.
   */
  storeItem(item: IStateItem): void;

}

export class StateProvider extends BaseModuleProvider implements IStateProvider {
  #store: ReturnType<typeof createStore>;

  get items(): Record<string, IStateItem> {
    return this.#store.value.items;
  }

  get items$(): Observable<Record<string, IStateItem>> {
    return this.#store.select(state => state.items);
  }

  getItem<T extends AllowedValue>(key: string): IStateItem<T> | undefined {
    return this.#store.value.items[key] as IStateItem<T>;
  }

  hasItem(key: string): boolean {
    return !!this.#store.value.items[key];
  }

  storeItem(item: IStateItem): void {
    this.#store.next(actions.storeItem(item));
  }

  constructor(args: { config: StateModuleConfig }) {
    super({ version, config: args.config });

    this.#store = createStore({
      items: args.config.initial.reduce((acc, item) => {
       return Object.assign(acc, { [item.key]: item });
      }, {}),
    });

    this.#store.addFlow(flows(args.config.adapters));
  }
}

// declare module '@equinor/fusion-framework-module-event' {
//   interface FrameworkEventMap {
//     onFeatureFlagToggle: FrameworkEvent<
//       FrameworkEventInit<{ feature: IFeatureFlag; enable: boolean }, IFeatureFlagProvider>
//     >;
//     onFeatureFlagsToggled: FrameworkEvent<
//       FrameworkEventInit<
//         {
//           features: Array<IFeatureFlag>;
//         },
//         IFeatureFlagProvider
//       >
//     >;
//   }
// }
