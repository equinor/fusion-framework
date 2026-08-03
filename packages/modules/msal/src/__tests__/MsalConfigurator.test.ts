import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import { CacheLookupPolicy } from '@azure/msal-browser';
import { describe, expect, it, vi } from 'vitest';
import type { IMsalClient } from '../MsalClient.interface';
import { type MsalConfig, MsalConfigurator } from '../MsalConfigurator';

const createConfigCallbackArgs = (): ConfigBuilderCallbackArgs => ({
  config: {},
  hasModule: vi.fn().mockReturnValue(false),
  requireInstance: vi.fn(),
});

const createClient = (): IMsalClient => ({}) as IMsalClient;

const createInitialConfig = (): Pick<MsalConfig, 'telemetry'> => ({
  telemetry: {
    metadata: {},
    scope: [],
  },
});

describe('MsalConfigurator', () => {
  it('enriches a copy, leaving the declared client configuration untouched', async () => {
    // A caller may reuse or assert on the object it passed, and the defaults
    // applied here are derived — rewriting it behind their back is not ours to do
    const declared = { auth: { clientId: 'my-app', tenantId: 'my-tenant' } };
    const configurator = new MsalConfigurator();

    configurator.setClientConfig(declared);

    const config = await configurator.createConfigAsync(
      createConfigCallbackArgs(),
      createInitialConfig(),
    );

    expect(declared).toEqual({ auth: { clientId: 'my-app', tenantId: 'my-tenant' } });
    expect(config.client?.tenantId).toBe('my-tenant');
  });

  it('setAuthCode should normalize surrounding whitespace', async () => {
    const configurator = new MsalConfigurator();

    configurator.setClient(createClient());
    configurator.setAuthCode('  auth-code  ');

    const config = await configurator.createConfigAsync(
      createConfigCallbackArgs(),
      createInitialConfig(),
    );

    expect(config.authCode).toBe('auth-code');
  });

  it('setAuthCode should allow clearing with undefined', async () => {
    const configurator = new MsalConfigurator();

    configurator.setClient(createClient());
    configurator.setAuthCode('auth-code');
    configurator.setAuthCode(undefined);

    const config = await configurator.createConfigAsync(
      createConfigCallbackArgs(),
      createInitialConfig(),
    );

    expect(config.authCode).toBeUndefined();
  });

  it('setAuthCode should treat whitespace-only values as undefined', async () => {
    const configurator = new MsalConfigurator();

    configurator.setClient(createClient());
    configurator.setAuthCode('   ');

    const config = await configurator.createConfigAsync(
      createConfigCallbackArgs(),
      createInitialConfig(),
    );

    expect(config.authCode).toBeUndefined();
  });

  it('createConfigAsync should succeed when client is omitted', async () => {
    const configurator = new MsalConfigurator();

    const config = await configurator.createConfigAsync(
      createConfigCallbackArgs(),
      createInitialConfig(),
    );

    expect(config.client).toBeUndefined();
  });

  describe('_createClient', () => {
    it('builds from the same resolved client config the real client would get', async () => {
      // The mock relies on this: substituting the client must not also mean
      // re-implementing authority, cache and telemetry resolution
      const received: unknown[] = [];
      class CustomConfigurator extends MsalConfigurator {
        protected override async _createClient(config: MsalConfig): Promise<IMsalClient> {
          received.push(this._createClientConfig(config));
          return createClient();
        }
      }

      const configurator = new CustomConfigurator();
      configurator.setClientConfig({ auth: { clientId: 'client-id', tenantId: 'tenant-id' } });

      await configurator.createConfigAsync(createConfigCallbackArgs(), createInitialConfig());

      expect(received).toEqual([
        expect.objectContaining({
          auth: expect.objectContaining({
            clientId: 'client-id',
            // derived by the configurator, not by the caller
            authority: 'https://login.microsoftonline.com/tenant-id',
          }),
          cache: { cacheLocation: 'localStorage' },
        }),
      ]);
    });

    it('supplies the client when none was set', async () => {
      const client = createClient();
      class CustomConfigurator extends MsalConfigurator {
        protected override async _createClient(): Promise<IMsalClient> {
          return client;
        }
      }

      const config = await new CustomConfigurator().createConfigAsync(
        createConfigCallbackArgs(),
        createInitialConfig(),
      );

      expect(config.client).toBe(client);
    });

    it('is not consulted when a client was set, so setClient always wins', async () => {
      const own = createClient();
      const createOther = vi.fn().mockResolvedValue(createClient());
      class CustomConfigurator extends MsalConfigurator {
        protected override _createClient(): Promise<IMsalClient> {
          return createOther();
        }
      }

      const configurator = new CustomConfigurator();
      configurator.setClient(own);

      const config = await configurator.createConfigAsync(
        createConfigCallbackArgs(),
        createInitialConfig(),
      );

      expect(config.client).toBe(own);
      expect(createOther).not.toHaveBeenCalled();
    });

    it('is not consulted when hoisted, so a host provider is never shadowed', async () => {
      // A hoisted module authenticates through the host's provider, so anything
      // built here would be discarded — or worse, shadow the host's user
      const createOther = vi.fn().mockResolvedValue(createClient());
      class CustomConfigurator extends MsalConfigurator {
        protected override _createClient(): Promise<IMsalClient> {
          return createOther();
        }
      }

      const configurator = new CustomConfigurator();
      configurator.setClientConfig({ auth: { clientId: 'client-id', tenantId: 'tenant-id' } });

      const config = await configurator.createConfigAsync(
        { ...createConfigCallbackArgs(), ref: { auth: {} } },
        createInitialConfig(),
      );

      expect(config.client).toBeUndefined();
      expect(createOther).not.toHaveBeenCalled();
    });
  });

  describe('cacheLookupPolicy', () => {
    it('defaults to CacheLookupPolicy.AccessTokenAndRefreshToken', async () => {
      const configurator = new MsalConfigurator();
      configurator.setClient(createClient());

      const config = await configurator.createConfigAsync(
        createConfigCallbackArgs(),
        createInitialConfig(),
      );

      expect(config.cacheLookupPolicy).toBe(CacheLookupPolicy.AccessTokenAndRefreshToken);
    });

    it('setCacheLookupPolicy(undefined) clears the policy so MSAL default applies', async () => {
      const configurator = new MsalConfigurator();
      configurator.setClient(createClient());
      configurator.setCacheLookupPolicy(undefined);

      const config = await configurator.createConfigAsync(
        createConfigCallbackArgs(),
        createInitialConfig(),
      );

      expect(config.cacheLookupPolicy).toBeUndefined();
    });

    it('setCacheLookupPolicy overrides the default', async () => {
      const configurator = new MsalConfigurator();
      configurator.setClient(createClient());
      configurator.setCacheLookupPolicy(CacheLookupPolicy.Default);

      const config = await configurator.createConfigAsync(
        createConfigCallbackArgs(),
        createInitialConfig(),
      );

      expect(config.cacheLookupPolicy).toBe(CacheLookupPolicy.Default);
    });
  });
});
