import { type IFeatureFlagConfigurator, FeatureFlagConfigurator } from './FeatureFlagConfigurator';
import { type IFeatureFlagProvider, FeatureFlagProvider } from './FeatureFlagProvider';

import { type Module, IModulesConfigurator } from '@equinor/fusion-framework-module';

export const name = 'featureFlag';
export type FeatureFlagModule = Module<typeof name, IFeatureFlagProvider, IFeatureFlagConfigurator>;

export type FeatureFlagBuilderCallback = (
    builder: IFeatureFlagConfigurator,
) => void | Promise<void>;

export const module: FeatureFlagModule = {
    name,
    configure: () => new FeatureFlagConfigurator(),
    initialize: async (init) => {
        const config = await init.config.createConfigAsync(init);
        const event = init.hasModule('event') ? await init.requireInstance('event') : undefined;
        return new FeatureFlagProvider({ config, event });
    },
};

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
