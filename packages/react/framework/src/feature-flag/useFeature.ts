import { useCallback, useMemo } from 'react';

import { EMPTY } from 'rxjs';

import type {
  IFeatureFlag,
  IFeatureFlagProvider,
} from '@equinor/fusion-framework-module-feature-flag';

import { useObservableState } from '@equinor/fusion-observable/react';

import { findFeature } from '@equinor/fusion-framework-module-feature-flag/selectors';

/**
 * Return type of the {@link useFeature} hook.
 *
 * @template T - Value type carried by the feature flag.
 */
export interface UseFeatureResult<T> {
  /** The resolved feature flag, or `undefined` while loading. */
  feature?: IFeatureFlag<T>;
  /** Any error emitted by the feature-flag observable. */
  error?: unknown;
  /**
   * Toggles the feature flag.
   *
   * @param enable - Explicit enabled state. When omitted the current state
   *   is inverted.
   */
  toggleFeature: (enable?: boolean) => void;
}

/**
 * React hook that retrieves and manages a single feature flag.
 *
 * @template T - Value type carried by the feature flag.
 * @param provider - The feature-flag provider instance.
 * @param key - Unique key identifying the feature flag.
 * @returns A {@link UseFeatureResult} with the flag value, toggle helper,
 *   and any error.
 *
 * @example
 * ```ts
 * const { feature, toggleFeature } = useFeature(provider, 'dark-mode');
 * console.log(feature?.enabled);
 * ```
 */
export const useFeature = <T = unknown>(
  provider: IFeatureFlagProvider,
  key: string,
): UseFeatureResult<T> => {
  // Narrow the features stream down to just the one matching feature by key.
  const feature$ = useMemo(
    () =>
      provider.features$
        // Keep the observable scoped to the requested feature key.
        .pipe(findFeature<T>(key)),
    [provider, key],
  );
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
