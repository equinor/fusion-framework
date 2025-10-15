import {
  type Observable,
  filter,
  from,
  lastValueFrom,
  map,
  pairwise,
  reduce,
  switchMap,
} from 'rxjs';

import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type { ModuleType } from '@equinor/fusion-framework-module';
import type {
  EventModule,
  FrameworkEvent,
  FrameworkEventInit,
} from '@equinor/fusion-framework-module-event';

import { version } from './version.js';

import { createState } from './FeatureFlagProvider.state';
import { actions } from './FeatureFlagProvider.actions';

import type { FeatureFlagConfig } from './types';
import type { IFeatureFlag } from './FeatureFlag';
import { normalizeFlags } from './utils/normalize-flags';
import type { FeatureSelectorFn } from './utils/selectors';

export type CompareFeature = (a: IFeatureFlag | undefined, b: IFeatureFlag | undefined) => boolean;

/**
 * Represents a feature flag provider.
 */
export interface IFeatureFlagProvider {
  /**
   * The collection of features managed by the provider.
   */
  readonly features: Record<string, IFeatureFlag>;

  /**
   * An observable stream of the features managed by the provider.
   */
  readonly features$: Observable<Record<string, IFeatureFlag>>;

  /**
   * Toggles the enabled flag of a specific feature.
   * @param feature - The feature to toggle.
   */
  toggleFeature(feature: { key: string; enabled: boolean }): Promise<void>;

  /**
   * Toggles the enabled flag of multiple features.
   * @param features - The features to toggle.
   */
  toggleFeatures(features: Array<{ key: string; enabled: boolean }>): Promise<void>;

  /**
   * Registers a callback function to be called when a feature is toggled.
   * @param cb - The callback function to be called.
   * @returns A function that can be used to unregister the callback.
   */
  onFeatureToggle(cb: (detail: { features: IFeatureFlag<unknown>[] }) => void): VoidFunction;

  /**
   * Sets the feature flags for the provider.
   * @param features - The feature flags to set.
   */
  setFeatures(features: Array<IFeatureFlag>): void;

  /**
   * Retrieves the feature flag with the specified key, if found.
   * @param key - The key of the feature flag to retrieve.
   * @returns The matching feature flag, or undefined if not found.
   */
  getFeature<T>(key: string): IFeatureFlag<T> | undefined;

  /**
   * Retrieves the feature flags that match the specified selector function.
   * @param selector - The selector function to filter the feature flags.
   * @returns An array of feature flags that match the selector.
   */
  getFeatures(selector: FeatureSelectorFn): Array<IFeatureFlag>;

  /**
   * Checks if the provider has a feature flag with the specified key.
   * @param key - The key of the feature flag to check.
   * @returns True if the feature flag exists, false otherwise.
   */
  hasFeature(key: string): boolean;
}

export class FeatureFlagProvider
  extends BaseModuleProvider<FeatureFlagConfig>
  implements IFeatureFlagProvider
{
  #state: ReturnType<typeof createState>;
  #event?: ModuleType<EventModule>;

  get features(): Record<string, IFeatureFlag> {
    return this.#state.value.features;
  }

  get features$(): Observable<Record<string, IFeatureFlag>> {
    return this.#state.pipe(map((x) => x.features));
  }

  constructor(args: { config: FeatureFlagConfig; event?: ModuleType<EventModule> }) {
    const { config, event } = args;

    super({ version, config });

    this.#event = event;
    this.#state = createState({
      features: normalizeFlags(config.initial),
    });

    /** connect all plugins */
    for (const plugin of Object.values(config.plugins)) {
      if (plugin.connect) {
        this._addTeardown(plugin.connect({ provider: this }));
      }
    }

    if (event) {
      this._addTeardown(
        this.onFeatureToggle(({ features }) =>
          event.dispatchEvent('onFeatureFlagsToggled', { detail: { features } }),
        ),
      );
    }
  }

  public hasFeature(key: string): boolean {
    return key in this.features;
  }

  public setFeatures(features: Array<IFeatureFlag>): void {
    this.#state.next(actions.setFeatures(features));
  }

  public onFeatureToggle(
    cb: (detail: { features: IFeatureFlag<unknown>[] }) => void,
  ): VoidFunction {
    const subscription = this.features$
      .pipe(
        pairwise(),
        map(([previous, current]) => {
          return Object.values(current).filter((feature) => {
            return feature.enabled !== previous[feature.key]?.enabled;
          });
        }),
        map((features) => ({ features })),
      )
      .subscribe(cb);
    return this._addTeardown(subscription);
  }

  public async toggleFeature(value: { key: string; enabled: boolean }): Promise<void> {
    return this.toggleFeatures([value]);
  }

  public async toggleFeatures(values: Array<{ key: string; enabled: boolean }>): Promise<void> {
    // get current features from the state
    const { features } = this.#state.value;

    // create an observable from the provided values
    const onToggle = from(values).pipe(
      //  notify event observers that a feature is about to be toggled - parallel execution
      switchMap(async (value) => {
        const feature = features[value.key];
        if (!feature) {
          console.warn(`toggling flag [${value.key}] which is not registered`);
          return;
        } else if (feature.readonly) {
          console.warn(`skipped toggling flag [${feature.key}], since readonly!`);
          return;
        }
        // notify event observers that a feature is about to be toggled - can be canceled
        const event = await this.#event?.dispatchEvent('onFeatureFlagToggle', {
          source: this,
          detail: {
            feature,
            enable: value.enabled,
          },
          cancelable: true,
        });
        if (!event?.canceled) {
          return value;
        } else {
          console.debug(`skipped toggling flag [${feature.key}], since aborted!`);
        }
      }),
      // filter out undefined values
      filter((x): x is { key: string; enabled: boolean } => !!x),
      // reduce the toggle values to an array of toggle values
      reduce((acc, value) => acc.concat([value]), [] as Array<{ key: string; enabled: boolean }>),
    );

    // wait for the onToggle observable to complete and get the toggled features
    const toggledFeatures = await lastValueFrom(onToggle);

    // dispatch the toggle values to the state
    this.#state.next(actions.toggleFeatures(toggledFeatures));
  }

  public getFeature<T = unknown>(key: string): IFeatureFlag<T> | undefined {
    return this.features[key] as IFeatureFlag<T>;
  }

  public getFeatures(selector: FeatureSelectorFn): Array<IFeatureFlag> {
    return Object.values(this.features).filter(selector);
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    onFeatureFlagToggle: FrameworkEvent<
      FrameworkEventInit<{ feature: IFeatureFlag; enable: boolean }, IFeatureFlagProvider>
    >;
    onFeatureFlagsToggled: FrameworkEvent<
      FrameworkEventInit<
        {
          features: Array<IFeatureFlag>;
        },
        IFeatureFlagProvider
      >
    >;
  }
}
