import { INavigationProvider } from '@equinor/fusion-framework-module-navigation';
import { FeatureFlagPluginConfigCallback } from '../../types';
import type { CgiFeatureFlagPlugin } from './types';
import CgiPlugin from './plugin';
import { createCgiPluginClient } from './create-client';
import { IFeatureFlag } from '../../FeatureFlag';

export const createCgiPlugin = (
    name: string,
    features: Array<IFeatureFlag | string>,
): FeatureFlagPluginConfigCallback<CgiFeatureFlagPlugin> => {
    return async (configArgs) => {
        if (!configArgs.hasModule('navigation')) {
            throw Error('missing navigation module');
        }

        const navigation: INavigationProvider = await configArgs.requireInstance('navigation');
        const cgiClient = createCgiPluginClient({ name });

        return new CgiPlugin({ cgiClient, features, navigation });
    };
};

export default createCgiPlugin;
