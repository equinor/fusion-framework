import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '@equinor/fusion-framework-module-http/client';

import { type IRolesClient, RolesClient } from '../RolesClient.js';
import { RequiredRolesError } from '../errors/RequiredRolesError.js';
import { RolesModuleConfigurator } from '../RolesModuleConfigurator.js';
import { module } from '../module.js';

/**
 * Creates a minimal typed Roles V2 client for module initialization tests.
 *
 * @returns A Roles V2 client test double.
 */
const createClient = (): IRolesClient => ({
  initialize: vi.fn(),
  getActiveRoles: vi.fn(),
  getClaimableRoles: vi.fn(),
  claimRole: vi.fn(),
  canClaimAccessRole: vi.fn(),
});

describe('roles module', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    expect(client.initialize).toHaveBeenCalledWith({
      resolveCurrentAccountIdentifier: expect.any(Function),
    });
    expect(client.initialize).toHaveBeenCalledOnce();
    expect(client.getActiveRoles).toHaveBeenCalledOnce();
  });

  it('creates an app provider with service discovery inherited from the parent', async () => {
    const httpClient = new HttpClient('https://roles.example.test');
    const json = vi.spyOn(httpClient, 'json').mockResolvedValue([]);
    const serviceDiscovery = {
      createClient: vi.fn(async () => httpClient),
    };
    const auth = { account: { localAccountId: 'account-id' } };
    const requireInstance = vi.fn(async () => auth) as unknown as Parameters<
      typeof module.initialize
    >[0]['requireInstance'];

    const provider = await module.initialize({
      config: new RolesModuleConfigurator(),
      ref: { serviceDiscovery },
      hasModule: (name) => name === 'auth',
      requireInstance,
    });

    await expect(provider.getActiveRoles()).resolves.toEqual([]);
    expect(serviceDiscovery.createClient).toHaveBeenCalledWith('rolesv2');
    expect(json.mock.calls[0][0]).toContain('/accounts/account-id/');
  });

  it('creates the default client during configuration and resolves the current account on use', async () => {
    const httpClient = new HttpClient('https://roles.example.test');
    const json = vi.spyOn(httpClient, 'json').mockResolvedValue([]);
    const initialize = vi.spyOn(RolesClient.prototype, 'initialize');
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
    auth.account = { localAccountId: 'account-b' };
    await expect(provider.getClaimableRoles()).resolves.toEqual([]);
    expect(serviceDiscovery.createClient).toHaveBeenCalledWith('rolesv2');
    expect(initialize).toHaveBeenCalledWith({
      resolveCurrentAccountIdentifier: expect.any(Function),
    });
    expect(initialize).toHaveBeenCalledOnce();
    expect(json.mock.calls[0][0]).toContain('/accounts/account-id/');
    expect(json.mock.calls[1][0]).toContain('/accounts/account-b/');
    expect(telemetry.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'RolesProvider.getActiveRoles' }),
    );
  });

  it('propagates custom client initialization failures', async () => {
    const client = createClient();
    vi.mocked(client.initialize).mockRejectedValue(new Error('client initialization failed'));
    const config = new RolesModuleConfigurator();
    config.setClient(client);

    await expect(
      module.initialize({
        config,
        hasModule: () => false,
        requireInstance: vi.fn(),
      }),
    ).rejects.toMatchObject({
      name: 'RolesError',
      message: 'Failed to initialize Roles client.',
      cause: expect.objectContaining({ message: 'client initialization failed' }),
    });
    expect(client.getActiveRoles).not.toHaveBeenCalled();
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
    const httpClient = new HttpClient('https://roles.example.test');
    const serviceDiscovery = {
      createClient: vi.fn(async () => httpClient),
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
    expect(serviceDiscovery.createClient).toHaveBeenCalledWith('rolesv2');
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
