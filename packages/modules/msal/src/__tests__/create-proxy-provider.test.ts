import { describe, expect, it, vi } from 'vitest';
import type { IMsalClient } from '../MsalClient.interface';
import type { MsalConfig } from '../MsalConfigurator';
import { MsalProvider } from '../MsalProvider';
import { MsalModuleVersion } from '../static';
import type { AuthenticationResult } from '../types';
import type { IMsalProvider as IMsalProvider_v2 } from '../v2/MsalProvider.interface';

type MockMsalClient = {
  client: IMsalClient;
  acquireToken: ReturnType<typeof vi.fn>;
  handleRedirectPromise: ReturnType<typeof vi.fn>;
};

const createClient = (): MockMsalClient => {
  const acquireToken = vi.fn(async () => ({ accessToken: 'v4-token' }) as AuthenticationResult);
  const handleRedirectPromise = vi.fn(async () => ({ accessToken: 'redirect-token' }) as AuthenticationResult);

  return {
    client: {
      clientId: 'test-client-id',
      initialize: vi.fn(async () => undefined),
      acquireToken,
      handleRedirectPromise,
      setActiveAccount: vi.fn(),
      getActiveAccount: vi.fn(() => null),
    } as unknown as IMsalClient,
    acquireToken,
    handleRedirectPromise,
  };
};

const createConfig = (client: IMsalClient): MsalConfig => ({
  client,
  version: '7.0.0',
  requiresAuth: false,
  telemetry: {
    metadata: { module: 'msal', version: '7.0.0' },
    scope: ['framework', 'authentication'],
  },
});

describe('MsalProvider.createProxyProvider (v2)', () => {
  it('tags the proxy as v2 while delegating through the same v4 provider', () => {
    const mockClient = createClient();
    const provider = new MsalProvider(createConfig(mockClient.client));

    const v2Provider = provider.createProxyProvider<IMsalProvider_v2>(MsalModuleVersion.V2);

    expect(v2Provider.msalVersion).toBe(MsalModuleVersion.V2);
  });

  it('adapts the legacy v2 acquireToken shape into a v4 request before delegating', async () => {
    const mockClient = createClient();
    const provider = new MsalProvider(createConfig(mockClient.client));
    const v2Provider = provider.createProxyProvider<IMsalProvider_v2>(MsalModuleVersion.V2);

    await expect(v2Provider.acquireToken({ scopes: ['User.Read'] })).resolves.toMatchObject({
      accessToken: 'v4-token',
    });

    expect(mockClient.acquireToken).toHaveBeenCalledWith(
      expect.objectContaining({ request: expect.objectContaining({ scopes: ['User.Read'] }) }),
    );
  });

  it('discards the host’s redirect result, honoring v2’s null contract, while still processing it', async () => {
    const mockClient = createClient();
    const provider = new MsalProvider(createConfig(mockClient.client));
    const v2Provider = provider.createProxyProvider<IMsalProvider_v2>(MsalModuleVersion.V2);

    await expect(v2Provider.handleRedirect()).resolves.toBeNull();
    expect(mockClient.handleRedirectPromise).toHaveBeenCalledTimes(1);
  });
});
