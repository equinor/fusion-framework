import { Module } from '@equinor/fusion-framework-module';
import { ISignalRConfigurator, SignalRConfigurator } from './SignalRModuleConfigurator';

import { ISignalRProvider, SignalRModuleProvider } from './SignalRModuleProvider';

export type SignalRModuleKey = 'signalR';

export const moduleKey: SignalRModuleKey = 'signalR';

export type SignalRModule = Module<SignalRModuleKey, ISignalRProvider, ISignalRConfigurator>;

export const module: SignalRModule = {
    name: moduleKey,
    configure: () => new SignalRConfigurator(),
    initialize: async (init) => {
        const config = await (init.config as SignalRConfigurator).createConfig(init);
        return new SignalRModuleProvider(config);
    },
};

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        signalR: SignalRModule;
    }
}
