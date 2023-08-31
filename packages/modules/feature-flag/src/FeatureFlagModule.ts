import { type IFeatureFlagConfigurator, FeatureFlagConfigurator } from './FeatureFlagConfigurator';
import { type IFeatureFlagProvider, FeatureFlagProvider } from './FeatureFlagProvider';

import { type Module, IModulesConfigurator } from '@equinor/fusion-framework-module';

export const name = 'featureFlag';
export type FeatureFlagModule = Module<typeof name, IFeatureFlagProvider, IFeatureFlagConfigurator>;

export const module: FeatureFlagModule = {
    name,
    configure: () => new FeatureFlagConfigurator(),
    initialize: async (init) => {
        const config = await init.config.createConfigAsync(init);
        return new FeatureFlagProvider(config);
    },
};

export const enableFeatureFlagging = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configurator: IModulesConfigurator<any, any>,
    builder?: (builder: IFeatureFlagConfigurator) => void | Promise<void>,
): void => {
    configurator.addConfig({
        module,
        configure: async (config) => {
            if (builder) {
                return Promise.resolve(builder(config));
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
