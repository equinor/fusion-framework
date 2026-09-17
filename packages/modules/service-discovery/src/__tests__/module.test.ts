import { describe, expect, it, vi } from 'vitest';

import { ModulesConfigurator, type AnyModule } from '@equinor/fusion-framework-module';
import {
  configureHttpClient,
  MissingAccessTokenException,
} from '@equinor/fusion-framework-module-http';

import { enableServiceDiscovery, type ServiceDiscoveryModule } from '../module';

describe('service discovery over a scoped http client', () => {
  it('never reaches the network when the auth module cannot resolve a token', async () => {
    // the http module only calls `acquireAccessToken`, so a minimal 'auth' double is enough
    const authModule: AnyModule = {
      name: 'auth',
      initialize: async () => ({ acquireAccessToken: vi.fn().mockResolvedValue(undefined) }),
    };

    const configurator = new ModulesConfigurator([authModule]);
    configurator.addConfig(
      configureHttpClient('service_discovery', {
        baseUri: 'http://localhost',
        defaultScopes: ['discovery/.default'],
      }),
    );
    enableServiceDiscovery(configurator, (builder) => {
      builder.configureServiceDiscoveryClientByClientKey('service_discovery');
    });

    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const ref = await configurator.initialize<[ServiceDiscoveryModule]>();

    await expect(ref.serviceDiscovery.resolveServices()).rejects.toThrow(
      MissingAccessTokenException,
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
