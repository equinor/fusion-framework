import { type Observable, forkJoin, from } from 'rxjs';
import { concatMap, filter, last, map, mergeMap, reduce, share } from 'rxjs/operators';
import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';
import type {
  FeatureFlagConfig,
  FeatureFlagPlugin,
  FeatureFlagPluginConfigCallback,
} from './types.js';
import type { IFeatureFlag } from './FeatureFlag.js';
import { createLocalStoragePlugin, createUrlPlugin } from './plugins/index.js';

// TODO allow configurator to have array
// TODO fix .dot type

/**
 * Public interface for configuring the feature-flag module.
 *
 * Consumers use the builder methods to register plugins that supply and
 * persist feature flags.
 */
export interface IFeatureFlagConfigurator extends BaseConfigBuilder<FeatureFlagConfig> {
  /**
   * Adds a plugin to the feature flag configurator.
   *
   * You most likely want `enableCgi` or `enableApi`
   *
   * @param handler The callback function that configures the feature flag plugin.
   */
  addPlugin(handler: FeatureFlagPluginConfigCallback): void;
}

/**
 * Default implementation of {@link IFeatureFlagConfigurator}.
 *
 * Collects plugin registrations during the configuration phase and resolves
 * them into a {@link FeatureFlagConfig} when the module initialises.
 */
export class FeatureFlagConfigurator
  extends BaseConfigBuilder<FeatureFlagConfig>
  implements IFeatureFlagConfigurator
{
  /**
   * Array of feature flag plugin configuration callbacks.
   */
  #plugins: FeatureFlagPluginConfigCallback[] = [];
  #flags: IFeatureFlag[] = [];

  /**
   * Registers a plugin configuration callback.
   *
   * @param handler - Factory that receives module init arguments and returns a plugin.
   * @returns This configurator instance for chaining.
   */
  public addPlugin(handler: FeatureFlagPluginConfigCallback) {
    this.#plugins.push(handler);
    return this;
  }

  /**
   * Convenience method that registers the local-storage plugin.
   *
   * @param args - Arguments forwarded to {@link createLocalStoragePlugin}.
   * @returns This configurator instance for chaining.
   * @deprecated Will be removed when a dedicated API replaces local storage.
   */
  public enableLocalFeatures(...args: Parameters<typeof createLocalStoragePlugin>) {
    return this.addPlugin(createLocalStoragePlugin(...args));
  }

  /**
   * Convenience method that registers the URL-toggle plugin.
   *
   * @param args - Arguments forwarded to {@link createUrlPlugin}.
   * @returns This configurator instance for chaining.
   */
  public enableUrlToggle(...args: Parameters<typeof createUrlPlugin>) {
    return this.addPlugin(createUrlPlugin(...args));
  }

  protected _processConfig(
    config: Partial<FeatureFlagConfig>,
    init: ConfigBuilderCallbackArgs,
  ): Observable<FeatureFlagConfig> {
    /**
     * Observable stream that emits the initialized plugins.
     */
    const plugins$: Observable<Array<FeatureFlagPlugin>> = from(this.#plugins).pipe(
      /** initialize plugins */
      mergeMap((plugin) => plugin(init)),
      /** skip empty plugin definitions */
      filter((plugin) => Object.keys(plugin).length > 0),
      reduce(
        (acc, plugin) => {
          acc.push(plugin);
          return acc;
        },
        [] as Array<FeatureFlagPlugin>,
      ),
      last(),
      share(),
    );

    /**
     * Observable stream that emits the initial feature flags based on the plugins.
     */
    const initial$: Observable<IFeatureFlag[]> = plugins$.pipe(
      concatMap((plugins) =>
        from(plugins.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))).pipe(
          /** only get initial value from plugins that support functionality */
          filter((x) => !!x.initial),
          concatMap((x) => x.initial!()),
          reduce((acc, items) => {
            for (const key in items) {
              if (key in acc) {
                console.warn('FeatureFlagConfigurator', `duplicate entry of ${key}`);
              }
            }
            acc.push(...items);
            return acc;
          }, [] as IFeatureFlag[]),
        ),
      ),
    );

    /**
     * Observable that emits the merged configuration of initial feature flags and plugins.
     */
    const config$: Observable<FeatureFlagConfig> = forkJoin({
      initial: initial$,
      plugins: plugins$,
    }).pipe(map((resolve) => ({ ...config, ...resolve })));

    return config$;
  }
}

export default FeatureFlagConfigurator;
