import type { FeatureFlagModule } from '@equinor/fusion-framework-module-feature-flag';

import { useFrameworkModule } from '../useFrameworkModule';
import { useFeature } from './useFeature';

/**
 * React hook that retrieves a single feature flag from the **framework-level**
 * feature-flag provider.
 *
 * @template T - Value type carried by the feature flag.
 * @param key - Unique key identifying the feature flag.
 * @returns A {@link UseFeatureResult} with the flag value, toggle helper,
 *   and any error.
 * @throws {Error} If the `FeatureFlagModule` is not enabled in the framework.
 *
 * @example
 * ```ts
 * const { feature, toggleFeature } = useFrameworkFeature('experimental-ui');
 * ```
 */
export const useFrameworkFeature = <T>(key: string): ReturnType<typeof useFeature<T>> => {
  const provider = useFrameworkModule<FeatureFlagModule>('featureFlag');
  if (!provider) {
    throw Error('Feature flagging is not enabled in the framework');
  }
  return useFeature(provider, key);
};

export default useFrameworkFeature;
