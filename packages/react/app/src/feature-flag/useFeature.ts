import { useCallback, useMemo } from 'react';

import { EMPTY, combineLatest, map } from 'rxjs';

import { useFrameworkModule } from '@equinor/fusion-framework-react';
import { useObservableState } from '@equinor/fusion-observable/react';
import type {
  FeatureFlagModule,
  IFeatureFlag,
} from '@equinor/fusion-framework-module-feature-flag';
import { findFeature } from '@equinor/fusion-framework-module-feature-flag/selectors';

import { useAppModule } from '../useAppModule';

/**
 * React hook for reading and toggling a single feature flag.
 *
 * Merges feature flags from both the framework and the application scope,
 * so framework-level flags are visible alongside app-specific ones.
 *
 * @template T - The type of the feature flag's value payload.
 * @param key - The unique key identifying the feature flag.
 * @returns An object with:
 *   - `feature` – the resolved {@link IFeatureFlag}, or `undefined` if not found.
 *   - `toggleFeature` – callback to toggle the flag; pass `true`/`false` to
 *     set explicitly, or omit to invert the current state.
 *   - `error` – any error from the feature-flag observable.
 *
 * @example
 * ```tsx
 * const { feature, toggleFeature } = useFeature('dark-mode');
 * return (
 *   <Switch checked={feature?.enabled} onChange={() => toggleFeature()} />
 * );
 * ```
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
