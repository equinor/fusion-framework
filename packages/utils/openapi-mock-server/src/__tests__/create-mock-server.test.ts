import { createServer, request as httpRequest } from 'node:http';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { createService } from '../discovery/create-service.js';
import { createMockServer, type MockServerHandle } from '../server/index.js';

const fixturesDir = fileURLToPath(new URL('./fixtures/mocks', import.meta.url));

describe('createMockServer', () => {
  let server: MockServerHandle | undefined;

  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  it('resolves a faked response from a directory source', async () => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();

    const response = await fetch(`${url}/pet-store/pets/1`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ id: expect.any(String) });
  });

  it('serves a declarative route from a discovered defineService module', async () => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();

    const response = await fetch(`${url}/pet-store/pets`);

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual([
      { id: 'route-pet', name: 'Declarative route' },
    ]);
  });

  it('serves middleware from a discovered defineService module', async () => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();

    const response = await fetch(`${url}/pet-store/middleware`);

    expect(response.status).toBe(203);
    await expect(response.json()).resolves.toEqual({ source: 'middleware' });
  });

  it('serves a discovery response listing each service at its own <key>.localhost origin', async () => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();
    const port = new URL(url).port;

    const response = await fetch(`${url}/@fusion-mock/discovery`);

    await expect(response.json()).resolves.toEqual([
      { key: 'pet-store', uri: `http://pet-store.localhost:${port}` },
    ]);
  });

  it('resolves a request addressed to its own <key>.localhost origin, without a /<key> path prefix', async () => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();
    const port = new URL(url).port;

    const response = await new Promise<{ status: number; body: unknown }>((resolve, reject) => {
      const request = httpRequest(`${url}/pets/1`, {
        headers: { host: `pet-store.localhost:${port}` },
      });
      request.on('response', (incoming) => {
        let body = '';
        incoming.setEncoding('utf8');
        incoming.on('data', (chunk: string) => {
          body += chunk;
        });
        incoming.on('end', () => {
          resolve({ status: incoming.statusCode ?? 0, body: JSON.parse(body) });
        });
      });
      request.on('error', reject);
      request.end();
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: expect.any(String) });
  });

  it('allows browser requests to a service on its own <key>.localhost origin', async () => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();

    const preflight = await fetch(`${url}/pet-store/pets/1`, {
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:3000' },
    });
    const response = await fetch(`${url}/pet-store/pets/1`, {
      headers: { origin: 'http://localhost:3000' },
    });

    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('access-control-allow-methods')).toContain('GET');
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('lets a later use() layer override an earlier one by service key', async () => {
    const overridesDir = fileURLToPath(new URL('./fixtures/overrides', import.meta.url));
    server = createMockServer().use(fixturesDir).use(overridesDir);
    const { url } = await server.start();
    const port = new URL(url).port;

    const response = await fetch(`${url}/@fusion-mock/discovery`);

    await expect(response.json()).resolves.toEqual([
      { key: 'pet-store', uri: `http://pet-store.localhost:${port}` },
    ]);
  });

  it('registers a one-off override, then discards it on reset', async () => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();

    await fetch(`${url}/@fusion-mock/pet-store/getPetById`, {
      method: 'POST',
      body: JSON.stringify({ status: 404, mock: { error: 'not found' } }),
    });

    const overridden = await fetch(`${url}/pet-store/pets/1`);
    expect(overridden.status).toBe(404);
    await expect(overridden.json()).resolves.toEqual({ error: 'not found' });

    await fetch(`${url}/@fusion-mock/reset`, { method: 'POST' });

    const resetResponse = await fetch(`${url}/pet-store/pets/1`);
    expect(resetResponse.status).toBe(200);
  });

  it('responds 404 for a request to an unregistered service', async () => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();

    const response = await fetch(`${url}/unknown-service/1`);

    expect(response.status).toBe(404);
  });

  it('resolves a bundled preset by name', async () => {
    server = createMockServer().use('fusion');
    const { url } = await server.start();

    const response = await fetch(`${url}/@fusion-mock/discovery`);

    const discovered = (await response.json()) as Array<{ key: string }>;
    // every service key the preset registered, sorted for a stable comparison
    expect(discovered.map((service) => service.key).sort()).toEqual([
      'app-state',
      'apps',
      'bookmarks',
      'context',
      'notification',
      'people',
      'portal-config',
      'rolesv2',
    ]);
  });

  it('serves the same routes through requestListener without calling start()', async () => {
    server = createMockServer().use(fixturesDir);
    const embeddingServer = createServer(server.requestListener);
    await new Promise<void>((resolve) => embeddingServer.listen(0, '127.0.0.1', resolve));
    const address = embeddingServer.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    try {
      const response = await fetch(`http://127.0.0.1:${port}/pet-store/pets/1`);
      expect(response.status).toBe(200);
    } finally {
      await new Promise<void>((resolve, reject) =>
        embeddingServer.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });

  it('reset()/override() throw before any source has been resolved', () => {
    server = createMockServer().use(fixturesDir);

    expect(() => server?.reset()).toThrow();
    expect(() => server?.override('pet-store', 'getPetById', { mock: {} })).toThrow();
  });

  it('use() throws once sources have already been resolved', async () => {
    server = createMockServer().use(fixturesDir);
    await server.start();

    expect(() => server?.use(fixturesDir)).toThrow();
  });

  it('matches middleware against a service-relative path on the shared host', async () => {
    const document = { openapi: '3.0.0', info: { title: 'Test', version: '1' }, paths: {} };
    const service = createService('custom', document).middleware((router) => {
      router.get('/ping', (_req, res) => res.json({ status: 'ok' }));
    });
    server = createMockServer().use([service]);
    const { url } = await server.start();

    const response = await fetch(`${url}/custom/ping`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

  it('rejects start() when the requested port is already occupied', async () => {
    const occupyingServer = createServer();
    await new Promise<void>((resolve) => occupyingServer.listen(0, '127.0.0.1', resolve));
    const address = occupyingServer.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    server = createMockServer().use(fixturesDir);

    try {
      await expect(server.start({ host: '127.0.0.1', port })).rejects.toMatchObject({
        code: 'EADDRINUSE',
      });
    } finally {
      await new Promise<void>((resolve, reject) =>
        occupyingServer.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });

  it('allows close() to be called repeatedly', async () => {
    server = createMockServer().use(fixturesDir);
    await server.start();

    await server.close();

    await expect(server.close()).resolves.toBeUndefined();
    expect(server.url).toBeUndefined();
  });
});
