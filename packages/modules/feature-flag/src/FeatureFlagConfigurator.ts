import { Observable, forkJoin, from } from 'rxjs';
import { concatMap, filter, last, map, mergeMap, reduce, share } from 'rxjs/operators';
import { BaseConfigBuilder, ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import type {
    FeatureFlagConfig,
    FeatureFlagPlugin,
    FeatureFlagPluginConfigCallback,
} from './types.js';

// TODO allow configurator to have array
// TODO fix .dot type

export interface IFeatureFlagConfigurator extends BaseConfigBuilder<FeatureFlagConfig> {
    addPlugin: (handler: FeatureFlagPluginConfigCallback) => void;
}

export class FeatureFlagConfigurator extends BaseConfigBuilder<FeatureFlagConfig> {
    // implements IFeatureFlagConfigurator
    #plugins: FeatureFlagPluginConfigCallback[] = [];

    public addPlugin(handler: FeatureFlagPluginConfigCallback) {
        this.#plugins.push(handler);
    }

    protected _processConfig(
        config: Partial<FeatureFlagConfig>,
        init: ConfigBuilderCallbackArgs,
    ): Observable<FeatureFlagConfig> {
        const plugins$ = from(this.#plugins).pipe(
            /** initialize plugins */
            mergeMap((plugin) => plugin(init)),
            reduce((acc, plugin) => {
                acc.push(plugin);
                return acc;
            }, [] as Array<FeatureFlagPlugin>),
            last(),
            share(),
        );

        return forkJoin({
            initial: plugins$.pipe(
                concatMap((plugins) =>
                    from(plugins).pipe(
                        /** only get initial value from plugins that support functionality */
                        filter((x) => !!x.initial),
                        concatMap((x) => x.initial!()),
                    ),
                ),
            ),
            plugins: plugins$,
        }).pipe(map((resolve) => ({ ...config, ...resolve })));
    }
}

export default FeatureFlagConfigurator;
