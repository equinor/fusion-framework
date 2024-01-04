import { useCallback, useMemo } from 'react';
import { useObservableState } from '@equinor/fusion-observable/react';
import { FeatureFlagModule } from '@equinor/fusion-framework-module-feature-flag';

import { useCurrentAppModules } from './useCurrentAppModules';
import { EMPTY, map } from 'rxjs';

export const useCurrentAppFeatureFlags = () => {
    const provider$ = useCurrentAppModules<[FeatureFlagModule]>().modules$.pipe(
        map((val) => val?.featureFlag),
    );

    const { value: provider } = useObservableState(provider$);

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

    console.log('VALUE', features);
    return { features, setFeatureEnabled };
};
