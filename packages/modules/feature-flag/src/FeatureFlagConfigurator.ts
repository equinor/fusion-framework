import { Observable, forkJoin, from } from 'rxjs';
import { concatMap, filter, last, map, mergeMap, reduce, share } from 'rxjs/operators';
import { BaseConfigBuilder, ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import type {
    FeatureFlagConfig,
    FeatureFlagPlugin,
    FeatureFlagPluginConfigCallback,
} from './types.js';
import { IFeatureFlag } from './FeatureFlag.js';

import { createApiPlugin, createCgiPlugin } from './plugins';

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
    /**
     * Enables the CGI plugin with the specified arguments.
     *
     * @example
     * ```ts
     *  configurator.enableCgi(
     *     'foo-features',
     *     [
     *         {
     *             key: 'foo',
     *             title: 'Foo Feature',
     *             description: 'this is the feature',
     *         }
     *     ]
     *  );
     * ```
     * @param args - The arguments to be passed to the createCgiPlugin function.
     */
    enableCgi(args: Parameters<typeof createCgiPlugin>): void;

    /**
     * Enables the API plugin with the specified arguments.
     * @example
     * ```ts
     * configurator.enableCgi({
     *  // see http-module
     *  httpClientName: 'my-api-client',
     *  path: '/api/features',
     *  selector: myHttpResponseSelector
     * });
     * ```
     * @param args - The arguments to pass to the createApiPlugin function.
     */
    enableApi(args: Parameters<typeof createApiPlugin>): void;
}

export class FeatureFlagConfigurator
    extends BaseConfigBuilder<FeatureFlagConfig>
    implements IFeatureFlagConfigurator
{
    /**
     * Array of feature flag plugin configuration callbacks.
     */
    #plugins: FeatureFlagPluginConfigCallback[] = [];

    public addPlugin(handler: FeatureFlagPluginConfigCallback) {
        this.#plugins.push(handler);
    }

    public enableCgi(args: Parameters<typeof createCgiPlugin>) {
        this.addPlugin(createCgiPlugin(...args));
    }

    public enableApi(args: Parameters<typeof createApiPlugin>) {
        this.addPlugin(createApiPlugin(...args));
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
                from(plugins).pipe(
                    /** only get initial value from plugins that support functionality */
                    filter((x) => !!x.initial),
                    concatMap((x) => x.initial!()),
                    reduce((acc, items) => {
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
