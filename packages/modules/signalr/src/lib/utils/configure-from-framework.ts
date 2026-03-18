import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';

import type { SignalRModuleConfigBuilder } from '../../SignalRModuleConfigurator';

/**
 * Configure a SignalR hub connection using Fusion Framework service-discovery
 * and MSAL authentication.
 *
 * Resolves the hub endpoint URL from the service registry and creates an
 * `accessTokenFactory` that acquires tokens via the MSAL auth provider.
 *
 * @param args - Hub name, service identifier, and path to append to the resolved service URI
 * @param builder - Module config builder with access to MSAL and service-discovery instances
 *
 * @internal
 */
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
          request: { scopes: service.scopes ?? service.defaultScopes },
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
