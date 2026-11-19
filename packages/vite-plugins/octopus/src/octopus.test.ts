import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createAppRequestHandler,
  createAppSourceHandler,
  createMockApiHandler,
  type EnsureOctopusState as EnsureState,
  ensureOctopus,
} from './portal-plugin.js';
import { Registry } from './server/registry.js';
import { createOctopusServer, startHealthChecks } from './server/server.js';

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

const register = (octopusUrl: string, appKey: string, body: object) =>
  fetch(`${octopusUrl}/api/apps/${appKey}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('Octopus server', () => {
  const servers: http.Server[] = [];
  let registry: Registry;
  let octopusUrl: string;
  let appUrl: string;
  let appRequests: string[];
  let appAuthorizations: Array<string | undefined>;

  beforeEach(async () => {
    appRequests = [];
    appAuthorizations = [];
    const appServer = http.createServer((req, res) => {
      appRequests.push(req.url ?? '');
      appAuthorizations.push(req.headers.authorization);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ source: 'local' }));
    });
    appUrl = await listen(appServer);

    registry = new Registry();
    const octopus = createOctopusServer({ registry });
    octopusUrl = await listen(octopus);
    servers.push(appServer, octopus);
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await Promise.all(servers.splice(0).map(close));
  });

  it('registers and lists apps', async () => {
    const response = await register(octopusUrl, 'fusion-help', { url: appUrl, instanceId: 'a' });
    const list = await fetch(`${octopusUrl}/api/apps`).then((r) => r.json());

    expect(response.status).toBe(200);
    expect(list).toEqual([expect.objectContaining({ appKey: 'fusion-help', url: appUrl })]);
  });

  it('rejects addresses outside this machine', async () => {
    const response = await register(octopusUrl, 'fusion-help', {
      url: 'http://example.com',
      instanceId: 'a',
    });

    expect(response.status).toBe(400);
  });

  it('keeps a request path starting with // on this machine, and keeps running', async () => {
    const response = await fetch(`${octopusUrl}//[`);

    expect(response.status).toBe(404);
    expect((await fetch(`${octopusUrl}/api/apps`)).status).toBe(200);
  });

  it('rejects an invalid percent encoding in the app key, and keeps running', async () => {
    const response = await fetch(`${octopusUrl}/api/apps/%`);

    expect(response.status).toBe(400);
    expect((await fetch(`${octopusUrl}/api/apps`)).status).toBe(200);
  });

  it.each(['null', '[]', '5', '"text"'])(
    'rejects a registration body of %s, and keeps running',
    async (body) => {
      const response = await fetch(`${octopusUrl}/api/apps/fusion-help`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body,
      });

      expect(response.status).toBe(400);
      expect((await fetch(`${octopusUrl}/api/apps`)).status).toBe(200);
    },
  );

  it('serves the page', async () => {
    const response = await fetch(octopusUrl);

    expect(response.headers.get('content-type')).toContain('text/html');
    expect(await response.text()).toContain('<title>Octopus</title>');
  });

  it("forwards manifest requests to the app's dev server", async () => {
    await register(octopusUrl, 'app-admin', {
      url: appUrl,
      mockUrl: 'http://localhost:4010',
      instanceId: 'a',
    });

    const response = await fetch(`${octopusUrl}/proxy/persons/me/apps/app-admin`);

    expect(await response.json()).toEqual({ source: 'local' });
    expect(response.headers.get('x-octopus')).toBe('hit');
    expect(response.headers.get('x-octopus-mock')).toBe('http://localhost:4010');
    expect(appRequests).toEqual(['/@fusion-api/apps/persons/me/apps/app-admin']);
  });

  it("forwards config requests to the app's dev server, without the query", async () => {
    await register(octopusUrl, 'app-admin', { url: appUrl, instanceId: 'a' });

    const response = await fetch(`${octopusUrl}/proxy/apps/app-admin/builds/1.2.3/config?x=1`);

    expect(response.headers.get('x-octopus')).toBe('hit');
    expect(appRequests).toEqual(['/@fusion-api/apps/apps/app-admin/builds/1.2.3/config']);
  });

  it('answers a miss for a config request with an unexpected version', async () => {
    await register(octopusUrl, 'app-admin', { url: appUrl, instanceId: 'a' });

    const response = await fetch(
      `${octopusUrl}/proxy/apps/app-admin/builds/1.0.0%2F..%2F..%2F@fs/config`,
    );

    expect(response.headers.get('x-octopus')).toBe('miss');
    expect(appRequests).toEqual([]);
  });

  describe('requests addressed to another host', () => {
    /** Sends a request with the given `Host` header, which `fetch` does not allow setting. */
    const requestAs = (host: string, path: string) =>
      new Promise<number>((resolve, reject) => {
        const { port } = new URL(octopusUrl);
        http
          .get({ host: '127.0.0.1', port, path, headers: { host } }, (res) => {
            res.resume();
            resolve(res.statusCode ?? 0);
          })
          .on('error', reject);
      });

    it.each(['/', '/api/apps', '/proxy/persons/me/apps/app-admin'])(
      'refuses %s, e.g. from a web page using DNS rebinding',
      async (path) => {
        await register(octopusUrl, 'app-admin', { url: appUrl, instanceId: 'a' });

        expect(await requestAs('attacker.example:2000', path)).toBe(403);
        expect(await requestAs('localhost:2000@attacker.example', path)).toBe(403);
        expect(appRequests).toEqual([]);
      },
    );

    it.each(['localhost:2000', '127.0.0.1:2000', '[::1]:2000'])('answers %s', async (host) => {
      expect(await requestAs(host, '/api/apps')).toBe(200);
    });
  });

  it("redirects script requests to the app's dev server", async () => {
    await register(octopusUrl, 'fusion-chat', { url: appUrl, instanceId: 'a' });

    const response = await fetch(
      `${octopusUrl}/proxy/bundles/apps/fusion-chat/0.1.2/Users/me/src/index.ts`,
      { redirect: 'manual' },
    );

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(`${appUrl}/Users/me/src/index.ts`);
  });

  it('answers a miss for apps that are not registered', async () => {
    const response = await fetch(`${octopusUrl}/proxy/persons/me/apps/fusion-tasks`);

    expect(response.status).toBe(404);
    expect(response.headers.get('x-octopus')).toBe('miss');
  });

  it('removes an app whose dev server stopped, and answers a miss', async () => {
    await register(octopusUrl, 'fusion-help', { url: 'http://localhost:1', instanceId: 'a' });

    const response = await fetch(`${octopusUrl}/proxy/persons/me/apps/fusion-help`);

    expect(response.headers.get('x-octopus')).toBe('miss');
    expect(registry.get('fusion-help')).toBeUndefined();
  });

  it('refuses heartbeats from a process unregistered by hand', async () => {
    await register(octopusUrl, 'fusion-help', { url: appUrl, instanceId: 'a' });

    const removed = await fetch(`${octopusUrl}/api/apps/fusion-help`, { method: 'DELETE' });
    const heartbeat = await register(octopusUrl, 'fusion-help', { url: appUrl, instanceId: 'a' });
    const restarted = await register(octopusUrl, 'fusion-help', { url: appUrl, instanceId: 'b' });

    expect(removed.status).toBe(204);
    expect(heartbeat.status).toBe(410);
    expect(restarted.status).toBe(200);
  });

  it('serves a mock dev server started next to a normal one, and falls back when it stops', async () => {
    const handler = createAppSourceHandler(octopusUrl);
    const portal = http.createServer((req, res) => void handler(req, res, () => res.end()));
    servers.push(portal);
    const portalUrl = await listen(portal);
    const source = () => fetch(`${portalUrl}/octopus/apps/app-admin`).then((r) => r.json());

    await register(octopusUrl, 'app-admin', { url: appUrl, instanceId: 'normal' });
    await register(octopusUrl, 'app-admin', {
      url: appUrl,
      mockUrl: 'http://localhost:4010',
      instanceId: 'mock',
    });
    // The normal dev server keeps sending heartbeats.
    await register(octopusUrl, 'app-admin', { url: appUrl, instanceId: 'normal' });
    const whileBothRun = await source();

    await fetch(`${octopusUrl}/api/apps/app-admin?instanceId=mock`, { method: 'DELETE' });
    const afterMockStops = await source();

    expect(whileBothRun).toMatchObject({ source: 'mock' });
    expect(afterMockStops).toMatchObject({ source: 'local' });
  });

  it('lets an app unregister its own entry only', async () => {
    await register(octopusUrl, 'fusion-help', { url: appUrl, instanceId: 'a' });

    const other = await fetch(`${octopusUrl}/api/apps/fusion-help?instanceId=b`, {
      method: 'DELETE',
    });
    const own = await fetch(`${octopusUrl}/api/apps/fusion-help?instanceId=a`, {
      method: 'DELETE',
    });
    const reRegistered = await register(octopusUrl, 'fusion-help', {
      url: appUrl,
      instanceId: 'a',
    });

    expect(other.status).toBe(404);
    expect(own.status).toBe(204);
    expect(reRegistered.status).toBe(200);
  });

  describe('portal route', () => {
    /** Runs the route behind a server; `next()` answers 299 so the test can tell. */
    const startPortal = async (url = octopusUrl) => {
      const route = createAppRequestHandler(url, () => {});
      const portal = http.createServer((req, res) =>
        route(req, res, () => {
          res.writeHead(299);
          res.end('next');
        }),
      );
      servers.push(portal);
      return listen(portal);
    };

    it('serves registered apps from Octopus', async () => {
      await register(octopusUrl, 'fusion-help', { url: appUrl, instanceId: 'a' });
      const portalUrl = await startPortal();

      const response = await fetch(`${portalUrl}/apps/persons/me/apps/fusion-help`);

      expect(await response.json()).toEqual({ source: 'local' });
    });

    it("does not pass the portal's token on to Octopus or the app's dev server", async () => {
      await register(octopusUrl, 'fusion-help', { url: appUrl, instanceId: 'a' });
      const portalUrl = await startPortal();

      await fetch(`${portalUrl}/apps/persons/me/apps/fusion-help`, {
        headers: { authorization: 'Bearer real-token' },
      });

      expect(appAuthorizations).toEqual([undefined]);
    });

    it('falls back to CI for apps Octopus does not serve', async () => {
      const portalUrl = await startPortal();

      const response = await fetch(`${portalUrl}/apps/persons/me/apps/fusion-tasks`);

      expect(response.status).toBe(299);
    });

    it('falls back to CI when Octopus is not running', async () => {
      const portalUrl = await startPortal('http://localhost:1');

      const response = await fetch(`${portalUrl}/apps/persons/me/apps/fusion-help`);

      expect(response.status).toBe(299);
    });

    it('leaves other apps API requests to CI without asking Octopus', async () => {
      const portalUrl = await startPortal('http://localhost:1');

      const response = await fetch(`${portalUrl}/apps/persons/me/apps/fusion-help/settings`);

      expect(response.status).toBe(299);
    });
  });

  describe('app source route', () => {
    /** Runs the status route behind a server, the way the dev server calls it. */
    const appSource = async (appKey: string, url = octopusUrl) => {
      const handler = createAppSourceHandler(url);
      const portal = http.createServer((req, res) => void handler(req, res, () => res.end()));
      servers.push(portal);
      const portalUrl = await listen(portal);
      return fetch(`${portalUrl}/octopus/apps/${appKey}`).then((r) => r.json());
    };

    it('reports local and mock apps with their addresses', async () => {
      await register(octopusUrl, 'fusion-help', { url: appUrl, instanceId: 'a' });
      await register(octopusUrl, 'app-admin', {
        url: appUrl,
        mockUrl: 'http://localhost:4010',
        instanceId: 'b',
      });

      await expect(appSource('fusion-help')).resolves.toEqual({ source: 'local', url: appUrl });
      await expect(appSource('app-admin')).resolves.toEqual({
        source: 'mock',
        url: appUrl,
        mockUrl: 'http://localhost:4010',
      });
    });

    it('reports CI for apps Octopus does not serve', async () => {
      await expect(appSource('fusion-tasks')).resolves.toEqual({ source: 'ci' });
    });

    it('reports CI when Octopus is not running', async () => {
      await expect(appSource('fusion-help', 'http://localhost:1')).resolves.toEqual({
        source: 'ci',
      });
    });

    it('rejects an invalid percent encoding in the app key', async () => {
      const handler = createAppSourceHandler(octopusUrl);
      const portal = http.createServer((req, res) => void handler(req, res, () => res.end()));
      servers.push(portal);
      const portalUrl = await listen(portal);

      const response = await fetch(`${portalUrl}/octopus/apps/%`);

      expect(response.status).toBe(400);
    });
  });
});

describe('ensureOctopus', () => {
  const cleanup: Array<() => Promise<void>> = [];

  afterEach(async () => {
    vi.unstubAllEnvs();
    await Promise.all(cleanup.splice(0).map((stop) => stop()));
  });

  /** Finds a free port by listening on port 0 and closing again. */
  const freePort = async () => {
    const server = http.createServer();
    const url = await listen(server);
    await close(server);
    return url;
  };

  it('starts Octopus when nothing answers', async () => {
    const octopusUrl = await freePort();
    const state: EnsureState = {};
    const logs: string[] = [];

    const status = await ensureOctopus(octopusUrl, { log: (line) => logs.push(line), state });
    if (state.running) {
      cleanup.push(state.running.close);
    }

    expect(status).toBe('started');
    expect(await fetch(`${octopusUrl}/api/apps`).then((r) => r.json())).toEqual([]);
    expect(logs).toEqual([`🐙 Octopus at ${octopusUrl} (started by the portal)`]);
  });

  it('uses an Octopus that already runs', async () => {
    const octopus = createOctopusServer({ registry: new Registry() });
    const octopusUrl = await listen(octopus);
    cleanup.push(() => close(octopus));
    const state: EnsureState = {};

    await expect(ensureOctopus(octopusUrl, { log: () => {}, state })).resolves.toBe('running');
    expect(state.running).toBeUndefined();
  });

  it('does not mistake another program on the port for Octopus', async () => {
    const other = http.createServer((_req, res) => res.end('<html>something else</html>'));
    const otherUrl = await listen(other);
    cleanup.push(() => close(other));

    await expect(ensureOctopus(otherUrl, { log: () => {}, state: {} })).resolves.toBe('port-taken');
  });
});

describe('startHealthChecks', () => {
  it('removes apps that stopped answering', async () => {
    vi.useFakeTimers();
    const registry = new Registry();
    registry.register('fusion-help', { url: 'http://localhost:5007', instanceId: 'a' });
    registry.register('app-admin', { url: 'http://localhost:5001', instanceId: 'b' });
    const events: string[] = [];

    const stop = startHealthChecks({
      registry,
      reachable: async (url) => url.endsWith(':5001'),
      onEvent: (event) => events.push(`${event.type} ${event.app.appKey}`),
    });
    await vi.advanceTimersByTimeAsync(2000);
    stop();
    vi.useRealTimers();

    expect(registry.list().map(({ appKey }) => appKey)).toEqual(['app-admin']);
    expect(events).toEqual(['unreachable fusion-help']);
  });
});

describe('mock API route', () => {
  const servers: http.Server[] = [];
  /** What the Octopus stand-in answers; tests change it between requests. */
  let octopusAnswer: { status: number; apps: object[] };
  let octopusUrl: string;
  let mockUrl: string;
  let portalUrl: string;

  beforeEach(async () => {
    const mock = http.createServer((req, res) => {
      res.end(
        req.url === '/@fusion-mock/discovery' ? JSON.stringify([{ key: 'people' }]) : 'mocked',
      );
    });
    mockUrl = await listen(mock);

    octopusAnswer = { status: 200, apps: [] };
    const octopus = http.createServer((_req, res) => {
      res.writeHead(octopusAnswer.status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(octopusAnswer.apps));
    });
    octopusUrl = await listen(octopus);

    const handler = createMockApiHandler(octopusUrl);
    const portal = http.createServer((req, res) => void handler(req, res, () => res.end('ci')));
    portalUrl = await listen(portal);
    servers.push(mock, octopus, portal);
  });

  afterEach(async () => {
    await Promise.all(servers.splice(0).map(close));
  });

  const request = (appKey: string) =>
    fetch(`${portalUrl}/people/persons/me`, { headers: { 'x-fusion-app': appKey } });

  it('sends requests to a mock instance as soon as it is active', async () => {
    octopusAnswer.apps = [{ appKey: 'my-app', url: 'http://localhost:5173' }];
    expect(await (await request('my-app')).text()).toBe('ci');

    octopusAnswer.apps = [{ appKey: 'my-app', url: 'http://localhost:5174', mockUrl }];

    expect(await (await request('my-app')).text()).toBe('mocked');
  });

  it.each([
    [
      'answers an error',
      () => {
        octopusAnswer.status = 500;
      },
    ],
    ['stops', () => close(servers[1])],
  ])(
    'answers 502 for an app last seen in mock mode when Octopus %s, and sends other apps to CI',
    async (_case, breakOctopus) => {
      octopusAnswer.apps = [{ appKey: 'mock-app', url: 'http://localhost:5173', mockUrl }];
      expect(await (await request('mock-app')).text()).toBe('mocked');

      await breakOctopus();
      const mockApp = await request('mock-app');
      const otherApp = await request('other-app');

      expect(mockApp.status).toBe(502);
      expect(await mockApp.json()).toEqual({
        error: expect.stringContaining('cannot confirm it still is'),
      });
      expect(await otherApp.text()).toBe('ci');
    },
  );
});
