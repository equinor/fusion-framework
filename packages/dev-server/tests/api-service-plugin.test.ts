import { describe, it, expect, afterAll, vi, afterEach } from 'vitest';

import { createServer, type ViteDevServer } from 'vite';

import nock from 'nock';

import {
  type ApiRoute,
  plugin as apiServicePlugin,
  createProxyHandler,
} from '../src/plugin/api-service';

describe('API Service Vite Plugin - Middleware Route', () => {
  let server: ViteDevServer | undefined;

  const startServer = async (plugin) => {
    server = await createServer({
      plugins: [plugin],
      server: {
        port: 0, // Dynamic port assignment
        host: 'localhost', // Explicitly bind to localhost
      },
    });
    await server.listen();
    return {
      serverUrl: `http://localhost:${server.config.server.port}`,
    };
  };

  // Clean up after all tests
  afterEach(async () => {
    await server?.close();
    nock.cleanAll();
  });

  describe('Routing', () => {
    it('should return mocked response for @api-proxy/api/mock', async () => {
      const mockData = { message: 'Mocked response' };

      const { serverUrl } = await startServer(
        apiServicePlugin({
          routes: [
            {
              match: '/api/mock',
              middleware: (req, res) => {
                expect(req.url).toBe('/api/mock');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(mockData));
              },
            },
          ],
        }),
      );

      const response = await fetch(new URL('/@api-proxy/api/mock', serverUrl));

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockData);
    });

    it('should proxy request to external service', async () => {
      const mockData = { id: 1, title: 'Mocked proxied response' };
      nock('http://localhost:3001').get('/api/posts').reply(200, mockData);

      const { serverUrl } = await startServer(
        apiServicePlugin({
          routes: [
            {
              match: '/api/posts',
              proxy: {
                target: 'http://localhost:3001',
              },
            },
          ],
        }),
      );

      const response = await fetch(new URL('/@api-proxy/api/posts', serverUrl));

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockData);
    });

    it('should transform proxy response', async () => {
      const mockData = { id: 1, title: 'Mocked proxied response' };

      nock('http://localhost:3001').get('/api/posts').reply(200, mockData);

      const responseTransformerMock = vi.fn((data) => {
        return { ...data, processed: true };
      });

      const { serverUrl } = await startServer(
        apiServicePlugin({
          routes: [
            {
              match: '/api/posts',
              proxy: {
                target: 'http://localhost:3001',
                transformResponse: responseTransformerMock,
              },
            },
          ],
        }),
      );

      const response = await fetch(new URL('/@api-proxy/api/posts', serverUrl));

      expect(responseTransformerMock).toHaveBeenCalledTimes(1);

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ...mockData, processed: true });
    });
  });
  describe('Proxy handler', () => {
    type Service = { name: string; uri: string };

    const serviceDiscoveryUrl = 'http://localhost:666';
    const serviceProxyRoute = '/@api-proxy';

    const setupMockServices = (number: number): Array<Service> => {
      const mockServices: Array<Service> = Array.from({ length: number }).map((_, index) => ({
        name: `api_${index}`,
        uri: `http://localhost:300${index}`,
      }));

      // set up mock service discovery
      nock(serviceDiscoveryUrl).get('/services').reply(200, mockServices);

      // set up mock data for each service
      for (const service of mockServices) {
        nock(service.uri).get('/api/posts').reply(200, { service: service.name });
      }
      return mockServices;
    };

    const serviceDiscoveryHandler = (data: Service[]) => {
      const routes = [] as ApiRoute[];
      const services = [] as Service[];
      for (const service of data) {
        const url = new URL(service.uri);
        const proxyUrl = `${serviceProxyRoute}/${service.name}`;
        services.push({ ...service, uri: proxyUrl });
        routes.push({
          match: (path) => path.startsWith(`/${service.name}`),
          proxy: {
            target: url.origin,
            rewrite: (path) => {
              return path.replace(`/${service.name}`, '');
            },
          },
        });
      }
      return { data: services, routes };
    };

    it('should generate routes from proxy handler', async () => {
      const numberOfMockServices = 3;

      // Mock services
      setupMockServices(numberOfMockServices);

      const { serverUrl } = await startServer(
        apiServicePlugin({
          proxyHandler: createProxyHandler(serviceDiscoveryUrl, serviceDiscoveryHandler),
        }),
      );

      const services = await fetch(new URL('/@services/services', serverUrl)).then((res) =>
        res.json(),
      );

      expect(services.length).toBe(numberOfMockServices);

      for (const service of services) {
        const endpoint = new URL(`${service.uri}/api/posts`, serverUrl);
        expect(endpoint).toMatchObject({
          pathname: `${serviceProxyRoute}/${service.name}/api/posts`,
        });

        const response = await fetch(endpoint).then((res) => res.json());
        expect(response).toEqual({ service: service.name });
      }
    });

    it('should allow setting proxy route', async () => {
      const proxyRoute = '/@custom-services';
      setupMockServices(1);
      const { serverUrl } = await startServer(
        apiServicePlugin({
          proxyHandler: createProxyHandler(serviceDiscoveryUrl, serviceDiscoveryHandler, {
            route: proxyRoute,
          }),
        }),
      );
      const request = fetch(new URL(`${proxyRoute}/services`, serverUrl));
      await expect(request).resolves.toMatchObject({ status: 200 });
    });

    it('should allow adding route configuration', async () => {
      const mockProxyRoutes = setupMockServices(1);
      const { serverUrl } = await startServer(
        apiServicePlugin({
          proxyHandler: createProxyHandler(serviceDiscoveryUrl, serviceDiscoveryHandler),
          routes: [
            {
              match: '/api/posts/:id',
              middleware: (req, res) => {
                res.end(`Custom route ${req.params?.id}`);
              },
            },
          ],
        }),
      );
      // prime discovery
      await fetch(new URL('/@services/services', serverUrl));

      const request = fetch(
        new URL(`${serviceProxyRoute}/${mockProxyRoutes[0].name}/api/posts`, serverUrl),
      ).then((res) => res.json());

      await expect(request).resolves.toMatchObject({ service: mockProxyRoutes[0].name });

      const customRoute = fetch(new URL('/@api-proxy/api/posts/99', serverUrl)).then((res) =>
        res.text(),
      );

      expect(await customRoute).toBe('Custom route 99');
    });
  });
});
