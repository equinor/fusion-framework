import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import { HttpClient } from '@equinor/fusion-framework-module-http/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RolesClient } from '../RolesClient.js';
import { RolesModuleConfigurator } from '../RolesModuleConfigurator.js';

const inheritedHttpClient = new HttpClient('https://roles.example.test');
const configBuilderArgs: ConfigBuilderCallbackArgs = {
  config: {},
  ref: {
    serviceDiscovery: {
      createClient: async () => inheritedHttpClient,
    },
  },
  hasModule: () => false,
  requireInstance: () => Promise.reject(new Error('No modules are available in this test.')),
};

describe('RolesModuleConfigurator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes and deduplicates required role names', async () => {
    const configurator = new RolesModuleConfigurator();

    configurator.requireRoles([' Reports.Read ', 'Reports.Read', 'Reports.Export']);

    await expect(configurator.createConfigAsync(configBuilderArgs)).resolves.toMatchObject({
      requiredRoles: ['Reports.Read', 'Reports.Export'],
    });
  });

  it('rejects empty required role names', () => {
    const configurator = new RolesModuleConfigurator();

    expect(() => configurator.requireRoles(['Reports.Read', '  '])).toThrow(
      'Required role names must be non-empty strings.',
    );
  });

  it('resolves and combines role requirement builders', async () => {
    const configurator = new RolesModuleConfigurator();
    configurator.requireRoles(['Reports.Read']);
    configurator.requireRoles(async () => [' Reports.Export ', 'Reports.Read']);

    await expect(configurator.createConfigAsync(configBuilderArgs)).resolves.toMatchObject({
      requiredRoles: ['Reports.Read', 'Reports.Export'],
    });
  });

  it('creates but does not initialize the default client during configuration', async () => {
    const configurator = new RolesModuleConfigurator();
    const httpClient = new HttpClient('https://roles.example.test');
    const initialize = vi.spyOn(RolesClient.prototype, 'initialize');
    const serviceDiscovery = {
      createClient: vi.fn(async () => httpClient),
    };
    const parentServiceDiscovery = {
      createClient: vi.fn(async () => httpClient),
    };
    const auth = {
      account: { localAccountId: 'account-id' },
    };
    const requireInstanceMock = vi.fn(async (name: string) => {
      return name === 'serviceDiscovery' ? serviceDiscovery : auth;
    });
    const requireInstance =
      requireInstanceMock as unknown as ConfigBuilderCallbackArgs['requireInstance'];

    const config = await configurator.createConfigAsync({
      config: {},
      ref: { serviceDiscovery: parentServiceDiscovery },
      hasModule: (name: string) => name === 'serviceDiscovery' || name === 'auth',
      requireInstance,
    });

    expect(config.client).toBeInstanceOf(RolesClient);
    expect(serviceDiscovery.createClient).toHaveBeenCalledWith('rolesv2');
    expect(parentServiceDiscovery.createClient).not.toHaveBeenCalled();
    expect(config.accountResolver).toEqual(expect.any(Function));
    expect(initialize).not.toHaveBeenCalled();
    await expect(config.accountResolver()).resolves.toBe('account-id');
    auth.account.localAccountId = 'next-account-id';
    await expect(config.accountResolver()).resolves.toBe('next-account-id');
    expect(requireInstanceMock.mock.calls.filter(([name]) => name === 'auth')).toHaveLength(1);
  });

  it('propagates authentication initialization failure without invoking the account resolver', async () => {
    const configurator = new RolesModuleConfigurator();
    const error = new Error('authentication initialization failed');
    const requireInstance = vi
      .fn<ConfigBuilderCallbackArgs['requireInstance']>()
      .mockRejectedValue(error);

    await expect(
      configurator.createConfigAsync({
        ...configBuilderArgs,
        hasModule: (name: string) => name === 'auth',
        requireInstance,
      }),
    ).rejects.toBe(error);
    expect(requireInstance).toHaveBeenCalledExactlyOnceWith('auth');
  });

  it('defers active-account validation and retains auth after configuration', async () => {
    const configurator = new RolesModuleConfigurator();
    const auth: { account: { localAccountId: string } | null } = { account: null };
    // The registry is generic over every module; this fixture implements only the auth surface used here.
    const requireInstance = vi.fn(
      async () => auth,
    ) as unknown as ConfigBuilderCallbackArgs['requireInstance'];
    const config = await configurator.createConfigAsync({
      ...configBuilderArgs,
      hasModule: (name: string) => name === 'auth',
      requireInstance,
    });

    await expect(config.accountResolver()).rejects.toThrow(
      'requires an active authenticated account',
    );
    vi.mocked(requireInstance).mockRejectedValue(new Error('module registry no longer available'));
    auth.account = { localAccountId: 'selected-later' };
    await expect(config.accountResolver()).resolves.toBe('selected-later');
    expect(requireInstance).toHaveBeenCalledOnce();
  });

  it('creates the default client with parent service discovery when the app has none', async () => {
    const configurator = new RolesModuleConfigurator();
    const httpClient = new HttpClient('https://roles.example.test');
    const serviceDiscovery = {
      createClient: vi.fn(async () => httpClient),
    };

    const config = await configurator.createConfigAsync({
      config: {},
      ref: { serviceDiscovery },
      hasModule: () => false,
      requireInstance: () => Promise.reject(new Error('No local modules are available.')),
    });

    expect(config.client).toBeInstanceOf(RolesClient);
    expect(serviceDiscovery.createClient).toHaveBeenCalledWith('rolesv2');
  });

  it.each([
    ['no role array', async () => undefined],
    ['an empty role name', async () => ['Reports.Read', '  ']],
  ])('rejects when a role requirement builder returns %s', async (_, roleBuilder) => {
    const configurator = new RolesModuleConfigurator();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    configurator.requireRoles(roleBuilder);

    await expect(configurator.createConfigAsync(configBuilderArgs)).rejects.toThrow(
      'Failed to resolve required role configuration.',
    );
  });

  it.each([
    [
      'rejects',
      async () => {
        throw new Error('client failed');
      },
    ],
    ['returns no client', async () => undefined],
  ])('rejects when a configured client builder %s', async (_, clientBuilder) => {
    const configurator = new RolesModuleConfigurator();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    configurator.setClient(clientBuilder);

    await expect(configurator.createConfigAsync(configBuilderArgs)).rejects.toThrow(
      'Failed to resolve configured Roles client.',
    );
  });
});
