import { useModule } from '@equinor/fusion-framework-react-module';
import { useObservableState } from '@equinor/fusion-observable/react';
import { FeatureFlagModule } from '@equinor/fusion-framework-module-feature-flag';
import { useCallback } from 'react';
import { IFeatureFlag } from '@equinor/fusion-framework-module-feature-flag/src/FeatureFlag';

export const useFeatureFlag = (name: string) => {
    const provider = useModule<FeatureFlagModule>('featureFlag');
    const { value: featureFlag } = useObservableState(provider.getFeature(name));

    const setEnabled = useCallback(
        (enabled: boolean) => {
            if (featureFlag) {
                provider.toggleFeature({
                    key: (featureFlag as IFeatureFlag).key,
                    enabled,
                });
            }
            // @TODO: throw error?
        },
        [provider, featureFlag],
    );

    return {
        flag: featureFlag,
        setEnabled,
    };
};

export default useFeatureFlag;
