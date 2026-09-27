import { describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import telemetryModule from '@equinor/fusion-framework-module-telemetry';
import type { AccountInfo, AuthenticationResult } from '@azure/msal-browser';

import { MsalConfigurator } from '../../MsalConfigurator';
import { MsalProvider } from '../../MsalProvider';
import type { IMsalProvider } from '../../MsalProvider.interface';
import { enableMSAL, module as realModule } from '../../module';
import {
  MsalMockClient,
  createMockToken,
  createMsalMockClient,
  enableMsalMock,
  msalMockModule,
  MsalMockConfigurator,
} from '../../mock';

/**
 * Initializes the mock module through the real module system.
 *
 * @remarks
 * Deliberately avoids hand-building initialization arguments. Faking the module
 * system is the very cost this work removes, and a hand-rolled `init` would test
 * the fake rather than the module. The telemetry module is registered because the
 * MSAL schema requires a telemetry provider to be present.
 *
 * @param options - The user the mock client represents.
 * @returns The provider the module produced.
 */
const initializeMockWith = async (
  configure?: (builder: MsalMockConfigurator) => void,
): Promise<MsalProvider> => {
  const configurator = new ModulesConfigurator([telemetryModule]);
  enableMsalMock(configurator, configure);
  const instances = await configurator.initialize();
  return (instances as unknown as { auth: MsalProvider }).auth;
};

/** Initializes the mock module with its default account. */
const initializeMock = (): Promise<MsalProvider> => initializeMockWith();

/** The client configuration a test would declare, identical for real and mock. */
const clientConfig = (clientId = 'fusion-mock-client', tenantId = 'fusion-mock-tenant') => ({
  auth: { clientId, tenantId },
});

describe('msalMockModule', () => {
  it('changes nothing but the configurator', () => {
    expect(msalMockModule.name).toBe(realModule.name);
    expect(msalMockModule.version).toBe(realModule.version);
    // The production initializer, untouched — the mock has no lifecycle of its own
    expect(msalMockModule.initialize).toBe(realModule.initialize);
  });

  it('builds a real MsalConfigurator, so the whole builder stays available', () => {
    const configurator = msalMockModule.configure?.();

    expect(configurator).toBeInstanceOf(MsalConfigurator);
    expect(configurator).toBeInstanceOf(MsalMockConfigurator);
  });
});

describe('enableMsalMock', () => {
  it('produces the real MsalProvider, not a stand-in', async () => {
    const provider = await initializeMock();

    // The point of substituting the client rather than the provider: everything
    // above the network boundary is production code
    expect(provider).toBeInstanceOf(MsalProvider);
  });

  it('signs in the default user without any client configuration', async () => {
    const provider = await initializeMock();

    expect(provider.account?.name).toBe('Test User');
  });

  it('replaces an auth module that is already registered', async () => {
    // A FrameworkConfigurator pre-registers the real auth module, so the mock is
    // only useful if registering it afterwards wins
    const configurator = new ModulesConfigurator([telemetryModule, realModule]);
    enableMsalMock(configurator);

    const instances = await configurator.initialize();

    expect((instances as unknown as { auth: MsalProvider }).auth.account?.name).toBe('Test User');
  });

  it('builds its client from setClientConfig, exactly as the real module does', async () => {
    const provider = await initializeMockWith((builder) =>
      builder.setClientConfig(clientConfig('my-app', 'my-tenant')),
    );

    expect(provider.client).toBeInstanceOf(MsalMockClient);
    expect(provider.client.clientId).toBe('my-app');
    expect(provider.client.tenantId).toBe('my-tenant');
  });

  it('runs the real sign-out flow through the provider', async () => {
    const provider = await initializeMock();
    expect(provider.account).not.toBeNull();

    await provider.logout();

    expect(provider.account).toBeNull();
  });

  it('lets the real provider resolve default scopes', async () => {
    const provider = await initializeMockWith((builder) =>
      builder.setClientConfig(clientConfig('my-app')),
    );

    const token = await provider.acquireAccessToken();
    const claims = JSON.parse(atob(token?.split('.')[1] ?? ''));

    // MsalProvider — not the mock — turns "no scopes requested" into `${clientId}/.default`
    expect(claims.scp).toBe('my-app/.default');
  });
});

describe('enableMsalMock when hoisted onto a host', () => {
  /**
   * Initializes the mock module inside a host application.
   *
   * @remarks
   * `ModulesConfigurator.initialize` forwards its argument as the module `ref`,
   * which is exactly how a portal hands its modules to an app it loads. Going
   * through the real module system keeps the proxy-provider path under test.
   *
   * @param configure - Configuration applied to the hosted (inner) module.
   * @returns The provider the hosted module produced.
   */
  const initializeHosted = async (
    configure?: (builder: MsalMockConfigurator) => void,
  ): Promise<{ host: MsalProvider; hosted: IMsalProvider }> => {
    const host = await initializeMock();

    const configurator = new ModulesConfigurator([telemetryModule]);
    enableMsalMock(configurator, configure);
    const instances = await configurator.initialize({ auth: host });

    return { host, hosted: (instances as unknown as { auth: IMsalProvider }).auth };
  };

  it('authenticates through the host instead of building a client of its own', async () => {
    const { host, hosted } = await initializeHosted();

    expect(hosted).not.toBe(host);
    expect(hosted.account?.name).toBe('Test User');
  });

  it('leaves the host user alone when the app declares none', async () => {
    const { host, hosted } = await initializeHosted();

    expect(hosted.account?.name).toBe('Test User');
    expect(host.account?.name).toBe('Test User');
  });

  it('declares no client configuration at all, so nothing stands in for the host', async () => {
    // The stand-in configuration exists only to build a client from; a hoisted
    // module builds none, so it must not look configured either
    let hosted: MsalMockConfigurator | undefined;
    const host = await initializeMock();

    const configurator = new ModulesConfigurator([telemetryModule]);
    enableMsalMock(configurator, (builder) => {
      hosted = builder;
    });
    await configurator.initialize({ auth: host });

    expect(hosted?.getClientConfig()).toBeUndefined();
    expect(hosted?.getClient()).toBeUndefined();
  });
});

describe('createMsalMockClient with the real module', () => {
  it('needs no mock module — the client is enough', async () => {
    const configurator = new ModulesConfigurator([telemetryModule]);
    enableMSAL(configurator, (builder) => {
      builder.setClient(createMsalMockClient(clientConfig()));
    });

    const instances = await configurator.initialize();

    expect((instances as unknown as { auth: MsalProvider }).auth.account?.name).toBe('Test User');
  });
});

describe('MsalMockClient', () => {
  it('takes the same argument as the real client', () => {
    const client = new MsalMockClient(clientConfig('my-app', 'my-tenant'));

    expect(client.clientId).toBe('my-app');
    expect(client.tenantId).toBe('my-tenant');
  });

  it('reads the tenant out of the authority when none was given', () => {
    // A production config often carries only `authority`, and the tenant still
    // has to reach the tokens the client mints
    const client = new MsalMockClient({
      auth: {
        clientId: 'my-app',
        authority: 'https://login.microsoftonline.com/authority-tenant',
      },
    });

    expect(client.tenantId).toBe('authority-tenant');
  });

  it('is not mistaken for a promise', () => {
    const client = new MsalMockClient(clientConfig());

    expect((client as unknown as { then?: unknown }).then).toBeUndefined();
  });

  it('fails silent sign-in without an account, as MSAL does', async () => {
    const client = new MsalMockClient(clientConfig());
    client.setActiveAccount(null);

    await expect(client.ssoSilent({ scopes: ['X'] })).rejects.toThrow(/no cached account/);
  });

  it('issues identical tokens across instances', async () => {
    const first = new MsalMockClient(clientConfig());
    const second = new MsalMockClient(clientConfig());

    const a = await first.acquireToken({ request: { scopes: ['X'] } });
    const b = await second.acquireToken({ request: { scopes: ['X'] } });

    expect(a?.accessToken).toBe(b?.accessToken);
  });

  it('lets a test runner spy on a single method', async () => {
    const client = new MsalMockClient(clientConfig());

    vi.spyOn(client, 'acquireToken').mockResolvedValue({
      account: client.getActiveAccount(),
      accessToken: 'mock-token',
      idToken: 'mock-token',
      scopes: ['mock'],
      tokenType: 'Bearer',
      expiresOn: new Date('2033-11-14T22:13:20.000Z'),
      authority: 'https://login.microsoftonline.com/mock',
      uniqueId: 'mock-user',
      tenantId: 'mock-tenant',
      fromCache: false,
      correlationId: 'fusion-mock-correlation',
    } as unknown as AuthenticationResult);

    const result = await client.acquireToken({ request: { scopes: ['X'] } });

    expect(result?.accessToken).toBe('mock-token');
  });

  it('acquires an injected token and replaces the active account from its claims', async () => {
    const administrator = createMockToken({
      oid: 'administrator',
      name: 'Administrator',
      preferred_username: 'administrator@example.test',
    });
    const acquireToken = vi.fn(async () => administrator);
    const provider = await initializeMockWith((builder) => builder.setAcquireToken(acquireToken));
    const client = provider.client;

    const result = await client.acquireToken({
      request: { scopes: ['api://application/.default'] },
    });

    expect(result?.accessToken).toBe(administrator);
    expect(result?.account?.localAccountId).toBe('administrator');
    expect(client.getActiveAccount()?.localAccountId).toBe('administrator');
    expect(acquireToken).toHaveBeenCalledWith({
      scopes: ['api://application/.default'],
      account: expect.objectContaining({ localAccountId: 'fusion-mock-user' }),
      clientId: 'fusion-mock-client',
    });

    client.setActiveAccount({
      ...(client.getActiveAccount() as AccountInfo),
      homeAccountId: 'manual-user.fusion-mock-tenant',
      localAccountId: 'manual-user',
    });
    const repeated = await client.acquireToken({
      request: { scopes: ['api://application/.default'] },
    });
    expect(repeated?.account?.localAccountId).toBe('administrator');
    expect(client.getActiveAccount()?.localAccountId).toBe('administrator');
  });

  it('propagates injected token acquisition failures', async () => {
    const provider = await initializeMockWith((builder) =>
      builder.setAcquireToken(async () => {
        throw new Error('mock token service unavailable');
      }),
    );
    const client = provider.client;

    await expect(
      client.acquireToken({
        request: { scopes: ['api://different/.default'] },
      }),
    ).rejects.toThrow(/mock token service unavailable/);
    expect(client.getActiveAccount()?.localAccountId).toBe('fusion-mock-user');
  });

  it('switches acquired identities and restores the in-process fallback after reset', async () => {
    const normalUser = createMockToken({ oid: 'normal-user', name: 'Normal User' });
    const administrator = createMockToken({ oid: 'administrator', name: 'Administrator' });
    let resolution: { status: 'issued'; token: string } | { status: 'missing' } = {
      status: 'issued',
      token: normalUser,
    };
    const provider = await initializeMockWith((builder) =>
      builder.setAcquireToken(async () =>
        resolution.status === 'issued' ? resolution.token : null,
      ),
    );
    const client = provider.client;

    await client.acquireToken({ request: { scopes: ['api://application/.default'] } });
    expect(client.getActiveAccount()?.localAccountId).toBe('normal-user');

    resolution = { status: 'issued', token: administrator };
    await client.acquireToken({ request: { scopes: ['api://application/.default'] } });
    expect(client.getAllAccounts()).toHaveLength(1);
    expect(client.getActiveAccount()?.localAccountId).toBe('administrator');

    resolution = { status: 'missing' };
    const reset = await client.acquireToken({
      request: { scopes: ['api://application/.default'] },
    });
    expect(reset?.accessToken).not.toBe(administrator);
    expect(client.getAllAccounts()).toHaveLength(1);
    expect(client.getActiveAccount()?.localAccountId).toBe('fusion-mock-user');
  });
});

describe('MsalMockConfigurator.setAcquireToken', () => {
  it('keeps provider account and token aligned with the acquisition result', async () => {
    const token = createMockToken({ oid: 'server-user' });
    let resolution: { status: 'issued'; token: string } | { status: 'missing' } = {
      status: 'issued',
      token,
    };
    const acquireToken = vi.fn(async () =>
      resolution.status === 'issued' ? resolution.token : null,
    );
    const provider = await initializeMockWith((builder) => builder.setAcquireToken(acquireToken));

    const result = await provider.client.acquireToken({
      request: { scopes: ['api://application/.default'] },
    });

    expect(result?.accessToken).toBe(token);
    expect(result?.account?.localAccountId).toBe('server-user');
    expect(provider.client.getActiveAccount()?.localAccountId).toBe('server-user');
    expect(provider.account?.localAccountId).toBe('server-user');

    resolution = { status: 'missing' };
    const reset = await provider.client.acquireToken({
      request: { scopes: ['api://application/.default'] },
    });

    expect(reset?.accessToken).not.toBe(token);
    expect(reset?.account?.localAccountId).toBe('fusion-mock-user');
    expect(provider.account?.localAccountId).toBe('fusion-mock-user');
    expect(acquireToken).toHaveBeenCalledTimes(2);
  });
});

describe('MsalMockClient account cache', () => {
  it('swaps the signed-in user on a live framework, as the docs describe', async () => {
    const provider = await initializeMock();
    const account = {
      ...(provider.account as AccountInfo),
      homeAccountId: 'ada',
      name: 'Ada Lovelace',
    };

    provider.client.setActiveAccount(account);

    expect(provider.account?.name).toBe('Ada Lovelace');
  });

  it('holds the signed-in user in the account cache', () => {
    const client = new MsalMockClient(clientConfig());

    expect(client.getAllAccounts()).toEqual([client.getActiveAccount()]);
  });

  it('empties the cache when the user signs out', async () => {
    const client = new MsalMockClient(clientConfig());

    await client.logout();

    expect(client.getActiveAccount()).toBeNull();
    expect(client.getAllAccounts()).toEqual([]);
  });

  it('matches a cached account on the filter it is given', () => {
    const client = new MsalMockClient(clientConfig());
    const account = client.getActiveAccount();

    expect(client.getAccount({ username: account?.username })).toBe(account);
    expect(client.getAccount({ homeAccountId: account?.homeAccountId })).toBe(account);
    expect(client.getAccount({ username: 'someone.else@equinor.com' })).toBeNull();
  });

  it('caches an account a test makes active', () => {
    // Tests swap the user per run rather than reconstructing the framework, so
    // an account MSAL never issued still has to end up in the cache
    const client = new MsalMockClient(clientConfig());
    const account = {
      ...(client.getActiveAccount() as AccountInfo),
      homeAccountId: 'grace.hopper',
      username: 'grace.hopper@equinor.com',
      name: 'Grace Hopper',
    };

    client.setActiveAccount(account);

    expect(client.getActiveAccount()?.name).toBe('Grace Hopper');
    expect(client.getAccount({ username: 'grace.hopper@equinor.com' })).toBe(account);
  });
});
