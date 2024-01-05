import { useFramework } from '@equinor/fusion-framework-react';
import { useAppModule } from '../useAppModule';
import { useCallback, useMemo } from 'react';
import { useObservableState } from '@equinor/fusion-observable/react';
import {
    FeatureFlagModule,
    IFeatureFlagProvider,
} from '@equinor/fusion-framework-module-feature-flag';

/**
 * useFeatureFlags
 *
 * Hook for getting current apps featureFlags as array.
 */
export const useFeatureFlags = () => {
    const provider = useAppModule<FeatureFlagModule>('featureFlag');
    return _useFeatureFlags(provider);
};

/**
 * useFrameworkFeatureFlags
 *
 * Hook for getting portals featureFlags as array.
 */
export const useFrameworkFeatureFlags = () => {
    const provider = useFramework<[FeatureFlagModule]>().modules.featureFlag;
    return _useFeatureFlags(provider);
};

const _useFeatureFlags = (provider: IFeatureFlagProvider) => {
    if (!provider) {
        throw new Error('You must enable the featureFlag module to use this hook');
    }
    const feature$ = useMemo(() => {
        return provider.getFeatures((_) => true);
    }, [provider]);

    const { value: features } = useObservableState(feature$);

    const setFeatureEnabled = useCallback(
        (key: string, enabled: boolean) => {
            provider.toggleFeature({ key, enabled });
        },
        [provider],
    );

    return { features, setFeatureEnabled };
};

export default useFeatureFlags;
