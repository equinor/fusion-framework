import type { FeatureFlagModule } from '@equinor/fusion-framework-module-feature-flag';
import { useCurrentAppModule } from '../app';
import { useFeatures, type UseFeaturesResult } from './useFeatures';

/**
 * React hook that returns feature flags registered on the current application.
 *
 * @returns A {@link UseFeaturesResult} containing:
 *   - `features` — Array of feature flags for the current app.
 *   - `toggleFeature(key, enable?)` — Toggles a feature flag on or off.
 *   - `error` — Any error from the feature-flag or app-module streams.
 *
 * @example
 * ```ts
 * const { features, toggleFeature } = useCurrentAppFeatures();
 * toggleFeature('dark-mode', true);
 * ```
 */
export const useCurrentAppFeatures = (): UseFeaturesResult => {
  const { module, error: moduleError } = useCurrentAppModule<FeatureFlagModule>('featureFlag');

  const { features, toggleFeature, error } = useFeatures(module);

  return {
    features,
    toggleFeature,
    error: error ?? moduleError,
  };
};
