import { useFramework } from '@equinor/fusion-framework-react';
import { useAppModule } from '../useAppModule';
import { useCallback, useMemo } from 'react';
import { useObservableState } from '@equinor/fusion-observable/react';
import {
    FeatureFlagModule,
    IFeatureFlagProvider,
    IFeatureFlag,
} from '@equinor/fusion-framework-module-feature-flag';
import { EMPTY } from 'rxjs';

/**
 * useFeatureflag
 *
 * Hook for getting single featureflag from app.
 *
 * @param key string
 */
export const useFeatureFlag = (
    key: string,
): {
    feature: IFeatureFlag<unknown> | undefined;
    error: unknown;
    setFeatureEnabled: (key: string, enabled: boolean) => void;
} => {
    const provider = useAppModule<FeatureFlagModule>('featureFlag');
    const { value: feature, error } = useObservableState(_useFeatureFlag(key, provider));
    const setFeatureEnabled = _useSetFeatureflag(provider);
    return { feature, error, setFeatureEnabled };
};

/**
 * useFeatureflags
 *
 * Hook for getting all featureflags from app.
 *
 * @param key string
 */
export const useFeatureFlags = (): {
    features: IFeatureFlag<unknown>[] | undefined;
    error: unknown;
    setFeatureEnabled: (key: string, enabled: boolean) => void;
} => {
    const provider = useAppModule<FeatureFlagModule>('featureFlag');
    const { value: features, error } = useObservableState(_useFeatureFlags(provider));
    const setFeatureEnabled = _useSetFeatureflag(provider);
    return { features, error, setFeatureEnabled };
};

/**
 * useFrameworkFeatureflag
 *
 * Hook for getting single featureflag from portal.
 *
 * @param key string
 */
export const useFrameworkFeatureFlag = (
    key: string,
): {
    feature: IFeatureFlag<unknown> | undefined;
    error: unknown;
    setFeatureEnabled: (key: string, enabled: boolean) => void;
} => {
    const provider = useFramework<[FeatureFlagModule]>().modules.featureFlag;
    const { value: feature, error } = useObservableState(_useFeatureFlag(key, provider));
    const setFeatureEnabled = _useSetFeatureflag(provider);
    return { feature, error, setFeatureEnabled };
};

/**
 * useFrameworkFeatureflags
 *
 * Hook for getting all featureflags from portal.
 *
 * @param key string
 */
export const useFrameworkFeatureFlags = (): {
    features: IFeatureFlag<unknown>[] | undefined;
    error: unknown;
    setFeatureEnabled: (key: string, enabled: boolean) => void;
} => {
    const provider = useFramework<[FeatureFlagModule]>().modules.featureFlag;
    const { value: features, error } = useObservableState(_useFeatureFlags(provider));
    const setFeatureEnabled = _useSetFeatureflag(provider);
    return { features, error, setFeatureEnabled };
};

const _useFeatureFlag = (key: string, provider?: IFeatureFlagProvider) => {
    return useMemo(() => {
        return provider ? provider.getFeature(key) : EMPTY;
    }, [provider, key]);
};

const _useFeatureFlags = (provider?: IFeatureFlagProvider) => {
    return useMemo(() => {
        return provider ? provider.getFeatures((_) => true) : EMPTY;
    }, [provider]);
};

const _useSetFeatureflag = (provider?: IFeatureFlagProvider) => {
    return useCallback(
        (key: string, enabled: boolean) => {
            if (!provider) {
                throw new Error('Missing IFeatureFlagProvider.');
            }
            provider.toggleFeature({ key, enabled });
        },
        [provider],
    );
};
