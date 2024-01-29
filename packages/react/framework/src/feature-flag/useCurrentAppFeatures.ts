import {
    type IFeatureFlag,
    type FeatureFlagModule,
} from '@equinor/fusion-framework-module-feature-flag';
import { useCurrentAppModule } from '../app';
import { useFeatures } from './useFeatures';

/**
 * Custom hook that provides the current application features and related functionality.
 * @returns An object containing the current application features, an error object, and a function to set the enabled state of a feature.
 */
export const useCurrentAppFeatures = (): {
    features: IFeatureFlag<unknown>[] | undefined;
    error: unknown;
    setEnabled: (key: string, enabled: boolean) => void;
} => {
    const { module, error: moduleError } = useCurrentAppModule<FeatureFlagModule>('featureFlag');

    const { features, setEnabled, error } = useFeatures(module);

    return {
        features,
        setEnabled,
        error: error ?? moduleError,
    };
};
