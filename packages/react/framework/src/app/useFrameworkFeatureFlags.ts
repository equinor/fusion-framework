import { useCallback, useMemo } from 'react';
import { useObservableState } from '@equinor/fusion-observable/react';
import { FeatureFlagModule } from '@equinor/fusion-framework-module-feature-flag';

import { useFramework } from '../useFramework';
import { EMPTY } from 'rxjs';

/**
 * useFrameworkFeatureFlags.
 *
 * Hook for getting framework/portal featureFlags.
 */
export const useFrameworkFeatureFlags = () => {
    const provider = useFramework<[FeatureFlagModule]>().modules.featureFlag;

    const features$ = useMemo(() => {
        return provider?.getFeatures((_) => true) || EMPTY;
    }, [provider]);

    const { value: features } = useObservableState(features$);

    const setFeatureEnabled = useCallback(
        (key: string, enabled: boolean) => {
            provider ? provider.toggleFeature({ key, enabled }) : (_k: string, _e: boolean) => null;
        },
        [provider],
    );

    return { features, setFeatureEnabled };
};
