import { useFramework } from '@equinor/fusion-framework-react';
import { useAppModule } from '../useAppModule';
import { useCallback, useMemo } from 'react';
import { useObservableState } from '@equinor/fusion-observable/react';
import {
    FeatureFlagModule,
    IFeatureFlagProvider,
} from '@equinor/fusion-framework-module-feature-flag';

/**
 * useFeatureflag
 *
 * Hook for getting single featureflag from app.
 *
 * @param key string
 */
export const useFeatureFlag = (key: string) => {
    const provider = useAppModule<FeatureFlagModule>('featureFlag');
    return _useFeatureFlag(provider, key);
};

/**
 * useFrameworkFeatureflag
 *
 * Hook for getting single featureflag from portal.
 *
 * @param key string
 */
export const useFrameworkFeatureFlag = (key: string) => {
    const provider = useFramework<[FeatureFlagModule]>().modules.featureFlag;
    return _useFeatureFlag(provider, key);
};

export const _useFeatureFlag = (provider: IFeatureFlagProvider, key: string) => {
    if (!provider) {
        throw new Error('You must enable the featureFlag module to use this hook');
    }
    const feature$ = useMemo(() => {
        return provider.getFeature(key);
    }, [key, provider]);

    const { value: feature } = useObservableState(feature$);

    const setFeatureEnabled = useCallback(
        (enabled: boolean) => {
            provider.toggleFeature({ key, enabled });
        },
        [provider, key],
    );

    return { feature, setFeatureEnabled };
};

export default useFeatureFlag;
