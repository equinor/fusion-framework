import { useCallback, useMemo } from 'react';

import { EMPTY, combineLatest, map } from 'rxjs';

import { useFrameworkModule } from '@equinor/fusion-framework-react';
import { useObservableState } from '@equinor/fusion-observable/react';
import {
    type FeatureFlagModule,
    type IFeatureFlag,
} from '@equinor/fusion-framework-module-feature-flag';
import { findFeature } from '@equinor/fusion-framework-module-feature-flag/selectors';

import { useAppModule } from '../useAppModule';

/**
 * Custom hook for accessing and manipulating feature flags.
 * @template T - The type of the feature flag value.
 * @param key - The key of the feature flag.
 * @returns An object containing the feature flag, toggle function, and error (if any).
 */
export const useFeature = <T = unknown>(
    key: string,
): {
    feature?: IFeatureFlag<T>;
    toggleFeature: (enabled?: boolean) => void;
    error?: unknown;
} => {
    const appProvider = useAppModule<FeatureFlagModule>('featureFlag');
    const frameworkProvider = useFrameworkModule<FeatureFlagModule>('featureFlag');

    /** get all available feature flags */
    const features$ = useMemo(() => {
        /** the framework does not have the feature flag module */
        if (!frameworkProvider) {
            return appProvider.features$;
        }
        /** merge feature flags from framework and application */
        return combineLatest({
            framework: frameworkProvider.features$,
            app: appProvider.features$,
        }).pipe(
            map(({ framework, app }) => {
                return { ...framework, ...app };
            }),
        );
    }, [appProvider, frameworkProvider]);

    /** find feature flag by the provided key */
    const feature$ = useMemo(() => features$.pipe(findFeature<T>(key)), [features$, key]);

    const { value: feature, error } = useObservableState(feature$ ?? EMPTY);

    const toggleFeature = useCallback(
        (enable?: boolean) => {
            /** if no value provided, invert the current value */
            const enabled = enable === undefined ? !appProvider.getFeature(key)?.enabled : enable;
            appProvider.toggleFeature({
                key,
                enabled,
            });
        },
        [appProvider, key],
    );

    return { feature, toggleFeature, error };
};
