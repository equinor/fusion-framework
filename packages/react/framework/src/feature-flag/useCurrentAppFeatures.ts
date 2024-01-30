import { type FeatureFlagModule } from '@equinor/fusion-framework-module-feature-flag';
import { useCurrentAppModule } from '../app';
import { useFeatures, type UseFeaturesResult } from './useFeatures';

/**
 * Custom hook that returns the current app features and provides a function to toggle a feature.
 * @returns An object containing the current app features, a function to toggle a feature, and any error that occurred.
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
