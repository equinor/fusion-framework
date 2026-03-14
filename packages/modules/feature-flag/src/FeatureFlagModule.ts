import { type IFeatureFlagConfigurator, FeatureFlagConfigurator } from './FeatureFlagConfigurator';
import { type IFeatureFlagProvider, FeatureFlagProvider } from './FeatureFlagProvider';

import type { Module, IModulesConfigurator } from '@equinor/fusion-framework-module';

/** Unique module identifier used in the Fusion Framework module registry. */
export const name = 'featureFlag';

/** Module type definition binding the name, provider, and configurator. */
export type FeatureFlagModule = Module<typeof name, IFeatureFlagProvider, IFeatureFlagConfigurator>;

/**
 * Callback invoked during configuration to register plugins and flags on
 * the {@link IFeatureFlagConfigurator} builder.
 *
 * @param builder - The configurator instance exposed during setup.
 */
export type FeatureFlagBuilderCallback = (
  builder: IFeatureFlagConfigurator,
) => void | Promise<void>;

/**
 * Feature-flag module descriptor.
 *
 * Registers a {@link FeatureFlagConfigurator} during configuration and
 * creates a {@link FeatureFlagProvider} at initialisation time.
 */
export const module: FeatureFlagModule = {
  name,
  configure: () => new FeatureFlagConfigurator(),
  initialize: async (init) => {
    const config = await init.config.createConfigAsync(init);
    const event = init.hasModule('event') ? await init.requireInstance('event') : undefined;
    return new FeatureFlagProvider({ config, event });
  },
};

/**
 * Registers the feature-flag module on a framework or app configurator.
 *
 * @param configurator - The modules configurator to register the module on.
 * @param callback - Optional callback to configure plugins and flags during setup.
 *
 * @example
 * ```ts
 * import { enableFeatureFlagging } from '@equinor/fusion-framework-module-feature-flag';
 * import { createLocalStoragePlugin } from '@equinor/fusion-framework-module-feature-flag/plugins';
 *
 * export const configure = (configurator) => {
 *   enableFeatureFlagging(configurator, (builder) => {
 *     builder.addPlugin(
 *       createLocalStoragePlugin([{ key: 'dark-mode', title: 'Dark mode' }])
 *     );
 *   });
 * };
 * ```
 */
export const enableFeatureFlagging = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configurator: IModulesConfigurator<any, any>,
  callback?: FeatureFlagBuilderCallback,
): void => {
  configurator.addConfig({
    module,
    configure: async (config) => {
      if (callback) {
        return Promise.resolve(callback(config));
      }
    },
  });
};

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    [name]: FeatureFlagModule;
  }
}

export default module;
