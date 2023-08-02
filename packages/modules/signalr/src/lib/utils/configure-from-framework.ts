import { MsalModule } from '@equinor/fusion-framework-module-msal';
import { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

import { SignalRModuleConfigBuilder } from '../../SignalRModuleConfigurator';

export const configureFromFramework = async (
    args: { name: string; service: string; path: string },
    builder: SignalRModuleConfigBuilder<[MsalModule, ServiceDiscoveryModule]>,
) => {
    const authProvider = await builder.requireInstance('auth');
    const serviceDiscovery = await builder.requireInstance('serviceDiscovery');
    const service = await serviceDiscovery.resolveService(args.name);
    builder.addHub(args.name, {
        url: new URL(args.path, service.uri).toString(),
        options: {
            accessTokenFactory: async () => {
                const token = await authProvider.acquireAccessToken({
                    scopes: service.defaultScopes,
                });
                if (!token) {
                    throw Error('failed to acquire access token');
                }
                return token;
            },
        },
        automaticReconnect: true,
    });
};
