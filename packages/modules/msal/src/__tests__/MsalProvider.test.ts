import { describe, expect, it, vi } from 'vitest';
import type { IMsalClient } from '../MsalClient.interface';
import type { MsalConfig } from '../MsalConfigurator';
import { MsalProvider } from '../MsalProvider';
import type { AuthenticationResult } from '../types';

type MockMsalClient = {
  client: IMsalClient;
  acquireTokenByCode: ReturnType<typeof vi.fn>;
  initialize: ReturnType<typeof vi.fn>;
};

const createClient = (): MockMsalClient => {
  const initialize = vi.fn(async () => undefined);
  const acquireTokenByCode = vi.fn(async () => ({}) as AuthenticationResult);

  return {
    client: {
      clientId: 'test-client-id',
      initialize,
      acquireTokenByCode,
      setActiveAccount: vi.fn(),
    } as unknown as IMsalClient,
    acquireTokenByCode,
    initialize,
  };
};

const createConfig = (client: IMsalClient, authCode?: string): MsalConfig => ({
  client,
  version: '7.0.0',
  requiresAuth: false,
  authCode,
  telemetry: {
    metadata: { module: 'msal', version: '7.0.0' },
    scope: ['framework', 'authentication'],
  },
});

describe('MsalProvider.initialize', () => {
  it('should not attempt auth code exchange when auth code is undefined', async () => {
    const mockClient = createClient();

    const provider = new MsalProvider(createConfig(mockClient.client, undefined));
    await provider.initialize();

    expect(mockClient.initialize).toHaveBeenCalledTimes(1);
    expect(mockClient.acquireTokenByCode).not.toHaveBeenCalled();
  });

  it('should not attempt auth code exchange when auth code is whitespace-only', async () => {
    const mockClient = createClient();

    const provider = new MsalProvider(createConfig(mockClient.client, '   '));
    await provider.initialize();

    expect(mockClient.acquireTokenByCode).not.toHaveBeenCalled();
  });

  it('should exchange auth code once and clear it afterwards', async () => {
    const mockClient = createClient();

    const provider = new MsalProvider(createConfig(mockClient.client, 'auth-code'));

    await provider.initialize();
    await provider.initialize();

    expect(mockClient.acquireTokenByCode).toHaveBeenCalledTimes(1);
    expect(mockClient.acquireTokenByCode).toHaveBeenCalledWith({
      code: 'auth-code',
      scopes: ['test-client-id/.default'],
    });
  });
});