import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '@equinor/fusion-framework-module-http/client';
import { of, throwError } from 'rxjs';

import { type IRolesClient, RolesClient } from '../RolesClient.js';
import { RolesModuleConfigurator } from '../RolesModuleConfigurator.js';
import { RequiredAccessRolesError } from '../errors/RequiredAccessRolesError.js';
import { module } from '../module.js';

/**
 * Creates a minimal typed Roles V2 client for module initialization tests.
 *
 * @returns A Roles V2 client test double.
 */
const createClient = (): IRolesClient => ({
  initialize: vi.fn(),
  getActiveAccessRoleAssignments: vi.fn(() => of([])),
  getConsolidatedClaimableRoleAssignments: vi.fn(),
  getConsolidatedRoleAssignments: vi.fn(),
  activateClaimableRoleAssignment: vi.fn(),
  deactivateClaimableRoleAssignment: vi.fn(),
  hasClaimableRoleAssignmentForAccessRole: vi.fn(),
  getRequiredAccessRoleStatuses: vi.fn(() => of([])),
  getAccessRoles: vi.fn(),
  dispose: vi.fn(),
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

    await provider.getActiveAccessRoleAssignments();
    expect(clientBuilder).toHaveBeenCalledOnce();
    expect(client.initialize).toHaveBeenCalledWith({
      resolveCurrentAccountIdentifier: expect.any(Function),
    });
    expect(client.initialize).toHaveBeenCalledOnce();
    expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledOnce();
  });

  it('creates an app provider with service discovery inherited from the parent', async () => {
    const httpClient = new HttpClient('https://roles.example.test');
    const json = vi.spyOn(httpClient, 'json$').mockReturnValue(of([]));
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

    await expect(provider.getActiveAccessRoleAssignments()).resolves.toEqual([]);
    expect(serviceDiscovery.createClient).toHaveBeenCalledWith('rolesv2');
    expect(json.mock.calls[0][0]).toContain('/accounts/account-id/');
  });

  it('creates the default client during configuration and resolves the current account on use', async () => {
    const httpClient = new HttpClient('https://roles.example.test');
    const json = vi.spyOn(httpClient, 'json$').mockReturnValue(of([]));
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
    await expect(provider.getActiveAccessRoleAssignments()).resolves.toEqual([]);
    auth.account = { localAccountId: 'account-b' };
    await expect(provider.getConsolidatedClaimableRoleAssignments()).resolves.toEqual([]);
    expect(serviceDiscovery.createClient).toHaveBeenCalledWith('rolesv2');
    expect(initialize).toHaveBeenCalledWith({
      resolveCurrentAccountIdentifier: expect.any(Function),
    });
    expect(initialize).toHaveBeenCalledOnce();
    expect(json.mock.calls[0][0]).toContain('/accounts/account-id/');
    expect(json.mock.calls[1][0]).toContain('/accounts/account-b/');
    expect(telemetry.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'RolesProvider.getActiveAccessRoleAssignments' }),
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
    expect(client.getActiveAccessRoleAssignments).not.toHaveBeenCalled();
    expect(client.dispose).toHaveBeenCalledOnce();
  });

  it('allows bootstrap when the authenticated account has every required role', async () => {
    const client = createClient();
    vi.mocked(client.getActiveAccessRoleAssignments).mockReturnValue(
      of([
        { systemName: 'Reports', accessRoleName: 'Reports.Read' },
        { systemName: 'Reports', accessRoleName: 'Reports.Export' },
      ]),
    );
    const config = new RolesModuleConfigurator();
    config.setClient(client);
    config.requireAccessRoles(['Reports.Read', 'Reports.Export']);

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
    vi.mocked(client.getActiveAccessRoleAssignments).mockReturnValue(
      of([{ systemName: 'Reports', accessRoleName: 'Reports.Read' }]),
    );
    const config = new RolesModuleConfigurator();
    config.setClient(client);
    config.requireAccessRoles(['Reports.Read', 'Reports.Export']);

    const error = await Promise.resolve(
      module.initialize({
        config,
        hasModule: () => false,
        requireInstance: vi.fn(),
      }),
    ).catch((error: unknown) => error);

    expect(error).toMatchObject({
      name: 'RequiredAccessRolesError',
      message: 'Roles module bootstrap denied. Missing required access roles: Reports.Export.',
      missingAccessRoles: ['Reports.Export'],
      provider: expect.anything(),
    });
    if (!RequiredAccessRolesError.is(error) || !error.provider) {
      throw new Error('Expected a recoverable required-access-role error.');
    }
    await expect(
      error.provider.getRequiredAccessRoleStatuses(error.missingAccessRoles),
    ).resolves.toEqual([]);
    expect(client.dispose).not.toHaveBeenCalled();
  });

  it('disposes the provider when an unexpected bootstrap access check fails', async () => {
    const client = createClient();
    vi.mocked(client.getActiveAccessRoleAssignments).mockReturnValue(
      throwError(() => new Error('access check failed')),
    );
    const config = new RolesModuleConfigurator();
    config.setClient(client);
    config.requireAccessRoles(['Reports.Read']);

    await expect(
      module.initialize({
        config,
        hasModule: () => false,
        requireInstance: vi.fn(),
      }),
    ).rejects.toMatchObject({
      name: 'RolesError',
      cause: expect.objectContaining({ message: 'access check failed' }),
    });
    expect(client.dispose).toHaveBeenCalledOnce();
  });

  it('disposes the initialized provider during framework teardown', async () => {
    const client = createClient();
    const config = new RolesModuleConfigurator();
    config.setClient(client);
    const provider = await module.initialize({
      config,
      hasModule: () => false,
      requireInstance: vi.fn(),
    });

    await module.dispose?.({
      instance: provider,
      modules: { roles: provider } as never,
    });

    expect(client.dispose).toHaveBeenCalledOnce();
  });

  it('denies default-client bootstrap when authentication has no active account', async () => {
    const config = new RolesModuleConfigurator();
    config.requireAccessRoles(['Reports.Read']);
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
