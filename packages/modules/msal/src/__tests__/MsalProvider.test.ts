import { describe, expect, it, vi } from 'vitest';
import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import type { IMsalClient } from '../MsalClient.interface';
import type { MsalConfig } from '../MsalConfigurator';
import { MsalProvider } from '../MsalProvider';
import type { AuthenticationResult } from '../types';

type MockMsalClient = {
  client: IMsalClient;
  acquireTokenByCode: ReturnType<typeof vi.fn>;
  handleRedirectPromise: ReturnType<typeof vi.fn>;
  initialize: ReturnType<typeof vi.fn>;
  loginRedirect: ReturnType<typeof vi.fn>;
};

const createClient = (): MockMsalClient => {
  const initialize = vi.fn(async () => undefined);
  const acquireTokenByCode = vi.fn(async () => ({}) as AuthenticationResult);
  const handleRedirectPromise = vi.fn(async () => null);
  const loginRedirect = vi.fn(async () => undefined);

  return {
    client: {
      clientId: 'test-client-id',
      initialize,
      acquireTokenByCode,
      handleRedirectPromise,
      hasValidClaims: false,
      loginRedirect,
      getActiveAccount: vi.fn(() => null),
      setActiveAccount: vi.fn(),
    } as unknown as IMsalClient,
    acquireTokenByCode,
    handleRedirectPromise,
    initialize,
    loginRedirect,
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

  it('continues with the standard login flow when redirect handling fails', async () => {
    const mockClient = createClient();
    const error = new Error('AADSTS50148: The Code_Verifier does not match');
    const trackException = vi.fn();
    mockClient.handleRedirectPromise.mockRejectedValue(error);
    const config = createConfig(mockClient.client);
    config.requiresAuth = true;
    config.telemetry.provider = {
      measure: vi.fn(() => ({ measure: vi.fn() })),
      trackException,
      trackEvent: vi.fn(),
    } as unknown as ITelemetryProvider;

    await expect(new MsalProvider(config).initialize()).resolves.toBeUndefined();

    expect(trackException).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'module-msal.handleRedirect.failed',
        exception: error,
      }),
    );
    expect(mockClient.loginRedirect).toHaveBeenCalledWith({
      scopes: ['test-client-id/.default'],
    });
  });
});
