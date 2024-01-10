import { useCallback, useMemo } from 'react';
import { useObservableState } from '@equinor/fusion-observable/react';
import {
    FeatureFlagModule,
    IFeatureFlagProvider,
    IFeatureFlag,
} from '@equinor/fusion-framework-module-feature-flag';

import { useCurrentAppModules } from '../app/useCurrentAppModules';
import { EMPTY, map } from 'rxjs';
import { useFramework } from '../useFramework';

/**
 * useCurrentAppFeatureFlag.
 *
 * Hook for getting current app's featureFlag from framework/portal.
 *
 * if in an app setting use hook "useFeatureFlag" from \@equinor/fusion-framework-react-app/feature-flag package.
 */
export const useCurrentAppFeatureFlag = (
    key: string,
): {
    feature: IFeatureFlag<unknown> | undefined;
    error: unknown;
    setFeatureEnabled: (key: string, enabled: boolean) => void;
} => {
    const provider$ = useCurrentAppModules<[FeatureFlagModule]>().modules$.pipe(
        map((val) => val?.featureFlag),
    );
    const { value: provider } = useObservableState(provider$);
    const { value: feature, error } = useObservableState(_useFeatureFlag(key, provider));
    const setFeatureEnabled = _useSetFeatureflag(provider);
    return { feature, error, setFeatureEnabled };
};

/**
 * useCurrentAppFeatureFlags.
 *
 * Hook for getting current app's featureFlags from framework/portal.
 *
 * if in an app setting use hook "useFeatureFlags" from \@equinor/fusion-framework-react-app/feature-flag package.
 */
export const useCurrentAppFeatureFlags = (): {
    features: IFeatureFlag<unknown>[] | undefined;
    error: unknown;
    setFeatureEnabled: (key: string, enabled: boolean) => void;
} => {
    const provider$ = useCurrentAppModules<[FeatureFlagModule]>().modules$.pipe(
        map((val) => val?.featureFlag),
    );
    const { value: provider } = useObservableState(provider$);
    const { value: features, error } = useObservableState(_useFeatureFlags(provider));
    const setFeatureEnabled = _useSetFeatureflag(provider);
    return { features, error, setFeatureEnabled };
};

/**
 * useFrameworkFeatureFlag.
 *
 * Hook for getting single featureFlag from framework/portal.
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
 * useFrameworkFeatureFlags.
 *
 * Hook for getting featureFlags from framework/portal.
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

const _useFeatureFlag = ( key: string, provider?: IFeatureFlagProvider) => {
    return useMemo(() => {
        return provider ? provider.getFeature(key) : EMPTY;
    }, [provider, key]);
};

const _useFeatureFlags = (provider?: IFeatureFlagProvider ) => {
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
