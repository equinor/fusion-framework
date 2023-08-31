import { FeatureFlagConfig, FeatureFlagPlugin, IFeatureFlagProvider } from '../types';
import { createState } from './state';
import { actions } from './actions';
import { Observable, Subscription } from 'rxjs';
import {
    FeatureSelector,
    FilterFeaturesOptions,
    featureSelector,
    featuresSelector,
} from './selectors';
import { FeatureFlag, FeatureFlagObj } from '../FeatureFlag';

const normalizeFeatureFlags = (flags: FeatureFlagObj[]) =>
    flags.reduce(
        (acc, obj) => {
            const key = FeatureFlag.Identify(obj);
            const existing = acc[key] ?? {};
            return Object.assign(
                acc,
                // TODO maybe a deep merge?
                { [key]: FeatureFlag.Parse({ ...existing, ...obj }) },
            );
        },
        {} as Record<string, FeatureFlag>,
    );

export class FeatureFlagProvider implements IFeatureFlagProvider {
    #subscription = new Subscription();
    #state: ReturnType<typeof createState>;
    // #features: Record<string, FeatureFlag> = {};

    get features(): Record<string, FeatureFlag> {
        return this.#state.value.features;
    }

    get features$(): Observable<Array<FeatureFlag>> {
        return this.#state.pipe(featuresSelector());
    }

    constructor(config: FeatureFlagConfig) {
        this.#state = createState({ features: normalizeFeatureFlags(config.initial) });
        Object.values(config.plugins).forEach((plugin) => this.addPlugin(plugin));
    }

    public addPlugin(plugin: FeatureFlagPlugin) {
        this.#subscription.add(plugin.initialize({ provider: this }));
    }

    toggleFeature(feature: { key: string; enabled: boolean }): void {
        this.#state.next(actions.setFeatureEnabled(feature));
    }

    toggleFeatures(features: { key: string; enabled: boolean }[]): void {
        this.#state.next(actions.setFeaturesEnabled(features));
    }

    setFeature(feature: FeatureFlagObj) {
        this.#state.next(actions.setFeature(FeatureFlag.Parse(feature)));
    }

    getFeatures(
        selector: FeatureSelector,
        options?: FilterFeaturesOptions,
    ): Observable<Array<FeatureFlag>> {
        return this.#state.pipe(featureSelector(selector, options));
    }

    dispose() {
        this.#subscription.unsubscribe();
    }
}
