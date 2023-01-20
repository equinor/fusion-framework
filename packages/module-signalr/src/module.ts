import { Module } from '@equinor/fusion-framework-module';
import { MsalModule } from '@equinor/fusion-framework-module-msal';
import { ISignalRConfigurator, SignalRConfigurator } from './configurator';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

import { ISignalRProvider, SignalRProvider } from './provider';

export type SignalRModuleKey = 'signalr';

export const moduleKey: SignalRModuleKey = 'signalr';

export type SignalRModule = Module<
    SignalRModuleKey,
    ISignalRProvider,
    ISignalRConfigurator,
    [MsalModule, ServiceDiscoveryModule]
>;

export const module: SignalRModule = {
    name: moduleKey,
    configure: () => new SignalRConfigurator(),
    initialize: async (args) => {
        const config = (args.config as ISignalRConfigurator).config;
        const { hasModule, requireInstance } = args;

        if (config.useFusionPortalClientBaseUrl) {
            const serviceDiscovery = await requireInstance('serviceDiscovery');
            const portalClient = await serviceDiscovery.createClient('portal');
            config.baseUrl = portalClient.uri;
        }

        if (!hasModule('auth')) {
            throw Error('No Auth Provider is Present');
        }

        const authProvider = await requireInstance('auth');
        const acquireAccessToken = async () => {
            return (
                (await authProvider.acquireAccessToken({
                    scopes: config.scopes,
                })) || ''
            );
        };
        return new SignalRProvider(config, acquireAccessToken);
    },
};

export default module;

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        signalr: SignalRModule;
    }
}
