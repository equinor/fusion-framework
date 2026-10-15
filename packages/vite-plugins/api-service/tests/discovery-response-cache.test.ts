import { afterEach, describe, expect, it, vi } from 'vitest';
import { createServer, type ViteDevServer } from 'vite';
import nock from 'nock';

import {
  createProxyHandler,
  DEFAULT_VALUES,
  plugin as apiServicePlugin,
  type ApiDataProcessor,
} from '../src';

type Service = { name: string; uri: string };

const discoveryUrl = 'http://localhost:667';
const services: Service[] = [{ name: 'people', uri: 'http://localhost:3101' }];

/** Echoes the referer into each service so per-request transformation is observable. */
const generateRoutes: ApiDataProcessor<Service[], Service[]> = (data, { request }) => {
  // Prefix each service with the caller's referer so a reused payload reveals stale transformation
  const withReferer = data.map((service) => ({
    ...service,
    uri: `${request.headers.referer ?? ''}${service.name}`,
  }));
  return { data: withReferer, routes: [] };
};

describe('createProxyHandler service discovery cache', () => {
  let server: ViteDevServer | undefined;

  const startServer = async (): Promise<string> => {
    server = await createServer({
      configFile: false,
      plugins: [
        apiServicePlugin({
          proxyHandler: createProxyHandler(discoveryUrl, generateRoutes),
        }),
      ],
      server: { port: 0, host: 'localhost' },
    });
    await server.listen();
    return `http://localhost:${server.config.server.port}`;
  };

  const requestServices = (
    serverUrl: string,
    headers?: Record<string, string>,
  ): Promise<Response> =>
    fetch(new URL(`${DEFAULT_VALUES.SERVICES_PATH}/services`, serverUrl), { headers });

  afterEach(async () => {
    vi.useRealTimers();
    await server?.close();
    server = undefined;
    nock.cleanAll();
  });

  it('serves repeated requests from cache after a single upstream call', async () => {
    const upstream = nock(discoveryUrl).get('/services').once().reply(200, services);
    const serverUrl = await startServer();

    const first = await requestServices(serverUrl);
    expect(first.status).toBe(200);
    expect(first.headers.get('x-fusion-discovery-cache')).toBeNull();

    // Simulates a reload loop: none of these may reach upstream
    for (let i = 0; i < 5; i++) {
      const cached = await requestServices(serverUrl);
      expect(cached.status).toBe(200);
      expect(cached.headers.get('x-fusion-discovery-cache')).toBe('hit');
      expect(await cached.json()).toEqual(await first.clone().json());
    }
    expect(upstream.isDone()).toBe(true);
  });

  it('re-runs the transformation for cached payloads so request context is respected', async () => {
    nock(discoveryUrl).get('/services').once().reply(200, services);
    const serverUrl = await startServer();

    const a = await requestServices(serverUrl, { referer: 'http://a.localhost/' }).then((r) =>
      r.json(),
    );
    const b = await requestServices(serverUrl, { referer: 'http://b.localhost/' }).then((r) =>
      r.json(),
    );

    expect(a).toEqual([{ name: 'people', uri: 'http://a.localhost/people' }]);
    expect(b).toEqual([{ name: 'people', uri: 'http://b.localhost/people' }]);
  });

  it('replays a failed upstream response without calling upstream again', async () => {
    const upstream = nock(discoveryUrl)
      .get('/services')
      .once()
      .reply(401, { error: 'unauthorized' }, { 'content-type': 'application/json' });
    const serverUrl = await startServer();

    const first = await requestServices(serverUrl);
    expect(first.status).toBe(401);
    expect(await first.json()).toEqual({ error: 'unauthorized' });

    const replayed = await requestServices(serverUrl);
    expect(replayed.status).toBe(401);
    expect(replayed.headers.get('x-fusion-discovery-cache')).toBe('hit');
    expect(upstream.isDone()).toBe(true);
  });

  it('keeps responses for different Authorization headers separate', async () => {
    const upstream = nock(discoveryUrl)
      .get('/services')
      .reply(401, { error: 'unauthorized' }, { 'content-type': 'application/json' })
      .get('/services')
      .reply(200, services);
    const serverUrl = await startServer();

    const expired = await requestServices(serverUrl, { authorization: 'Bearer expired' });
    expect(expired.status).toBe(401);

    // a fresh token must not receive the cached failure of the expired one
    const renewed = await requestServices(serverUrl, { authorization: 'Bearer renewed' });
    expect(renewed.status).toBe(200);
    expect(upstream.isDone()).toBe(true);
  });

  it('calls upstream again once the cached entry has expired', async () => {
    const upstream = nock(discoveryUrl).get('/services').times(2).reply(200, services);
    const serverUrl = await startServer();
    vi.useFakeTimers({ toFake: ['Date'] });

    await requestServices(serverUrl);
    // successful responses are reused for 60 seconds
    vi.setSystemTime(Date.now() + 60_001);
    const refreshed = await requestServices(serverUrl);

    expect(refreshed.headers.get('x-fusion-discovery-cache')).toBeNull();
    expect(upstream.isDone()).toBe(true);
  });
});
