import { describe, expect, it } from 'vitest';
import { PublicClientApplication } from '@azure/msal-node';

import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import { AuthProvider } from '../AuthProvider.js';
import { AuthProviderDeviceCode } from '../AuthProviderDeviceCode.js';
import { AuthProviderInteractive } from '../AuthProviderInteractive.js';
import { AuthTokenProvider } from '../AuthTokenProvider.js';
import { MockAuthProvider } from '../mock/index.js';
import { module as authModule } from '../module.js';
import { version } from '../version.js';

const createClient = (): PublicClientApplication =>
  new PublicClientApplication({ auth: { clientId: '00000000-0000-0000-0000-000000000000' } });

describe('msal-node auth providers', () => {
  it.each([
    ['AuthProvider', () => new AuthProvider(createClient())],
    [
      'AuthProviderInteractive',
      () => new AuthProviderInteractive(createClient(), { server: { port: 49741 } }),
    ],
    [
      'AuthProviderDeviceCode',
      () => new AuthProviderDeviceCode(createClient(), { deviceCodeCallback: () => undefined }),
    ],
    ['AuthTokenProvider', () => new AuthTokenProvider('token')],
    ['MockAuthProvider', () => new MockAuthProvider()],
  ])('%s extends BaseModuleProvider and exposes the package version', (_name, create) => {
    const provider = create();

    expect(provider).toBeInstanceOf(BaseModuleProvider);
    expect(String(provider.version)).toBe(version);
  });

  it('does not leak the access token through the provider config', async () => {
    const provider = new AuthTokenProvider('secret-token');

    expect(JSON.stringify(provider)).not.toContain('secret-token');
    await expect(provider.acquireAccessToken({ request: { scopes: [] } })).resolves.toBe(
      'secret-token',
    );
  });

  it('does not emit provider warnings when initialized through the configurator', async () => {
    const configurator = new ModulesConfigurator();
    configurator.addConfig({
      module: authModule,
      configure: (builder) => {
        builder.setMode('token_only');
        builder.setAccessToken('token');
      },
    });
    const eventNames: string[] = [];
    const subscription = configurator.event$.subscribe((event) => eventNames.push(event.name));

    const instance = await configurator.initialize();

    expect(instance.auth).toBeInstanceOf(BaseModuleProvider);
    expect(eventNames.filter((name) => name.includes('ModuleConfigurator.provider.'))).toEqual([]);

    subscription.unsubscribe();
    await configurator.dispose(instance);
  });
});
