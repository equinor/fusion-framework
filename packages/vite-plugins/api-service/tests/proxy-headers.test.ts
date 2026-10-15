import { afterEach, describe, expect, it } from 'vitest';
import { createServer, type ViteDevServer } from 'vite';
import nock from 'nock';

import {
  createProxyHandler,
  DEFAULT_VALUES,
  plugin as apiServicePlugin,
  type ApiDataProcessor,
  type ApiRoute,
} from '../src';

type Service = { name: string; uri: string };

const discoveryUrl = 'http://localhost:668';
const serviceUrl = 'http://localhost:3201';
const headers = { 'X-Fusion-Dev-Server-Version': '9.9.9', 'X-Fusion-Mock': 'false' };

/** Exposes each discovered service as a proxy route under its name. */
const generateRoutes: ApiDataProcessor<Service[], Service[]> = (data) => {
  // One proxy route per service, so route-proxied requests can be asserted too
  const routes = data.map(
    (service): ApiRoute => ({
      match: (path) => path.startsWith(`/${service.name}`),
      proxy: { target: service.uri, rewrite: (path) => path.replace(`/${service.name}`, '') },
    }),
  );
  return { data, routes };
};

describe('api-service plugin proxy headers', () => {
  let server: ViteDevServer | undefined;

  const startServer = async (routes?: ApiRoute[]): Promise<string> => {
    server = await createServer({
      configFile: false,
      plugins: [
        apiServicePlugin(
          {
            proxyHandler: createProxyHandler(discoveryUrl, generateRoutes),
            routes,
          },
          { headers },
        ),
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

  it('adds the headers to service discovery and generated route requests', async () => {
    const discovery = nock(discoveryUrl)
      .get('/services')
      .matchHeader('x-fusion-dev-server-version', '9.9.9')
      .matchHeader('x-fusion-mock', 'false')
      .reply(200, [{ name: 'people', uri: serviceUrl }]);
    const service = nock(serviceUrl)
      .get('/api/persons')
      .matchHeader('x-fusion-dev-server-version', '9.9.9')
      .reply(200, { ok: true });
    const serverUrl = await startServer();

    const services = await fetch(new URL(`${DEFAULT_VALUES.SERVICES_PATH}/services`, serverUrl));
    expect(services.status).toBe(200);
    const proxied = await fetch(
      new URL(`${DEFAULT_VALUES.API_PATH}/people/api/persons`, serverUrl),
    );
    expect(await proxied.json()).toEqual({ ok: true });

    expect(discovery.isDone()).toBe(true);
    expect(service.isDone()).toBe(true);
  });

  it("lets a route's own proxy headers override the shared headers", async () => {
    const upstream = nock(serviceUrl)
      .get('/greeting')
      .matchHeader('x-fusion-mock', 'route-value')
      .matchHeader('x-fusion-dev-server-version', '9.9.9')
      .reply(200, { ok: true });
    const serverUrl = await startServer([
      {
        match: '/greeting',
        proxy: { target: serviceUrl, headers: { 'X-Fusion-Mock': 'route-value' } },
      },
    ]);

    const response = await fetch(new URL(`${DEFAULT_VALUES.API_PATH}/greeting`, serverUrl));
    expect(response.status).toBe(200);
    expect(upstream.isDone()).toBe(true);
  });
});
