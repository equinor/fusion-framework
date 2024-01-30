import { useCallback, useMemo } from 'react';

import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    type IFeatureFlagProvider,
    type IFeatureFlag,
} from '@equinor/fusion-framework-module-feature-flag';

import { type FeatureSelectorFn } from '@equinor/fusion-framework-module-feature-flag/selectors';

import { useObservableState } from '@equinor/fusion-observable/react';

export interface UseFeaturesResult {
    features: IFeatureFlag[];
    error: unknown;
    /**
     * @param key - The key of the feature flag.
     * @param enable - Optional provide new enabled state of the feature flag. _Defaults to inversion of current feature flag state_
     */
    toggleFeature: (key: string, enable?: boolean) => void;
}

/**
 * Custom hook that provides access to the feature flags and their values.
 *
 * @param provider - The feature flag provider.
 * @param selector - Optional function to filter the feature flags.
 * @returns An object containing the features, any error that occurred while retrieving them, and a function to set the enabled state of a feature flag.
 * @throws Error if the feature flag provider is missing.
 */
export const useFeatures = (
    provider?: IFeatureFlagProvider | null,
    selector?: FeatureSelectorFn,
): UseFeaturesResult => {
    /**
     * Custom hook that provides access to the feature flags and their values.
     *
     * @returns An object containing the features and any error that occurred while retrieving them.
     */
    const { value: features, error } = useObservableState(
        useMemo(() => {
            if (provider) {
                return provider?.features$.pipe(
                    map((x) => {
                        const values = Object.values(x);
                        return selector ? values.filter(selector) : values;
                    }),
                );
            }
            return of([]);
        }, [provider, selector]),
        { initial: Object.values(provider?.features ?? {}) },
    );
    /**
     * Sets the enabled state of a feature flag.
     *
     * @param key - The key of the feature flag.
     * @param enable - The new enabled state of the feature flag.
     * @throws Error if IFeatureFlagProvider is missing.
     */
    const toggleFeature = useCallback(
        (key: string, enable?: boolean) => {
            if (!provider) {
                throw new Error('Missing IFeatureFlagProvider.');
            }
            const enabled = enable === undefined ? !provider.getFeature(key)?.enabled : enable;

            provider.toggleFeature({ key, enabled });
        },
        [provider],
    );
    return { features, error, toggleFeature };
};

export default useFeatures;
