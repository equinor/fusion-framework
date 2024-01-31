import { Observable, forkJoin, from } from 'rxjs';
import { concatMap, filter, last, map, mergeMap, reduce, share } from 'rxjs/operators';
import { BaseConfigBuilder, ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import type {
    FeatureFlagConfig,
    FeatureFlagPlugin,
    FeatureFlagPluginConfigCallback,
} from './types.js';
import { IFeatureFlag } from './FeatureFlag.js';
import { createLocalStoragePlugin, createUrlPlugin } from './plugins/index.js';

// TODO allow configurator to have array
// TODO fix .dot type

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

export class FeatureFlagConfigurator
    extends BaseConfigBuilder<FeatureFlagConfig>
    implements IFeatureFlagConfigurator
{
    /**
     * Array of feature flag plugin configuration callbacks.
     */
    #plugins: FeatureFlagPluginConfigCallback[] = [];
    #flags: IFeatureFlag[] = [];

    public addPlugin(handler: FeatureFlagPluginConfigCallback) {
        this.#plugins.push(handler);
        return this;
    }

    /**
     * this method will be deprecated when api
     */
    public enableLocalFeatures(...args: Parameters<typeof createLocalStoragePlugin>) {
        return this.addPlugin(createLocalStoragePlugin(...args));
    }

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
            reduce((acc, plugin) => {
                acc.push(plugin);
                return acc;
            }, [] as Array<FeatureFlagPlugin>),
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
                                console.warn(
                                    'FeatureFlagConfigurator',
                                    `duplicate entry of ${key}`,
                                );
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
