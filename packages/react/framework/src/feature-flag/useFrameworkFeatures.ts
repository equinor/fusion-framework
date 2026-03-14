import type { FeatureFlagModule } from '@equinor/fusion-framework-module-feature-flag';

import { useFrameworkModule } from '../useFrameworkModule';
import { useFeatures } from './useFeatures';

/**
 * React hook that returns all feature flags from the **framework-level**
 * feature-flag provider.
 *
 * @returns A {@link UseFeaturesResult} containing all framework feature flags,
 *   a toggle helper, and any error.
 * @throws {Error} If the `FeatureFlagModule` is not enabled in the framework.
 *
 * @example
 * ```ts
 * const { features, toggleFeature } = useFrameworkFeatures();
 * ```
 */
export const useFrameworkFeatures = (): ReturnType<typeof useFeatures> => {
  const provider = useFrameworkModule<FeatureFlagModule>('featureFlag');
  if (!provider) {
    throw Error('Feature flagging is not enabled in the framework');
  }
  return useFeatures(provider);
};

export default useFrameworkFeatures;
