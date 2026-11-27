import http from 'node:http';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createLogger, createServer, type Plugin, type ViteDevServer } from 'vite';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { octopusAppPlugin } from './app-plugin.js';
import { octopusPortalPlugin } from './portal-plugin.js';
import { Registry } from './server/registry.js';
import { createOctopusServer } from './server/server.js';
import { startOctopus } from './server/start.js';

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

    it("keeps Vite's own CORS from allowing other origins, also with server.cors: true", async () => {
      const server = await createServer({
        root,
        configFile: false,
        logLevel: 'silent',
        server: { port: 0, host: '127.0.0.1', cors: true },
        optimizeDeps: { noDiscovery: true },
        plugins: [octopusAppPlugin({ appKey: 'my-app', octopusUrl: 'http://localhost:1' })],
      });
      await server.listen();
      cleanup.push(() => server.close());
      const address = server.httpServer?.address() as AddressInfo;
      const url = `http://localhost:${address.port}`;
      const allowedFor = async (origin: string) =>
        (await fetch(`${url}/@vite/client`, { headers: { origin } })).headers.get(
          'access-control-allow-origin',
        );

      expect(await allowedFor('http://example.com')).toBeNull();
      // Vite's default rule would allow this one.
      expect(await allowedFor('http://evil.localhost:3000')).toBeNull();
      expect(await allowedFor('http://localhost:3000')).toBe('http://localhost:3000');
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

    it('registers each dev server in a process as its own instance', async () => {
      const registry = new Registry();
      const octopus = createOctopusServer({ registry });
      const octopusUrl = await listen(octopus);
      cleanup.push(() => close(octopus));

      const first = await startVite([octopusAppPlugin({ appKey: 'my-app', octopusUrl })]);
      await vi.waitFor(() => expect(registry.instances()).toHaveLength(1));
      const second = await startVite([octopusAppPlugin({ appKey: 'my-app', octopusUrl })]);
      await vi.waitFor(() => expect(registry.instances()).toHaveLength(2));

      // The dev server started last is active; closing the other one leaves it registered.
      expect(registry.get('my-app')?.url).toBe(second.url);
      await first.server.close();
      await vi.waitFor(() => expect(registry.instances()).toHaveLength(1));
      expect(registry.get('my-app')?.url).toBe(second.url);
    });

    it('does not register a dev server that uses HTTPS, and says why', async () => {
      const registry = new Registry();
      const octopus = createOctopusServer({ registry });
      const octopusUrl = await listen(octopus);
      cleanup.push(() => close(octopus));
      const warnings: string[] = [];
      const logger = createLogger('silent');
      logger.warn = (message) => void warnings.push(message);

      const server = await createServer({
        root,
        configFile: false,
        customLogger: logger,
        // No certificate is needed: the plugin decides when the server starts listening.
        server: { port: 0, host: '127.0.0.1', https: {} },
        optimizeDeps: { noDiscovery: true },
        plugins: [octopusAppPlugin({ appKey: 'my-app', octopusUrl })],
      });
      await server.listen();
      cleanup.push(() => server.close());

      await vi.waitFor(() => expect(warnings.join('\n')).toContain('uses HTTPS'));
      expect(registry.instances()).toEqual([]);
    });

    it('builds the source scan patterns with / also from a Windows path', () => {
      const plugin = octopusAppPlugin({
        appKey: 'my-app',
        octopusUrl: 'http://localhost:1',
        sourceDir: 'apps\\my-app\\src',
      });
      const config = (plugin.config as (config: object) => { optimizeDeps: { entries: string[] } })(
        {},
      );

      expect(config.optimizeDeps.entries).toEqual([
        'apps/my-app/src/**/*.{ts,tsx,js,jsx}',
        '!apps/my-app/src/**/*.d.ts',
        '!apps/my-app/src/**/*.test.*',
      ]);
    });
  });

  describe('octopusPortalPlugin', () => {
    /** Starts a portal dev server with the plugin, once it forwards requests to Octopus. */
    const startPortal = async (octopusUrl: string, fallthrough: Plugin) => {
      const lines: string[] = [];
      const portal = await startVite([
        fallthrough,
        octopusPortalPlugin({ octopusUrl, log: (line) => lines.push(line) }),
      ]);
      await vi.waitFor(() =>
        expect(lines.join('\n')).toMatch(
          /Octopus at .* \((already running|started by the portal)\)/,
        ),
      );
      return portal;
    };

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

    it('starts its own Octopus when the one it used stops, e.g. after a Vite restart', async () => {
      const octopusUrl = await freeUrl();
      // Run by someone else, e.g. the dev server Vite replaces on a restart.
      const other = await startOctopus(Number(new URL(octopusUrl).port), () => {});
      const lines: string[] = [];
      const { server } = await startVite([
        octopusPortalPlugin({ octopusUrl, log: (line) => lines.push(line), checkMs: 50 }),
      ]);
      await vi.waitFor(() => expect(lines.join('\n')).toContain('(already running)'));

      await other.close();

      await vi.waitFor(() => expect(lines.join('\n')).toContain('(started by the portal)'));
      expect(await fetch(`${octopusUrl}/api/apps`).then((r) => r.json())).toEqual([]);
      // The Octopus it started now lives as long as this dev server.
      await server.close();
      await vi.waitFor(async () => {
        await expect(fetch(`${octopusUrl}/api/apps`)).rejects.toThrow();
      });
    });

    it('turns forwarding off when another program replaces the Octopus it used', async () => {
      const mock = http.createServer((req, res) => {
        res.end(
          req.url === '/@fusion-mock/discovery' ? JSON.stringify([{ key: 'people' }]) : 'mocked',
        );
      });
      const mockUrl = await listen(mock);
      cleanup.push(() => close(mock));
      const octopusUrl = await freeUrl();
      const port = Number(new URL(octopusUrl).port);
      const octopus = await startOctopus(port, () => {});
      await fetch(`${octopusUrl}/api/apps/mock-app`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: mockUrl, mockUrl, instanceId: 'a' }),
      });
      const lines: string[] = [];
      const fallthrough = {
        name: 'api-proxy-stand-in',
        configureServer: (server: ViteDevServer) => {
          server.middlewares.use('/@fusion-api', (_req, res) => {
            res.end('ci');
          });
        },
      };
      // Checks seldom enough that the port is taken again long before the next check.
      const { url } = await startVite([
        fallthrough,
        octopusPortalPlugin({ octopusUrl, log: (line) => lines.push(line), checkMs: 1000 }),
      ]);
      await vi.waitFor(() => expect(lines.join('\n')).toContain('(already running)'));
      const mockRequest = (method = 'GET') =>
        fetch(`${url}/@fusion-api/people/persons/me`, {
          method,
          headers: { 'x-fusion-app': 'mock-app', cookie: 'session=secret' },
        });
      expect(await (await mockRequest()).text()).toBe('mocked');

      await octopus.close();
      const otherRequests: string[] = [];
      const other = http.createServer((req, res) => {
        otherRequests.push(req.url ?? '');
        res.end('<html>not Octopus</html>');
      });
      await new Promise<void>((resolve) => other.listen(port, '127.0.0.1', () => resolve()));
      cleanup.push(() => close(other));
      await vi.waitFor(() => expect(lines.join('\n')).toContain('local apps are off'), {
        timeout: 5000,
      });
      otherRequests.length = 0;

      const manifest = await fetch(`${url}/@fusion-api/apps/persons/me/apps/mock-app`);
      const write = await mockRequest('DELETE');

      expect(await manifest.text()).toBe('ci');
      // The app was in mock mode, so its writes neither reach the other program nor CI.
      expect(write.status).toBe(502);
      expect(otherRequests).toEqual([]);
    });

    it('sends nothing to another program on the Octopus port, and leaves requests to CI', async () => {
      const otherRequests: Array<{ url?: string; authorization?: string }> = [];
      const other = http.createServer((req, res) => {
        otherRequests.push({ url: req.url, authorization: req.headers.authorization });
        res.end('<html>not Octopus</html>');
      });
      const octopusUrl = await listen(other);
      cleanup.push(() => close(other));

      const lines: string[] = [];
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
        octopusPortalPlugin({ octopusUrl, log: (line) => lines.push(line) }),
      ]);
      await vi.waitFor(() =>
        expect(lines.join('\n')).toContain('Something other than Octopus answers'),
      );
      otherRequests.length = 0;

      const headers = { authorization: 'Bearer real-token', 'x-fusion-app': 'my-app' };
      const manifest = await fetch(`${url}/@fusion-api/apps/persons/me/apps/my-app`, { headers });
      const api = await fetch(`${url}/@fusion-api/people/persons/me`, { headers });

      expect(await manifest.text()).toBe('ci');
      expect(await api.text()).toBe('ci');
      expect(otherRequests.filter((request) => request.authorization)).toEqual([]);
      expect(otherRequests.filter((request) => request.url?.startsWith('/proxy'))).toEqual([]);
    });

    it('answers a malformed request path instead of stopping the dev server', async () => {
      const octopusUrl = await freeUrl();
      const fallthrough = {
        name: 'api-proxy-stand-in',
        configureServer: (server: ViteDevServer) => {
          server.middlewares.use('/@fusion-api', (_req, res) => {
            res.end('ci');
          });
        },
      };
      const { url } = await startPortal(octopusUrl, fallthrough);

      const response = await fetch(`${url}/@fusion-api//[`, {
        headers: { 'x-fusion-app': 'my-app' },
      });

      expect(await response.text()).toBe('ci');
      expect((await fetch(`${url}/@fusion-api/octopus/apps/my-app`)).status).toBe(200);
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
      const { url } = await startPortal(octopusUrl, fallthrough);

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
      const { url } = await startPortal(octopusUrl, fallthrough);
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
        const { url } = await startPortal(octopusUrl, fallthrough);

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
