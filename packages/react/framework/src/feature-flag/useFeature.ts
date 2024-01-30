import { useCallback, useMemo } from 'react';

import { EMPTY } from 'rxjs';

import {
    type IFeatureFlag,
    type IFeatureFlagProvider,
} from '@equinor/fusion-framework-module-feature-flag';

import { useObservableState } from '@equinor/fusion-observable/react';

import { findFeature } from '@equinor/fusion-framework-module-feature-flag/selectors';

export interface UseFeatureResult<T> {
    feature?: IFeatureFlag<T>;
    error?: unknown;
    /**
     * @param enable - Optional provide new enabled state of the feature flag. _Defaults to inversion of current feature flag state_
     */
    toggleFeature: (enable?: boolean) => void;
}

/**
 * Custom hook that retrieves a feature flag from a feature flag provider.
 *
 * @template T - The type of the feature flag value.
 * @param {IFeatureFlagProvider} provider - The feature flag provider.
 * @param {string} key - The key of the feature flag.
 * @returns {UseFeatureResult<T>} - An object containing the feature flag value, a function to toggle the feature flag, and any error that occurred.
 */
export const useFeature = <T = unknown>(
    provider: IFeatureFlagProvider,
    key: string,
): UseFeatureResult<T> => {
    const feature$ = useMemo(() => provider.features$.pipe(findFeature<T>(key)), [provider, key]);
    const { value: feature, error } = useObservableState(feature$ ?? EMPTY);
    const toggleFeature = useCallback(
        (enable?: boolean) => {
            const enabled = enable === undefined ? !provider.getFeature(key)?.enabled : enable;
            provider.toggleFeature({ key, enabled });
        },
        [provider, key],
    );
    return { feature, toggleFeature, error };
};

export default useFeature;
