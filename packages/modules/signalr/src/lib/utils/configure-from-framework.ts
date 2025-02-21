import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

import type { SignalRModuleConfigBuilder } from '../../SignalRModuleConfigurator';

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
        if (!service.scopes) {
          throw Error(
            `service [${service.name}] does not have authentication scopes, please configure an endpoint with scopes`,
          );
        }
        const token = await authProvider.acquireAccessToken({
          scopes: service.scopes ?? service.defaultScopes,
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
