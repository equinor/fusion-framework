import { useCallback, useMemo } from 'react';

import { EMPTY } from 'rxjs';

import { type IFeatureFlagProvider } from '@equinor/fusion-framework-module-feature-flag';

import { useObservableState } from '@equinor/fusion-observable/react';

import { findFeature } from '@equinor/fusion-framework-module-feature-flag/selectors';

/**
 * Custom hook for accessing a feature flag value and toggling it.
 *
 * @template T - The type of the feature flag value.
 * @param {IFeatureFlagProvider} provider - The feature flag provider.
 * @param {string} key - The key of the feature flag.
 */
export const useFeature = <T = unknown>(provider: IFeatureFlagProvider, key: string) => {
    const feature$ = useMemo(() => provider.features$.pipe(findFeature<T>(key)), [provider, key]);
    const { value: feature, error } = useObservableState(feature$ ?? EMPTY);
    const toggle = useCallback(
        (enabled: boolean) => {
            provider.toggleFeature({ key, enabled });
        },
        [provider, key],
    );
    return { feature, toggle, error };
};

export default useFeature;
