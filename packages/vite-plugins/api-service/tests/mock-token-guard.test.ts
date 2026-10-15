import { afterEach, describe, expect, it } from 'vitest';
import { createServer, type ViteDevServer } from 'vite';
import nock from 'nock';

import {
  createProxyHandler,
  DEFAULT_VALUES,
  plugin as apiServicePlugin,
  type ApiRoute,
} from '../src';

/** Builds a bearer header from a JWT header, mirroring mock (unsigned) and Entra (signed) tokens. */
const bearer = (alg: string): string => {
  const segment = (value: object): string =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `Bearer ${segment({ alg, typ: 'JWT' })}.${segment({ sub: 'test-user' })}.${alg === 'none' ? '' : 'signature'}`;
};

describe('api-service plugin mock token guard', () => {
  let server: ViteDevServer | undefined;

  const startServer = async (discoveryUrl: string, routes?: ApiRoute[]): Promise<string> => {
    server = await createServer({
      configFile: false,
      plugins: [
        apiServicePlugin({
          proxyHandler: createProxyHandler(discoveryUrl, (data) => ({ data, routes: [] })),
          routes,
        }),
      ],
      server: { port: 0, host: 'localhost' },
    });
    await server.listen();
    return `http://localhost:${server.config.server.port}`;
  };

  afterEach(async () => {
    await server?.close();
    server = undefined;
    nock.cleanAll();
  });

  it('blocks a mock token from reaching a public service discovery', async () => {
    const upstream = nock('https://discovery.example.com').get('/services').reply(200, []);
    const serverUrl = await startServer('https://discovery.example.com');

    const response = await fetch(new URL(`${DEFAULT_VALUES.SERVICES_PATH}/services`, serverUrl), {
      headers: { authorization: bearer('none') },
    });

    expect(response.status).toBe(401);
    expect(response.headers.get('x-fusion-dev-server-blocked')).toBe('mock-token');
    expect(upstream.isDone()).toBe(false);
  });

  it('forwards a signed token to a public service discovery', async () => {
    const upstream = nock('https://discovery.example.com').get('/services').reply(200, []);
    const serverUrl = await startServer('https://discovery.example.com');

    const response = await fetch(new URL(`${DEFAULT_VALUES.SERVICES_PATH}/services`, serverUrl), {
      headers: { authorization: bearer('RS256') },
    });

    expect(response.status).toBe(200);
    expect(upstream.isDone()).toBe(true);
  });

  it('blocks a mock token from reaching a public IPv6 literal', async () => {
    const upstream = nock('https://[2606:4700:4700::1111]').get('/services').reply(200, []);
    const serverUrl = await startServer('https://[2606:4700:4700::1111]');

    const response = await fetch(new URL(`${DEFAULT_VALUES.SERVICES_PATH}/services`, serverUrl), {
      headers: { authorization: bearer('none') },
    });

    expect(response.status).toBe(401);
    expect(upstream.isDone()).toBe(false);
  });

  it('forwards a mock token to a local mock server', async () => {
    const upstream = nock('http://localhost:4010').get('/services').reply(200, []);
    const serverUrl = await startServer('http://localhost:4010');

    const response = await fetch(new URL(`${DEFAULT_VALUES.SERVICES_PATH}/services`, serverUrl), {
      headers: { authorization: bearer('none') },
    });

    expect(response.status).toBe(200);
    expect(upstream.isDone()).toBe(true);
  });

  it('blocks a mock token on proxy routes to public hosts but allows private hosts', async () => {
    const publicApi = nock('https://api.example.com').get('/items').reply(200, {});
    const composeApi = nock('http://api:8080').get('/items').reply(200, { ok: true });
    const serverUrl = await startServer('http://localhost:4010', [
      {
        match: '/public/items',
        proxy: { target: 'https://api.example.com', rewrite: () => '/items' },
      },
      { match: '/compose/items', proxy: { target: 'http://api:8080', rewrite: () => '/items' } },
    ]);
    const headers = { authorization: bearer('none') };

    const blocked = await fetch(new URL(`${DEFAULT_VALUES.API_PATH}/public/items`, serverUrl), {
      headers,
    });
    const allowed = await fetch(new URL(`${DEFAULT_VALUES.API_PATH}/compose/items`, serverUrl), {
      headers,
    });

    expect(blocked.status).toBe(401);
    expect(publicApi.isDone()).toBe(false);
    expect(allowed.status).toBe(200);
    expect(composeApi.isDone()).toBe(true);
  });
});
