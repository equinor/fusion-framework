import { describe, expect, it, vi } from 'vitest';
import {
  ModulesConfigurator,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';
import telemetryModule from '@equinor/fusion-framework-module-telemetry';
import type { AccountInfo, AuthenticationResult } from '@azure/msal-browser';

import { MsalConfigurator, type MsalConfig } from '../../MsalConfigurator';
import { MsalProvider } from '../../MsalProvider';
import type { IMsalProvider } from '../../MsalProvider.interface';
import { enableMSAL, module as realModule } from '../../module';
import {
  MsalMockClient,
  createMsalMockClient,
  enableMsalMock,
  msalMockModule,
  MsalMockConfigurator,
  type MsalMockUser,
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

/**
 * Initializes the mock module for a given account.
 *
 * @param options - The user the mock client represents.
 * @returns The provider the module produced.
 */
const initializeMock = (user?: MsalMockUser): Promise<MsalProvider> =>
  initializeMockWith(user && ((builder) => builder.setAccount(user)));

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

  it('signs in a user without any client configuration', async () => {
    const provider = await initializeMock({ name: 'Ada Lovelace' });

    expect(provider.account?.name).toBe('Ada Lovelace');
  });

  it('replaces an auth module that is already registered', async () => {
    // A FrameworkConfigurator pre-registers the real auth module, so the mock is
    // only useful if registering it afterwards wins
    const configurator = new ModulesConfigurator([telemetryModule, realModule]);
    enableMsalMock(configurator);

    const instances = await configurator.initialize();

    expect((instances as unknown as { auth: MsalProvider }).auth.account?.name).toBe('Test User');
  });

  it('declares the account without constructing a client', () => {
    const configurator = new MsalMockConfigurator();

    configurator.setAccount({ username: 'ada@equinor.com' });

    // Nothing is built until the module assembles its config
    expect(configurator.getClient()).toBeUndefined();
    expect(configurator.getClientConfig()).toBeUndefined();
  });

  it('resolves an account callback with the ordinary builder arguments', async () => {
    // An ordinary config-builder callback, so a test can reach the modules in
    // scope rather than being handed a bespoke signature
    const provider = await initializeMockWith((builder) =>
      builder.setAccount(async ({ hasModule }) => ({
        name: hasModule('telemetry') ? 'Ada Lovelace' : 'Nobody',
      })),
    );

    expect(provider.account?.name).toBe('Ada Lovelace');
  });

  it('signs the user in before the provider initializes', async () => {
    // The provider's own start-up path must see the declared state, or a test
    // could not observe what the framework does with it
    const provider = await initializeMockWith((builder) => {
      builder.setAccount({ signedOut: true });
      builder.setRequiresAuth(true);
    });

    // `requiresAuth` made the real provider log in during initialize
    expect(provider.account?.username).toBe('test.user@equinor.com');
  });

  it('signs the declared user in on a client that was set explicitly', async () => {
    // The rule is uniform: the user goes on whichever client the module
    // authenticates through, wherever that client came from
    const own = new MsalMockClient(clientConfig());
    own.setUser({ name: 'Grace Hopper' });

    const provider = await initializeMockWith((builder) => {
      builder.setClient(own);
      builder.setAccount({ name: 'Ada Lovelace' });
    });

    expect(provider.client).toBe(own);
    expect(provider.account?.name).toBe('Ada Lovelace');
  });

  it('leaves a client that was set explicitly alone when no user is declared', async () => {
    const own = new MsalMockClient(clientConfig());
    own.setUser({ name: 'Grace Hopper' });

    const provider = await initializeMockWith((builder) => builder.setClient(own));

    expect(provider.account?.name).toBe('Grace Hopper');
  });

  it('refuses to declare a user on a client that cannot represent one', async () => {
    // Failing quietly is the whole failure mode this exists to prevent
    const configurator = new ModulesConfigurator([telemetryModule]);
    enableMsalMock(configurator, (builder) => {
      builder.setClient({} as unknown as MsalMockClient);
      builder.setAccount({ name: 'Ada Lovelace' });
    });

    await expect(configurator.initialize()).rejects.toThrow(
      /does not authenticate through a mock client/,
    );
  });

  it('carries the user on the configuration, resolved by the builder', async () => {
    // The user travels the ordinary pipeline as `mock.account` rather than
    // living on the builder, so any code with the raw configuration can read it
    const configurator = new MsalMockConfigurator();
    configurator.setAccount(async () => ({ name: 'Ada Lovelace' }));

    let rawConfig: MsalConfig | undefined;
    vi.spyOn(configurator, '_processConfig').mockImplementation(async (config) => {
      rawConfig = config;
      return config as MsalConfig;
    });

    await configurator.createConfigAsync({
      requireInstance: async () => undefined,
      hasModule: () => false,
      config: {},
    } as unknown as ConfigBuilderCallbackArgs);

    expect(rawConfig?.mock?.account).toEqual({ name: 'Ada Lovelace' });
  });

  it('applies the account as it ends up, not as it started', async () => {
    const provider = await initializeMockWith((builder) => {
      builder.setAccount({ name: 'Ada Lovelace' });
      builder.setAccount({ name: 'Grace Hopper' });
    });

    expect(provider.client).toBeInstanceOf(MsalMockClient);
    expect(provider.account?.name).toBe('Grace Hopper');
  });

  it('builds its client from setClientConfig, exactly as the real module does', async () => {
    const provider = await initializeMockWith((builder) =>
      builder.setClientConfig(clientConfig('my-app', 'my-tenant')),
    );

    expect(provider.client).toBeInstanceOf(MsalMockClient);
    expect(provider.client.clientId).toBe('my-app');
    expect(provider.client.tenantId).toBe('my-tenant');
  });

  it('exposes the client built for a signed-out account', async () => {
    const provider = await initializeMockWith((builder) => builder.setAccount({ signedOut: true }));
    const client = provider.client;

    expect(client.hasValidClaims).toBe(false);

    client.setActiveAccount({
      homeAccountId: 'id.tenant',
      localAccountId: 'id',
      environment: 'login.microsoftonline.com',
      tenantId: 'tenant',
      username: 'user@equinor.com',
      name: 'User',
    });

    expect(client.hasValidClaims).toBe(true);
  });

  it('starts with no account when signed out', async () => {
    const provider = await initializeMock({ signedOut: true });

    expect(provider.account).toBeNull();
  });

  it('runs the real sign-in flow through the provider', async () => {
    const provider = await initializeMock({ signedOut: true });
    expect(provider.account).toBeNull();

    await provider.login({ request: { scopes: ['User.Read'] } });

    expect(provider.account?.username).toBe('test.user@equinor.com');
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
    const host = await initializeMockWith((builder) => builder.setAccount({ name: 'Host User' }));

    const configurator = new ModulesConfigurator([telemetryModule]);
    enableMsalMock(configurator, configure);
    const instances = await configurator.initialize({ auth: host });

    return { host, hosted: (instances as unknown as { auth: IMsalProvider }).auth };
  };

  it('authenticates through the host instead of building a client of its own', async () => {
    const { host, hosted } = await initializeHosted();

    expect(hosted).not.toBe(host);
    expect(hosted.account?.name).toBe('Host User');
  });

  it('signs the declared user in on the host client, since none is built here', async () => {
    // The client belongs to the host, built in a scope this builder never sees.
    // Reaching it is the only way a declaration made here can take effect at
    // all — otherwise `setAccount` silently does nothing exactly when an
    // application is being tested inside a portal
    const { host, hosted } = await initializeHosted((builder) =>
      builder.setAccount({ name: 'Ada Lovelace' }),
    );

    expect(hosted.account?.name).toBe('Ada Lovelace');
    // The session is shared, as it is in production
    expect(host.account?.name).toBe('Ada Lovelace');
  });

  it('leaves the host user alone when the app declares none', async () => {
    const { host, hosted } = await initializeHosted();

    expect(hosted.account?.name).toBe('Host User');
    expect(host.account?.name).toBe('Host User');
  });

  it('refuses to declare a user the host cannot honour', async () => {
    // Failing quietly here is the bug this path exists to prevent
    const host = await initializeMockWith();
    const realHost = { ...host, client: {} } as unknown as IMsalProvider;

    const configurator = new ModulesConfigurator([telemetryModule]);
    enableMsalMock(configurator, (builder) => builder.setAccount({ name: 'Ada Lovelace' }));

    await expect(configurator.initialize({ auth: realHost })).rejects.toThrow(
      /does not authenticate through a mock client/,
    );
  });

  it('declares no client configuration at all, so nothing stands in for the host', async () => {
    // The stand-in configuration exists only to build a client from; a hoisted
    // module builds none, so it must not look configured either
    let hosted: MsalMockConfigurator | undefined;
    const host = await initializeMockWith((builder) => builder.setAccount({ name: 'Host User' }));

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
      builder.setClient(createMsalMockClient(clientConfig(), { name: 'Ada Lovelace' }));
    });

    const instances = await configurator.initialize();

    expect((instances as unknown as { auth: MsalProvider }).auth.account?.name).toBe(
      'Ada Lovelace',
    );
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
    client.setUser({ signedOut: true });

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
});

describe('setAccount(null)', () => {
  it('starts with nobody signed in', async () => {
    const provider = await initializeMockWith((builder) => builder.setAccount(null));

    expect(provider.account).toBeNull();
    expect(provider.client.hasValidClaims).toBe(false);
  });

  it('is a declaration, not the absence of one', async () => {
    // Saying "nobody" has to beat the default signed-in user, so it cannot be
    // treated the same as saying nothing at all
    const provider = await initializeMockWith((builder) => {
      builder.setAccount({ name: 'Ada Lovelace' });
      builder.setAccount(null);
    });

    expect(provider.account).toBeNull();
  });

  it('forgets the identity, unlike signedOut which keeps it', async () => {
    const forgotten = await initializeMockWith((builder) => {
      builder.setAccount({ name: 'Ada Lovelace' });
      builder.setAccount(null);
    });
    const remembered = await initializeMockWith((builder) =>
      builder.setAccount({ name: 'Ada Lovelace', signedOut: true }),
    );

    await forgotten.client.login({ request: { scopes: [] } });
    await remembered.client.login({ request: { scopes: [] } });

    expect(forgotten.account?.name).toBe('Test User');
    expect(remembered.account?.name).toBe('Ada Lovelace');
  });

  it('resolves null from a callback too', async () => {
    const provider = await initializeMockWith((builder) => builder.setAccount(async () => null));

    expect(provider.account).toBeNull();
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

  it('replaces the session when a new user is declared', () => {
    const client = new MsalMockClient(clientConfig());

    client.setUser({ name: 'Ada Lovelace', userId: 'ada' });

    expect(client.getAllAccounts()).toHaveLength(1);
    expect(client.getActiveAccount()?.name).toBe('Ada Lovelace');
  });

  it('leaves no account behind when signed out', () => {
    const client = new MsalMockClient(clientConfig());

    client.setUser({ signedOut: true });

    expect(client.getAllAccounts()).toEqual([]);
    expect(client.hasValidClaims).toBe(false);
  });
});
