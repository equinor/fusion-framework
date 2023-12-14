import { Observable, Subscription, distinctUntilChanged } from 'rxjs';

import { createState } from './FeatureFlagProvider.state';
import { actions } from './FeatureFlagProvider.actions';
import {
    FeatureSelector,
    featureSelector,
    featuresSelector,
    findFeature,
} from './FeatureFlagProvider.selectors';

import type { FeatureFlagConfig } from './types';
import { IFeatureFlag } from './FeatureFlag';
import { normalizeFlags } from './utils/normalize-flags';

export type CompareFeature = (a: IFeatureFlag | undefined, b: IFeatureFlag | undefined) => boolean;

export interface IFeatureFlagProvider {
    readonly features$: Observable<Array<IFeatureFlag>>;
    toggleFeature(feature: { key: string; enabled: boolean }): void;
    toggleFeatures(features: Array<{ key: string; enabled: boolean }>): void;
    setFeatures(features: Array<IFeatureFlag>): void;
    getFeature(
        selector: FeatureSelector,
        compare?: CompareFeature,
    ): Observable<IFeatureFlag | undefined>;
    getFeatures(selector: FeatureSelector): Observable<Array<IFeatureFlag>>;
}

export class FeatureFlagProvider implements IFeatureFlagProvider {
    #subscription = new Subscription();
    #state: ReturnType<typeof createState>;

    get features(): Record<string, IFeatureFlag> {
        return this.#state.value.features;
    }

    get features$(): Observable<Array<IFeatureFlag>> {
        return this.#state.pipe(featuresSelector());
    }

    constructor(config: FeatureFlagConfig) {
        this.#state = createState({
            features: normalizeFlags(config.initial),
        });
        Object.values(config.plugins).forEach((plugin) => {
            const { onFeatureToggle } = plugin;
            if (onFeatureToggle) {
                this.#subscription.add(
                    this.#state.addEffect('toggle_features_enabled', (action) =>
                        onFeatureToggle.bind(plugin)({ flags: action.payload }),
                    ),
                );
            }
            if (plugin.connect) {
                this.#subscription.add(plugin.connect({ provider: this }));
            }
        });
    }

    public setFeatures(features: Array<IFeatureFlag>): void {
        this.#state.next(actions.setFeatures(features));
    }

    public toggleFeature(value: { key: string; enabled: boolean }): void {
        this.toggleFeatures([value]);
    }

    public toggleFeatures(values: Array<{ key: string; enabled: boolean }>): void {
        const { features } = this.#state.value;
        const toggleValues = values.filter((value) => {
            const flag = features[value.key];
            if (!flag) {
                console.warn(`toggling flag [${value.key}] which is not registered`);
            } else if (flag.readonly) {
                console.warn(`skipped toggling flag [${flag.key}], since readonly!`);
                return false;
            }
            return true;
        });
        if (toggleValues.length) {
            this.#state.next(actions.toggleFeatures(toggleValues));
        }
    }

    public getFeature(
        selector: FeatureSelector,
        compare?: CompareFeature,
    ): Observable<IFeatureFlag | undefined> {
        compare ??= (a, b) => a === b;
        return this.features$.pipe(
            //
            findFeature(selector),
            distinctUntilChanged(compare),
        );
    }

    public getFeatures(selector: FeatureSelector): Observable<Array<IFeatureFlag>> {
        return this.#state.pipe(featureSelector(selector));
    }

    dispose() {
        this.#subscription.unsubscribe();
    }
}
