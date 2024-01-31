import { type FeatureFlagModule } from '@equinor/fusion-framework-module-feature-flag';

import { useFrameworkModule } from '../useFrameworkModule';
import { useFeature } from './useFeature';

/**
 * Custom hook that allows accessing a framework feature based on a given feature flag key.
 *
 * @template T - The type of the feature.
 * @param {string} key - The feature flag key.
 * @returns {ReturnType<typeof useFeature<T>>} - The result of the feature hook.
 * @throws {Error} - If feature flagging is not enabled in the framework.
 */
export const useFrameworkFeature = <T>(key: string): ReturnType<typeof useFeature<T>> => {
    const provider = useFrameworkModule<FeatureFlagModule>('featureFlag');
    if (!provider) {
        throw Error('Feature flagging is not enabled in the framework');
    }
    return useFeature(provider, key);
};

export default useFrameworkFeature;
