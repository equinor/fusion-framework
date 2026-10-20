import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator, type AnyModule } from '@equinor/fusion-framework-module';
import type { IMsalProvider } from '@equinor/fusion-framework-module-msal';

import { configureHttpClient, type HttpMsalModule } from '../src/module.js';
import { MissingAccessTokenException } from '../src/errors/index.js';
import type { IHttpClientProvider } from '../src/provider.js';
import type { HttpClientMsal } from '../src/lib/client/index.js';

/**
 * Exercises the real module and request pipeline with only token acquisition stubbed.
 *
 * @param acquireAccessToken - Optional auth provider method; omitted to test missing auth.
 * @param defaultScopes - Scopes inherited from the named client.
 * @returns Initialized HTTP provider.
 */
async function createProvider(
  acquireAccessToken?: IMsalProvider['acquireAccessToken'],
  defaultScopes: string[] = [],
): Promise<IHttpClientProvider<HttpClientMsal>> {
  const modules: AnyModule[] = [];
  // Omitting auth tests the same setup used by anonymous-only applications.
  if (acquireAccessToken) {
    modules.push({
      name: 'auth',
      initialize: async () => ({ acquireAccessToken }),
    });
  }
  const configurator = new ModulesConfigurator(modules);
  configurator.addConfig(
    configureHttpClient('api', { baseUri: 'https://example.test', defaultScopes }),
  );
  const ref = await configurator.initialize<[HttpMsalModule]>();
  return ref.http;
}

describe('HTTP module authentication', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches a token and preserves existing headers', async () => {
    const acquireAccessToken = vi
      .fn<IMsalProvider['acquireAccessToken']>()
      .mockResolvedValue('access-token');
    const provider = await createProvider(acquireAccessToken);
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());

    await provider.createClient('api').fetch('/items', {
      scopes: ['api.read'],
      headers: { 'X-Test': 'preserved' },
    });

    expect(acquireAccessToken).toHaveBeenCalledWith({ request: { scopes: ['api.read'] } });
    const headers = new Headers(fetchSpy.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Authorization')).toBe('Bearer access-token');
    expect(headers.get('X-Test')).toBe('preserved');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, ''])('does not fetch when the token is %s', async (token) => {
    const provider = await createProvider(vi.fn().mockResolvedValue(token));
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());

    await expect(
      provider.createClient('api').fetch('/items', { scopes: ['api.read'] }),
    ).rejects.toThrow(MissingAccessTokenException);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('enforces scopes inherited from client configuration', async () => {
    const provider = await createProvider(vi.fn().mockResolvedValue(undefined), ['api.read']);
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());

    await expect(provider.createClient('api').fetch('/items')).rejects.toThrow(
      MissingAccessTokenException,
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does not fetch scoped requests without an auth module', async () => {
    const provider = await createProvider();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());

    await expect(
      provider.createClient('api').fetch('/items', { scopes: ['api.read'] }),
    ).rejects.toThrow(MissingAccessTokenException);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('preserves token acquisition errors without fetching', async () => {
    const error = new Error('Consent required');
    const provider = await createProvider(vi.fn().mockRejectedValue(error));
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());

    await expect(
      provider.createClient('api').fetch('/items', { scopes: ['api.read'] }),
    ).rejects.toBe(error);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'preserves unscoped requests with auth registered: %s',
    async (withAuth) => {
      const acquireAccessToken = vi.fn<IMsalProvider['acquireAccessToken']>();
      const provider = await createProvider(withAuth ? acquireAccessToken : undefined);
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());

      await provider.createClient('api').fetch('/items', {
        headers: { Authorization: 'Bearer caller-token' },
      });

      expect(acquireAccessToken).not.toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(new Headers(fetchSpy.mock.calls[0]?.[1]?.headers).get('Authorization')).toBe(
        'Bearer caller-token',
      );
    },
  );
});
