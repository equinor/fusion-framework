import { describe, expect, it, vi } from 'vitest';
import { HttpClient } from '@equinor/fusion-framework-module-http/client';

import type { IRolesClient } from '../RolesClient.js';
import { RequiredRolesError } from '../RequiredRolesError.js';
import { RolesModuleConfigurator } from '../RolesModuleConfigurator.js';
import { module } from '../module.js';

/**
 * Creates a minimal typed Roles V2 client for module initialization tests.
 *
 * @returns A Roles V2 client test double.
 */
const createClient = (): IRolesClient => ({
  getActiveRoles: vi.fn(),
  getClaimableRoles: vi.fn(),
  claimRole: vi.fn(),
  canClaimAccessRole: vi.fn(),
});

describe('roles module', () => {
  it('uses a client builder without service discovery', async () => {
    const client = createClient();
    const config = new RolesModuleConfigurator();
    const clientBuilder = vi.fn(async () => client);
    config.setClient(clientBuilder);

    const provider = await module.initialize({
      config,
      hasModule: () => false,
      requireInstance: vi.fn(),
    });

    await provider.getActiveRoles();
    expect(clientBuilder).toHaveBeenCalledOnce();
    expect(client.getActiveRoles).toHaveBeenCalledOnce();
  });

  it('delegates child clients to the parent roles provider', async () => {
    const activeRoles = [{ systemName: 'Reports', accessRoleName: 'Reports.Read' }];
    const parent = {
      getActiveRoles: vi.fn(async () => activeRoles),
      getClaimableRoles: vi.fn(async () => []),
      claimRole: vi.fn(),
      hasRole: vi.fn(),
      canClaimAccessRole: vi.fn(),
      dispose: vi.fn(),
    };

    const provider = await module.initialize({
      config: new RolesModuleConfigurator(),
      ref: { roles: parent },
      hasModule: () => false,
      requireInstance: vi.fn(),
    });

    await expect(provider.getActiveRoles()).resolves.toEqual(activeRoles);
    await expect(provider.getActiveRoles()).resolves.toEqual(activeRoles);
    expect(parent.getActiveRoles).toHaveBeenCalledTimes(2);
  });

  it('resolves the rolesv2 service and returns an account-scoped client', async () => {
    const httpClient = new HttpClient('https://roles.example.test');
    const json = vi.spyOn(httpClient, 'json').mockResolvedValue([]);
    const serviceDiscovery = {
      createClient: vi.fn(async () => httpClient),
    };
    const auth = {
      account: { localAccountId: 'account-id' },
    };
    const event = {
      dispatchEvent: vi.fn(),
    };
    const telemetry = {
      trackEvent: vi.fn(),
      trackException: vi.fn(),
    };
    // The initializer's generic dependency resolver includes auth even though this test
    // advertises only service discovery; bridge that framework test seam explicitly.
    const requireInstance = vi.fn(async (name: string) => {
      if (name === 'auth') {
        return auth;
      }
      if (name === 'event') {
        return event;
      }
      if (name === 'telemetry') {
        return telemetry;
      }
      return serviceDiscovery;
    }) as unknown as Parameters<typeof module.initialize>[0]['requireInstance'];

    const provider = await module.initialize({
      config: new RolesModuleConfigurator(),
      hasModule: (name) =>
        name === 'serviceDiscovery' || name === 'auth' || name === 'event' || name === 'telemetry',
      requireInstance,
    });
    await expect(provider.getActiveRoles()).resolves.toEqual([]);
    expect(serviceDiscovery.createClient).toHaveBeenCalledWith('rolesv2');
    expect(json.mock.calls[0][0]).toContain('/accounts/account-id/');
    expect(telemetry.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'RolesProvider.getActiveRoles' }),
    );
  });

  it('allows bootstrap when the authenticated account has every required role', async () => {
    const client = createClient();
    vi.mocked(client.getActiveRoles).mockResolvedValue([
      { systemName: 'Reports', accessRoleName: 'Reports.Read' },
      { systemName: 'Reports', accessRoleName: 'Reports.Export' },
    ]);
    const config = new RolesModuleConfigurator();
    config.setClient(client);
    config.requireRoles(['Reports.Read', 'Reports.Export']);

    await expect(
      module.initialize({
        config,
        hasModule: () => false,
        requireInstance: vi.fn(),
      }),
    ).resolves.toBeDefined();
  });

  it('denies bootstrap when a required role is not active', async () => {
    const client = createClient();
    vi.mocked(client.getActiveRoles).mockResolvedValue([
      { systemName: 'Reports', accessRoleName: 'Reports.Read' },
    ]);
    const config = new RolesModuleConfigurator();
    config.setClient(client);
    config.requireRoles(['Reports.Read', 'Reports.Export']);

    await expect(
      module.initialize({
        config,
        hasModule: () => false,
        requireInstance: vi.fn(),
      }),
    ).rejects.toEqual(
      new RequiredRolesError(
        'Roles module bootstrap denied. Missing required roles: Reports.Export.',
        ['Reports.Export'],
      ),
    );
  });

  it('denies default-client bootstrap when authentication has no active account', async () => {
    const config = new RolesModuleConfigurator();
    config.requireRoles(['Reports.Read']);
    const serviceDiscovery = {
      createClient: vi.fn(),
    };
    // The dependency resolver is generic over all declared modules while this test provides
    // only the service-discovery branch needed to reach account resolution.
    const requireInstance = vi.fn(async () => serviceDiscovery) as unknown as Parameters<
      typeof module.initialize
    >[0]['requireInstance'];

    await expect(
      module.initialize({
        config,
        hasModule: (name) => name === 'serviceDiscovery',
        requireInstance,
      }),
    ).rejects.toThrow(
      'Roles module requires an active authenticated account to resolve Roles V2 data.',
    );
    expect(serviceDiscovery.createClient).not.toHaveBeenCalled();
  });

  it('fails initialization when neither a parent nor service discovery is available', async () => {
    await expect(
      module.initialize({
        config: new RolesModuleConfigurator(),
        hasModule: () => false,
        requireInstance: vi.fn(),
      }),
    ).rejects.toThrow('Roles module requires the serviceDiscovery module or a configured client.');
  });
});
