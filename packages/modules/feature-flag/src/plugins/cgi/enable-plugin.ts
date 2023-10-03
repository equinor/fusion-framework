import { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

import type { FeatureFlagPlugin, FeatureFlagPluginConfigCallback } from '../../types';
import { FeatureFlag, type IFeatureFlag } from '../../FeatureFlag';
import { plugin, type PluginOptions } from './plugin';

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
            (feature): IFeatureFlag =>
                typeof feature === 'object'
                    ? feature
                    : { key: feature, enabled: options?.defaultEnabled },
        )
        .map(FeatureFlag.Parse);
}

export const enablePlugin =
    (
        name: string,
        features: Array<string | FeatureFlag>,
        options?: PluginOptions,
    ): FeatureFlagPluginConfigCallback =>
    async (args): Promise<FeatureFlagPlugin> => {
        if (!args.hasModule('navigation')) {
            throw Error('missing navigation module');
        }
        const navigation: INavigationProvider = await args.requireInstance('navigation');

        const initial = createInitialFeatureFlags(features);

        return plugin({ name, navigation, initial }, options);
    };

export default enablePlugin;
