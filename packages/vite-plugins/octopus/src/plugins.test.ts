import http from 'node:http';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createServer, type ViteDevServer } from 'vite';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { octopusAppPlugin } from './app-plugin.js';
import { octopusPortalPlugin } from './portal-plugin.js';
import { Registry } from './server/registry.js';
import { createOctopusServer } from './server/server.js';

const listen = (server: http.Server) =>
  new Promise<string>((resolve) =>
    server.listen(0, '127.0.0.1', () =>
      resolve(`http://localhost:${(server.address() as AddressInfo).port}`),
    ),
  );

const close = (server: http.Server) =>
  new Promise<void>((resolve) => {
    server.closeAllConnections();
    server.close(() => resolve());
  });

/** Finds a free port by listening on port 0 and closing again. */
const freeUrl = async () => {
  const server = http.createServer();
  const url = await listen(server);
  await close(server);
  return url;
};

describe('Vite plugins', () => {
  const cleanup: Array<() => Promise<unknown>> = [];
  const root = mkdtempSync(join(tmpdir(), 'octopus-plugin-'));

  afterEach(async () => {
    for (const stop of cleanup.splice(0).reverse()) {
      await stop();
    }
  });

  /** Starts a Vite dev server in an empty folder with the given plugin. */
  const startVite = async (plugins: ViteDevServer['config']['plugins']) => {
    const server = await createServer({
      root,
      configFile: false,
      logLevel: 'silent',
      server: { port: 0, host: '127.0.0.1' },
      optimizeDeps: { noDiscovery: true },
      plugins: [...plugins],
    });
    await server.listen();
    cleanup.push(() => server.close());
    const address = server.httpServer?.address() as AddressInfo;
    return { server, url: `http://localhost:${address.port}` };
  };

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  describe('octopusAppPlugin', () => {
    it('registers the app while the dev server runs, and unregisters when it closes', async () => {
      const registry = new Registry();
      const octopus = createOctopusServer({ registry });
      const octopusUrl = await listen(octopus);
      cleanup.push(() => close(octopus));

      const { server, url } = await startVite([
        octopusAppPlugin({
          appKey: 'my-app',
          octopusUrl,
          mockUrl: 'http://localhost:4010',
        }),
      ]);
      await vi.waitFor(() => expect(registry.get('my-app')).toBeDefined());

      expect(registry.get('my-app')).toMatchObject({
        url,
        mockUrl: 'http://localhost:4010',
      });

      await server.close();
      await vi.waitFor(() => expect(registry.get('my-app')).toBeUndefined());
    });

    it('lets portals on this machine load modules across origins, and nobody else', async () => {
      const { url } = await startVite([
        octopusAppPlugin({
          appKey: 'my-app',
          octopusUrl: 'http://localhost:1',
        }),
      ]);

      const portal = await fetch(`${url}/@vite/client`, {
        headers: { origin: 'http://localhost:3000' },
      });
      const otherPortal = await fetch(`${url}/@vite/client`, {
        headers: { origin: 'http://127.0.0.1:3100' },
      });
      const other = await fetch(`${url}/@vite/client`, {
        headers: { origin: 'http://example.com' },
      });

      expect(portal.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');
      expect(otherPortal.headers.get('access-control-allow-origin')).toBe('http://127.0.0.1:3100');
      expect(other.headers.get('access-control-allow-origin')).toBeNull();
    });

    it("gives imported assets the dev server's own address, so they load inside the portal", async () => {
      writeFileSync(join(root, 'logo.png'), 'not really a png');
      writeFileSync(
        join(root, 'uses-logo.js'),
        "import logo from './logo.png';\nexport default logo;\n",
      );
      const { url } = await startVite([
        octopusAppPlugin({ appKey: 'my-app', octopusUrl: 'http://localhost:1' }),
      ]);

      // The import resolves against the module's own address; the address it returns is used in
      // the portal's page, e.g. as an `<img>` source, so it needs the dev server's origin.
      const code = await fetch(`${url}/logo.png?import`).then((r) => r.text());

      expect(code).toContain(`"${url}/logo.png"`);
    });
  });

  describe('octopusPortalPlugin', () => {
    it('starts Octopus when it is not running, and stops it with the dev server', async () => {
      const octopusUrl = await freeUrl();
      const { server } = await startVite([octopusPortalPlugin({ octopusUrl, log: () => {} })]);

      await vi.waitFor(async () => {
        expect(await fetch(`${octopusUrl}/api/apps`).then((r) => r.json())).toEqual([]);
      });

      await server.close();
      await vi.waitFor(async () => {
        await expect(fetch(`${octopusUrl}/api/apps`)).rejects.toThrow();
      });
    });

    it('answers where an app comes from, and leaves other requests to the API proxy', async () => {
      const registry = new Registry();
      const octopus = createOctopusServer({ registry });
      const octopusUrl = await listen(octopus);
      cleanup.push(() => close(octopus));
      registry.register('my-app', { url: 'http://localhost:5173', instanceId: 'a' });

      const fallthrough = {
        name: 'api-proxy-stand-in',
        configureServer: (server: ViteDevServer) => {
          server.middlewares.use('/@fusion-api', (_req, res) => {
            res.statusCode = 299;
            res.end('proxied');
          });
        },
      };
      const { url } = await startVite([
        fallthrough,
        octopusPortalPlugin({ octopusUrl, log: () => {} }),
      ]);

      const source = await fetch(`${url}/@fusion-api/octopus/apps/my-app`).then((r) => r.json());
      const other = await fetch(`${url}/@fusion-api/apps/persons/me/apps/other-app`);

      expect(source).toEqual({ source: 'local', url: 'http://localhost:5173' });
      expect(other.status).toBe(299);
    });

    it("sends an app's API requests to its mock server, for the services it mocks", async () => {
      const mockRequests: Array<{ url?: string; authorization?: string; body: string }> = [];
      const mock = http.createServer((req, res) => {
        if (req.url === '/@fusion-mock/discovery') {
          res.end(JSON.stringify([{ key: 'people', uri: 'http://people.localhost' }]));
          return;
        }
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          mockRequests.push({ url: req.url, authorization: req.headers.authorization, body });
          res.end('mocked');
        });
      });
      const mockUrl = await listen(mock);
      cleanup.push(() => close(mock));

      const registry = new Registry();
      const octopus = createOctopusServer({ registry });
      const octopusUrl = await listen(octopus);
      cleanup.push(() => close(octopus));
      registry.register('mock-app', { url: 'http://localhost:5173', mockUrl, instanceId: 'a' });
      registry.register('local-app', { url: 'http://localhost:5174', instanceId: 'b' });

      const fallthrough = {
        name: 'api-proxy-stand-in',
        configureServer: (server: ViteDevServer) => {
          server.middlewares.use('/@fusion-api', (_req, res) => {
            res.end('ci');
          });
        },
      };
      const { url } = await startVite([
        fallthrough,
        octopusPortalPlugin({ octopusUrl, log: () => {} }),
      ]);
      const request = (path: string, headers: Record<string, string> = {}, body?: string) =>
        fetch(`${url}/@fusion-api${path}`, {
          method: body ? 'POST' : 'GET',
          headers: { authorization: 'Bearer real-token', ...headers },
          body,
        }).then((r) => r.text());

      expect(await request('/people/persons/me?x=1', { 'x-fusion-app': 'mock-app' })).toBe(
        'mocked',
      );
      expect(await request('/people/search', { 'x-fusion-app': 'mock-app' }, '{"q":1}')).toBe(
        'mocked',
      );
      // Services the mock server does not know, other apps and the portal itself go to CI.
      expect(await request('/context/contexts', { 'x-fusion-app': 'mock-app' })).toBe('ci');
      expect(await request('/people/persons/me', { 'x-fusion-app': 'local-app' })).toBe('ci');
      expect(await request('/people/persons/me')).toBe('ci');

      expect(mockRequests).toEqual([
        { url: '/people/persons/me?x=1', authorization: undefined, body: '' },
        { url: '/people/search', authorization: undefined, body: '{"q":1}' },
      ]);
    });

    it.each([
      ['answers an error', 500],
      ['is not running', 0],
    ])(
      "answers 502 for a mock app's requests, instead of sending them to CI, when its mock server %s",
      async (_case, status) => {
        let mockUrl = 'http://localhost:1';
        if (status) {
          const mock = http.createServer((_req, res) => {
            res.writeHead(status);
            res.end();
          });
          mockUrl = await listen(mock);
          cleanup.push(() => close(mock));
        }

        const registry = new Registry();
        const octopus = createOctopusServer({ registry });
        const octopusUrl = await listen(octopus);
        cleanup.push(() => close(octopus));
        registry.register('mock-app', { url: 'http://localhost:5173', mockUrl, instanceId: 'a' });

        const ciRequests: string[] = [];
        const fallthrough = {
          name: 'api-proxy-stand-in',
          configureServer: (server: ViteDevServer) => {
            server.middlewares.use('/@fusion-api', (req, res) => {
              ciRequests.push(req.url ?? '');
              res.end('ci');
            });
          },
        };
        const { url } = await startVite([
          fallthrough,
          octopusPortalPlugin({ octopusUrl, log: () => {} }),
        ]);

        const response = await fetch(`${url}/@fusion-api/people/persons/me`, {
          method: 'DELETE',
          headers: { authorization: 'Bearer real-token', 'x-fusion-app': 'mock-app' },
        });

        expect(response.status).toBe(502);
        expect(await response.json()).toEqual({
          error: expect.stringContaining('mock-app runs in mock mode'),
        });
        expect(ciRequests).toEqual([]);
      },
    );
  });
});
