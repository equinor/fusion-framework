import { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

import type { AssertFeatureFlag } from './types';

import type { FeatureFlagPlugin, FeatureFlagPluginConfigCallback } from '../../types';
import { FeatureFlag, type FeatureFlagObj } from '../../FeatureFlag';
import plugin from './plugin';

interface createInitialFeatureFlags {
    (features: FeatureFlag[]): FeatureFlag[];
    (features: Array<string | FeatureFlag>, options?: { defaultEnabled?: boolean }): FeatureFlag[];
}

function createInitialFeatureFlags(
    features: Array<string | FeatureFlag>,
    options?: { defaultEnabled?: boolean },
): FeatureFlag[] {
    return features
        .map(
            (feature): FeatureFlagObj =>
                typeof feature === 'object'
                    ? feature
                    : { name: feature, enabled: options?.defaultEnabled },
        )
        .map(FeatureFlag.Parse);
}

export const enablePlugin =
    (
        features: Array<string | FeatureFlag>,
        options: { onlyProvided?: boolean; isFeatureEnabled?: AssertFeatureFlag },
    ): FeatureFlagPluginConfigCallback =>
    async (args): Promise<FeatureFlagPlugin> => {
        if (!args.hasModule('navigation')) {
            throw Error('missing navigation module');
        }
        const navigation: INavigationProvider = await args.requireInstance('navigation');

        const initial = createInitialFeatureFlags(features);

        return plugin({ navigation, initial }, options);
    };

export default enablePlugin;
