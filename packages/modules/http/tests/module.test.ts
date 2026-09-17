import { describe, expect, it, vi } from 'vitest';

import type { IMsalProvider } from '@equinor/fusion-framework-module-msal';

import { HttpClientConfigurator, type HttpClientRequestInitType } from '../src/configurator';
import { MissingAccessTokenException } from '../src/errors/index.js';
import { HttpClientMsal } from '../src/lib/client';
import { module } from '../src/module';

type MsalRequest = HttpClientRequestInitType<HttpClientMsal>;

/**
 * Builds the arguments `module.initialize` expects, wiring a stub auth provider whose
 * `acquireAccessToken` is the only method the MSAL request handler under test calls.
 */
function createInitArgs(acquireAccessToken: IMsalProvider['acquireAccessToken']) {
  return {
    config: new HttpClientConfigurator<HttpClientMsal>(HttpClientMsal),
    hasModule: (key: string) => key === 'auth',
    requireInstance: async () => {
      // the handler only calls `acquireAccessToken`, so a partial double is enough here
      return { acquireAccessToken } as unknown as IMsalProvider;
    },
  };
}

describe('http module MSAL request handler', () => {
  it('attaches a bearer token when one is resolved for a scoped request', async () => {
    const acquireAccessToken = vi.fn().mockResolvedValue('a-token');
    const provider = await module.initialize(createInitArgs(acquireAccessToken));

    const request: MsalRequest = { uri: 'http://localhost/api', path: '/api', scopes: ['scope.read'] };
    const result = await provider.defaultHttpRequestHandler.get('MSAL')(request);

    expect(acquireAccessToken).toHaveBeenCalledWith({ request: { scopes: ['scope.read'] } });
    expect(new Headers(result?.headers).get('Authorization')).toBe('Bearer a-token');
  });

  it('fails closed instead of sending an anonymous request when no token is resolved', async () => {
    const acquireAccessToken = vi.fn().mockResolvedValue(undefined);
    const provider = await module.initialize(createInitArgs(acquireAccessToken));

    const request: MsalRequest = { uri: 'http://localhost/api', path: '/api', scopes: ['scope.read'] };

    await expect(provider.defaultHttpRequestHandler.get('MSAL')(request)).rejects.toThrow(
      MissingAccessTokenException,
    );
  });

  it('does not attempt token acquisition for requests without scopes', async () => {
    const acquireAccessToken = vi.fn();
    const provider = await module.initialize(createInitArgs(acquireAccessToken));

    const request: MsalRequest = { uri: 'http://localhost/api', path: '/api' };
    const result = await provider.defaultHttpRequestHandler.get('MSAL')(request);

    expect(acquireAccessToken).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('never reaches the network when a scoped request cannot get a token', async () => {
    const acquireAccessToken = vi.fn().mockResolvedValue(undefined);
    const provider = await module.initialize(createInitArgs(acquireAccessToken));
    const client = provider.createClient({ baseUri: 'http://localhost' });
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(client.fetch('/api', { scopes: ['scope.read'] })).rejects.toThrow(
      MissingAccessTokenException,
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
