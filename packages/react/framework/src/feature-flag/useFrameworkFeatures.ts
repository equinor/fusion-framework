import { type FeatureFlagModule } from '@equinor/fusion-framework-module-feature-flag';

import { useFrameworkModule } from '../useFrameworkModule';
import { useFeatures } from './useFeatures';

/**
 * Custom hook that provides access to framework-specific feature flags.
 * It returns the result of the `useFeatures` hook from the `featureFlag` module.
 * @returns The result of the `useFeatures` hook.
 * @throws Error if feature flagging is not enabled in the framework.
 */
export const useFrameworkFeatures = (): ReturnType<typeof useFeatures> => {
    const provider = useFrameworkModule<FeatureFlagModule>('featureFlag');
    if (!provider) {
        throw Error('Feature flagging is not enabled by in the framework');
    }
    return useFeatures(provider);
};

export default useFrameworkFeatures;
