import { IFeatureFlag } from '../../FeatureFlag';
import { FeatureFlagPlugin, FeatureFlagPluginConfigCallback } from '../../types';
import { createStorage, type StorageType } from '../../utils/storage';

/**
 * Creates a plugin configuration callback for the local storage feature flag plugin.
 * @param features - An array of feature flags.
 * @returns A function that returns the plugin configuration object.
 */
export const createLocalStoragePlugin = (
    features: Array<IFeatureFlag>,
    options?: {
        name?: string;
        type?: StorageType;
    },
): FeatureFlagPluginConfigCallback => {
    return async () => {
        const { name, type = 'local' } = options ?? {};
        const namespace = ['FEATURES', name].filter((x) => !!x).join('_');
        const storage = createStorage(namespace, type);
        return {
            connect: ({ provider }) => {
                return provider.onFeatureToggle(({ features }) => {
                    features.map((feature) => storage.setItem(feature.key, feature));
                });
            },
            initial: async () => {
                const storedItems = await storage.getItems();
                return features.map((feature) => {
                    const storedItem = storedItems[feature.key] as IFeatureFlag | undefined;
                    return {
                        ...feature,
                        enabled: storedItem ? storedItem.enabled : feature.enabled,
                    };
                }) as IFeatureFlag[];
            },
        } satisfies FeatureFlagPlugin;
    };
};

export default createLocalStoragePlugin;
