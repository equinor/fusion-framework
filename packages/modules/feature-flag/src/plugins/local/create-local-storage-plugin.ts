import type { IFeatureFlag } from '../../FeatureFlag';
import type { FeatureFlagPlugin, FeatureFlagPluginConfigCallback } from '../../types';
import { createStorage, type StorageType } from '../../utils/storage';

/**
 * Creates a plugin that persists feature-flag toggle state in browser storage
 * (`localStorage` by default) and hydrates initial flag values from the stored
 * snapshot.
 *
 * @param features - Array of default feature flags this plugin manages.
 * @param options - Optional overrides.
 * @param options.name - Additional namespace segment appended to the storage key prefix.
 * @param options.type - Storage backend: `'local'` (default) or `'session'`.
 * @returns A {@link FeatureFlagPluginConfigCallback} ready for registration.
 *
 * @example
 * ```ts
 * import { createLocalStoragePlugin } from '@equinor/fusion-framework-module-feature-flag/plugins';
 *
 * builder.addPlugin(
 *   createLocalStoragePlugin([
 *     { key: 'dark-mode', title: 'Dark mode', enabled: false },
 *   ])
 * );
 * ```
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
    // build the storage key prefix from a fixed 'FEATURES' segment plus the optional namespace
    // drop the namespace segment entirely when none was provided
    const namespace = ['FEATURES', name].filter((x) => !!x).join('_');
    const storage = createStorage(namespace, type);
    return {
      connect: ({ provider }) => {
        return provider.onFeatureToggle(({ features }) => {
          // persist every toggled feature's latest state to storage
          features.map((feature) => storage.setItem(feature.key, feature));
        });
      },
      initial: async () => {
        const storedItems = await storage.getItems();
        // hydrate each default flag's enabled state from the stored snapshot, if present
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
