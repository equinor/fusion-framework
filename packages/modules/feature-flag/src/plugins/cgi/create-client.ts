import { IFeatureFlag } from '../../FeatureFlag';
import createStorage, { IStorageAdapter } from '../../utils/storage';
import { ICgiPluginClient } from './types';
import { name as namespace } from '../../FeatureFlagModule';

export type PluginOptions = {
    storage?: IStorageAdapter<IFeatureFlag>;
};

/**
 * Produces an cgi plugin client.
 *
 * @example
 * ```ts
 * const navigation: INavigationProvider = await configArgs.requireInstance('navigation');
 * const cgiClient = createCgiPluginClient({ name });
 * return new CgiPlugin({ cgiClient, features, navigation });
 * ```
 */
export const createCgiPluginClient = (
    args: {
        name: string;
    },
    options?: PluginOptions,
): ICgiPluginClient => {
    const { name } = args;

    const { storage: storageAdapter = createStorage<IFeatureFlag>(namespace, name, 'local') } =
        options ?? {};

    return {
        getFeatureFlags: async () => {
            return storageAdapter.getItems();
        },
        storeFeatureFlags: (flags) => {
            flags.forEach((flag) => storageAdapter.setItem(flag.key, flag));
        },
    };
};
