import { type Module } from '@equinor/fusion-framework-module';
import { WeatherProvider } from './WeatherProvider';
import { WeatherConfigBuilder } from './WeatherConfigurator';

export const name = 'weatherModule';
export type WeatherModule = Module<typeof name, WeatherProvider, WeatherConfigBuilder>;

export const module: WeatherModule = {
    name,
    configure: () => new WeatherConfigBuilder(),
    initialize: async (init) => {
        const config = await init.config.createConfigAsync(init);
        return new WeatherProvider(config);
    },
};

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        [name]: WeatherModule;
    }
}

export default module;
