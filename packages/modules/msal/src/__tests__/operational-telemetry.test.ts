import { describe, expect, it, vi } from 'vitest';
import { markTelemetryExportRequest } from '@equinor/fusion-framework-module';
import type { ITelemetryProvider, TelemetryItem } from '@equinor/fusion-framework-module-telemetry';
import type { IMsalClient } from '../MsalClient.interface';
import type { MsalConfig } from '../MsalConfigurator';
import { MsalProvider } from '../MsalProvider';

const sentinel = 'privacy-sentinel-a8e2';

/** Telemetry double collecting every record and event the provider emits. */
const createTelemetry = () => {
  const items: TelemetryItem[] = [];
  const provider = {
    source: { source: 'framework', hostId: 'host-1' },
    measure: vi.fn(() => ({ measure: vi.fn() })),
    track: (item: TelemetryItem) => items.push(item),
    trackEvent: (item: TelemetryItem) => items.push(item),
    trackException: (item: TelemetryItem) => items.push(item),
  } as unknown as ITelemetryProvider;
  return { provider, items };
};

/** Operational records only, as `name:outcome`, in emission order. */
const operational = (items: TelemetryItem[]): string[] =>
  items
    .filter((item) => item.name.startsWith('fusion.msal.'))
    .map((item) => `${item.name}:${item.diagnostic?.outcome}`);

const account = { username: `${sentinel}@example.com`, homeAccountId: sentinel };

const createProvider = (client: Partial<Record<keyof IMsalClient, unknown>>) => {
  const { provider: telemetry, items } = createTelemetry();
  const config: MsalConfig = {
    client: {
      clientId: 'client-id',
      getActiveAccount: vi.fn(() => account),
      ...client,
    } as unknown as IMsalClient,
    version: '7.0.0',
    requiresAuth: false,
    telemetry: { provider: telemetry, metadata: {}, scope: ['framework'] },
  };
  return { provider: new MsalProvider(config), items };
};

describe('MsalProvider operational telemetry', () => {
  it('records token acquisition without tokens, scopes or account data', async () => {
    const result = { accessToken: `token-${sentinel}`, account };
    const acquireToken = vi.fn(async () => result);
    const { provider, items } = createProvider({ acquireToken });

    await expect(
      provider.acquireToken({ request: { scopes: [`api://${sentinel}/.default`] } }),
    ).resolves.toBe(result);

    // The deprecated scope format emits a legacy warning event, which must not carry scopes either.
    await provider.acquireToken({ scopes: [`api://${sentinel}/.default`] } as never);

    expect(operational(items)).toEqual([
      'fusion.msal.acquire-token.duration:success',
      'fusion.msal.acquire-token.duration:success',
    ]);
    expect(
      items.some((item) => item.name === 'module-msal.acquireToken.legacy-scopes-provided'),
    ).toBe(true);
    // Legacy events share the boundary, so every exported item is checked.
    expect(JSON.stringify(items)).not.toContain(sentinel);
  });

  it('rethrows token failures with one sanitized exception and classifies user cancellation', async () => {
    const failure = Object.assign(new Error(`AADSTS for ${sentinel}`), { errorCode: 'x' });
    const cancelled = Object.assign(new Error('cancelled'), { errorCode: 'user_cancelled' });
    const acquireToken = vi.fn().mockRejectedValueOnce(failure).mockRejectedValueOnce(cancelled);
    const { provider, items } = createProvider({ acquireToken });

    await expect(provider.acquireToken({ request: { scopes: ['a'] } })).rejects.toBe(failure);
    await expect(provider.acquireToken({ request: { scopes: ['a'] } })).rejects.toBe(cancelled);

    expect(operational(items)).toEqual([
      'fusion.msal.acquire-token.duration:failure',
      'fusion.msal.acquire-token.failure:failure',
      'fusion.msal.acquire-token.duration:cancelled',
    ]);
    // Legacy raw-error exceptions are replaced, so each failure counts once.
    expect(items.filter((item) => item.name === 'module-msal.acquireToken-failed')).toHaveLength(0);
    expect(JSON.stringify(items)).not.toContain(sentinel);
  });

  it('records silent-login fallback and the terminal login outcome once', async () => {
    const result = { account };
    const ssoSilent = vi.fn().mockRejectedValue(new Error(`hint ${sentinel}`));
    const loginPopup = vi.fn(async () => result);
    const { provider, items } = createProvider({ ssoSilent, loginPopup });

    await expect(
      provider.login({ behavior: 'popup', request: { scopes: ['a'], loginHint: sentinel } }),
    ).resolves.toBe(result);

    expect(operational(items)).toEqual([
      'fusion.msal.silent-login-fallback:failure',
      'fusion.msal.login.duration:success',
    ]);
    // Legacy events share the boundary, so every exported item is checked.
    expect(JSON.stringify(items)).not.toContain(sentinel);
  });

  it('records logout and redirect outcomes without account identifiers', async () => {
    const logout = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error(sentinel));
    const handleRedirectPromise = vi
      .fn()
      .mockResolvedValueOnce({ account })
      .mockResolvedValueOnce(null);
    const { provider, items } = createProvider({ logout, handleRedirectPromise });

    await expect(provider.logout({ redirectUri: `https://${sentinel}.test/?q=1` })).resolves.toBe(
      true,
    );
    await expect(provider.logout()).resolves.toBe(false);
    await expect(provider.handleRedirect()).resolves.toEqual({ account });
    // No pending redirect is still a completed, measured operation.
    await expect(provider.handleRedirect()).resolves.toBeNull();

    expect(operational(items)).toEqual([
      'fusion.msal.logout.duration:success',
      'fusion.msal.logout.duration:failure',
      'fusion.msal.logout.failure:failure',
      'fusion.msal.handle-redirect.duration:success',
      'fusion.msal.handle-redirect.duration:success',
    ]);
    expect(JSON.stringify(items)).not.toContain(sentinel);
  });

  it('stops reporting once the provider is disposed, even for in-flight flows', async () => {
    let resolve!: (value: unknown) => void;
    const acquireToken = vi.fn(() => new Promise((r) => (resolve = r)));
    const { provider, items } = createProvider({ acquireToken });

    const pending = provider.acquireToken({ request: { scopes: ['a'] } });
    provider.dispose();
    resolve({ accessToken: 'token' });

    await expect(pending).resolves.toEqual({ accessToken: 'token' });
    expect(operational(items)).toEqual([]);
  });

  it('does not record token acquisition owned by a telemetry export', async () => {
    const result = { accessToken: 'token' };
    const acquireToken = vi.fn(async () => result);
    const { provider, items } = createProvider({ acquireToken });

    await expect(
      provider.acquireAccessToken(markTelemetryExportRequest({ request: { scopes: ['a'] } })),
    ).resolves.toBe('token');
    await expect(provider.acquireToken({ request: { scopes: ['a'] } })).resolves.toBe(result);

    // The export's token is acquired as usual, but only the application call is recorded.
    expect(acquireToken).toHaveBeenCalledTimes(2);
    expect(operational(items)).toEqual(['fusion.msal.acquire-token.duration:success']);
  });

  it('keeps authentication behavior unchanged without telemetry', async () => {
    const result = { accessToken: 'token' };
    const config: MsalConfig = {
      client: {
        clientId: 'client-id',
        getActiveAccount: vi.fn(() => null),
        acquireToken: vi.fn(async () => result),
      } as unknown as IMsalClient,
      version: '7.0.0',
      requiresAuth: false,
      telemetry: { metadata: {}, scope: [] },
    };

    await expect(
      new MsalProvider(config).acquireToken({ request: { scopes: ['a'] } }),
    ).resolves.toBe(result);
  });
});
