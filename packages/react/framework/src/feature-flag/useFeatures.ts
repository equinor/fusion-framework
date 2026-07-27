import { useCallback, useMemo } from 'react';

import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import type {
  IFeatureFlagProvider,
  IFeatureFlag,
} from '@equinor/fusion-framework-module-feature-flag';

import type { FeatureSelectorFn } from '@equinor/fusion-framework-module-feature-flag/selectors';

import { useObservableState } from '@equinor/fusion-observable/react';

/**
 * Return type of the {@link useFeatures} hook.
 */
export interface UseFeaturesResult {
  /** Array of all resolved feature flags. */
  features: IFeatureFlag[];
  /** Any error emitted by the feature-flag observable. */
  error: unknown;
  /**
   * Toggles a feature flag by key.
   *
   * @param key - The key of the feature flag.
   * @param enable - Explicit enabled state. When omitted the current state
   *   is inverted.
   */
  toggleFeature: (key: string, enable?: boolean) => void;
}

/**
 * React hook that returns all feature flags from a provider, with optional
 * filtering.
 *
 * @param provider - The feature-flag provider instance, or `null`/`undefined`
 *   when not yet available.
 * @param selector - Optional predicate to filter the feature flags.
 * @returns A {@link UseFeaturesResult} with the flags, a toggle helper,
 *   and any error.
 * @throws {Error} If `toggleFeature` is called when the provider is missing.
 *
 * @example
 * ```ts
 * const { features, toggleFeature } = useFeatures(provider);
 * toggleFeature('beta', true);
 * ```
 */
export const useFeatures = (
  provider?: IFeatureFlagProvider | null,
  selector?: FeatureSelectorFn,
): UseFeaturesResult => {
  /**
   * Custom hook that provides access to the feature flags and their values.
   *
   * @returns An object containing the features and any error that occurred while retrieving them.
   */
  const { value: features, error } = useObservableState(
    useMemo(() => {
      // Only compute the feature list when a provider is available; otherwise there's nothing to observe
      if (provider) {
        // Map the feature dictionary to a list, optionally narrowed by the caller-provided selector
        return provider?.features$.pipe(
          map((x) => {
            const values = Object.values(x);
            // Return everything when no selector is provided
            if (!selector) {
              return values;
            }
            // Apply the caller-provided selector to narrow down the feature list
            const filtered = values.filter(selector);
            return filtered;
          }),
        );
      }
      return of([]);
    }, [provider, selector]),
    { initial: Object.values(provider?.features ?? {}) },
  );
  /**
   * Sets the enabled state of a feature flag.
   *
   * @param key - The key of the feature flag.
   * @param enable - The new enabled state of the feature flag.
   * @throws Error if IFeatureFlagProvider is missing.
   */
  const toggleFeature = useCallback(
    (key: string, enable?: boolean) => {
      // Cannot toggle a feature without a provider to persist the change
      if (!provider) {
        throw new Error('Missing IFeatureFlagProvider.');
      }
      const enabled = enable === undefined ? !provider.getFeature(key)?.enabled : enable;

      provider.toggleFeature({ key, enabled });
    },
    [provider],
  );
  return { features, error, toggleFeature };
};

export default useFeatures;
