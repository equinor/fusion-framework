import { describe, expect, it } from 'vitest';

import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import { AuthProviderDefaultCredential } from '../AuthProviderDefaultCredential.js';
import { AuthProviderTokenOnly } from '../AuthProviderTokenOnly.js';
import { enableAzureIdentityTokenOnly } from '../enable-azure-identity-token-only.js';
import { MockAuthProvider } from '../mock/index.js';
import { version } from '../version.js';

describe('azure-identity auth providers', () => {
  it.each([
    ['AuthProviderDefaultCredential', () => new AuthProviderDefaultCredential()],
    ['AuthProviderTokenOnly', () => new AuthProviderTokenOnly('token')],
    ['MockAuthProvider', () => new MockAuthProvider()],
  ])('%s extends BaseModuleProvider and exposes the package version', (_name, create) => {
    const provider = create();

    expect(provider).toBeInstanceOf(BaseModuleProvider);
    expect(String(provider.version)).toBe(version);
  });

  it('does not leak the access token through the provider config', async () => {
    const provider = new AuthProviderTokenOnly('secret-token');

    expect(JSON.stringify(provider)).not.toContain('secret-token');
    await expect(provider.acquireAccessToken({ request: { scopes: [] } })).resolves.toBe(
      'secret-token',
    );
  });

  it('does not emit provider warnings when initialized through the configurator', async () => {
    const configurator = new ModulesConfigurator();
    enableAzureIdentityTokenOnly(configurator, 'token');
    const eventNames: string[] = [];
    const subscription = configurator.event$.subscribe((event) => eventNames.push(event.name));

    const instance = await configurator.initialize();

    expect((instance as Record<string, unknown>).auth).toBeInstanceOf(BaseModuleProvider);
    expect(eventNames.filter((name) => name.includes('ModuleConfigurator.provider.'))).toEqual([]);

    subscription.unsubscribe();
    await configurator.dispose(instance);
  });
});
