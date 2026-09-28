import { createServer, request as httpRequest } from 'node:http';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { createRouter } from '../discovery/create-router.js';
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
      headers: {
        origin: 'http://localhost:3000',
        'access-control-request-method': 'GET',
        'access-control-request-headers': 'authorization, content-type',
      },
    });
    const response = await fetch(`${url}/pet-store/pets/1`, {
      headers: { origin: 'http://localhost:3000' },
    });

    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('access-control-allow-methods')).toContain('GET');
    expect(preflight.headers.get('access-control-allow-headers')).toBe(
      'authorization, content-type',
    );
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');
    expect(response.headers.get('access-control-allow-credentials')).toBe('true');
  });

  it.each([
    'https://attacker.example',
    'null',
    'http://localhost.attacker.example',
    'http://localhost:3000/',
    'http://localhost:3000/path',
  ])('rejects control-plane requests from untrusted origin %s', async (origin) => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();

    const preflight = await fetch(`${url}/@fusion-mock/auth/token`, {
      method: 'OPTIONS',
      headers: {
        origin,
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type',
      },
    });
    const response = await fetch(`${url}/@fusion-mock/auth/user`, {
      method: 'PUT',
      headers: { origin, 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'attacker' }),
    });

    await expect(preflight.clone().json()).resolves.toEqual({
      error: 'Origin is not allowed for mock-server control requests',
    });
    expect(preflight.status).toBe(403);
    expect(preflight.headers.get('access-control-allow-origin')).toBeNull();
    expect(preflight.headers.get('access-control-allow-credentials')).toBeNull();
    expect(response.status).toBe(403);
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
    expect(response.headers.get('access-control-allow-credentials')).toBeNull();
  });

  it.each([
    'http://localhost:3000',
    'http://localhost:5173',
    'https://localhost:8443',
    'http://127.0.0.1:4173',
    'http://[::1]:3000',
  ])('allows loopback origin %s to read its session token', async (origin) => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();
    const configured = await fetch(`${url}/@fusion-mock/auth/user`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'trusted-user' }),
    });
    const cookie = configured.headers.getSetCookie()[0]?.split(';')[0];

    const response = await fetch(`${url}/@fusion-mock/auth/token`, {
      method: 'POST',
      headers: { origin, cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ scopes: ['api://trusted/.default'] }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe(origin);
    expect(response.headers.get('access-control-allow-credentials')).toBe('true');
    await expect(response.json()).resolves.toMatchObject({ status: 'issued' });
  });

  it('allows an explicitly configured non-loopback origin to read its session token', async () => {
    const origin = 'https://trusted.example';
    server = createMockServer({ allowedOrigins: [origin] }).use(fixturesDir);
    const { url } = await server.start();
    const configured = await fetch(`${url}/@fusion-mock/auth/user`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'trusted-user' }),
    });
    const cookie = configured.headers.getSetCookie()[0]?.split(';')[0];

    const response = await fetch(`${url}/@fusion-mock/auth/token`, {
      method: 'POST',
      headers: { origin, cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ scopes: ['api://trusted/.default'] }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe(origin);
    expect(response.headers.get('access-control-allow-credentials')).toBe('true');
    await expect(response.json()).resolves.toMatchObject({ status: 'issued' });
  });

  it('rejects non-canonical allowed origins before startup', () => {
    expect(() => createMockServer({ allowedOrigins: ['http://localhost:3000/path'] })).toThrow(
      'must be an exact origin',
    );
  });

  it('routes an ordinary OPTIONS request to its OpenAPI operation', async () => {
    const document = {
      openapi: '3.0.0',
      info: { title: 'Options', version: '1' },
      paths: {
        '/capabilities': {
          options: {
            operationId: 'getCapabilities',
            responses: {
              '200': {
                content: {
                  'application/json': { schema: { type: 'object' } },
                },
              },
            },
          },
        },
      },
    };
    server = createMockServer().use([createService('options-service', document)]);
    const { url } = await server.start();

    const response = await fetch(`${url}/options-service/capabilities`, { method: 'OPTIONS' });

    expect(response.status).toBe(200);
  });

  it('supports PATCH and OPTIONS middleware route shorthands', async () => {
    const document = {
      openapi: '3.0.0',
      info: { title: 'Middleware methods', version: '1' },
      paths: {},
    };
    const service = createService('middleware-methods', document).middleware((router) => {
      router.patch('/resource', (_req, res, { body }) => {
        res.json({ method: 'PATCH', body });
      });
      router.options('/resource', (_req, res) => {
        res.statusCode = 204;
        res.end();
      });
    });
    server = createMockServer().use([service]);
    const { url } = await server.start();

    const patchResponse = await fetch(`${url}/middleware-methods/resource`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled: true }),
      headers: { 'content-type': 'application/json' },
    });
    const optionsResponse = await fetch(`${url}/middleware-methods/resource`, {
      method: 'OPTIONS',
    });

    expect(patchResponse.status).toBe(200);
    await expect(patchResponse.json()).resolves.toEqual({
      method: 'PATCH',
      body: { enabled: true },
    });
    expect(optionsResponse.status).toBe(204);
  });

  it('matches decoded route parameters after exact routes and exposes parsed request context', async () => {
    const document = {
      openapi: '3.0.0',
      info: { title: 'Parameterized middleware', version: '1' },
      paths: {},
    };
    const service = createService('scoped', document).middleware((router) => {
      router.get('/accounts/:accountIdentifier/assignments', (req, res, context) => {
        res.json({
          source: 'parameterized',
          accountIdentifier: context.params.accountIdentifier,
          pathname: context.url.pathname,
          filters: context.query.getAll('filter'),
          requestUrl: req.url,
          identity: context.identity,
        });
      });
      router.get('/accounts/me/assignments', (_req, res) => {
        res.json({ source: 'exact' });
      });
    });
    server = createMockServer().use([service]);
    const { url } = await server.start();

    const exact = await fetch(`${url}/scoped/accounts/me/assignments`);
    const malformedParameter = await fetch(`${url}/scoped/accounts/%ZZ/assignments`);
    const parameterized = await fetch(
      `${url}/scoped/accounts/account%2Fwith%20spaces/assignments?filter=active&filter=owned`,
      { headers: { authorization: 'Bearer not-a-jwt' } },
    );
    const missing = await fetch(`${url}/scoped/accounts/anonymous/assignments`);
    const unsupportedToken = [
      Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url'),
      Buffer.from(JSON.stringify({ oid: 'real-user' })).toString('base64url'),
      'real-signature',
    ].join('.');
    const unsupported = await fetch(`${url}/scoped/accounts/unsupported/assignments`, {
      headers: { authorization: `Bearer ${unsupportedToken}` },
    });
    await expect(exact.json()).resolves.toEqual({ source: 'exact' });
    expect(malformedParameter.status).toBe(404);
    await expect(parameterized.json()).resolves.toEqual({
      source: 'parameterized',
      accountIdentifier: 'account/with spaces',
      pathname: '/accounts/account%2Fwith%20spaces/assignments',
      filters: ['active', 'owned'],
      requestUrl: '/scoped/accounts/account%2Fwith%20spaces/assignments?filter=active&filter=owned',
      identity: { status: 'malformed' },
    });
    await expect(missing.json()).resolves.toMatchObject({
      identity: { status: 'missing' },
    });
    await expect(unsupported.json()).resolves.toMatchObject({
      identity: { status: 'unsupported' },
    });
  });

  it('preserves exact-path behavior for trailing delimiters in direct router usage', async () => {
    const router = createRouter();
    let routeError: unknown;
    router.get('/ping', (_req, res) => res.json({ matched: true }));
    const routeServer = createServer((request, response) => {
      router
        .handle(request, response)
        .then((handled) => {
          // Direct router consumers decide the fallback when no exact route matches.
          if (!handled) {
            response.statusCode = 404;
            response.end();
          }
        })
        .catch((error: unknown) => {
          routeError = error;
          response.statusCode = 500;
          response.end('Internal server error');
        });
    });
    await new Promise<void>((resolve) => routeServer.listen(0, '127.0.0.1', resolve));
    const address = routeServer.address();
    // A listening TCP server always exposes a structured address for the test request.
    if (!address || typeof address === 'string') {
      throw new Error('Expected the router test server to expose a TCP address');
    }

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/ping/`);

      expect(routeError).toBeUndefined();
      expect(response.status).toBe(404);
    } finally {
      await new Promise<void>((resolve, reject) => {
        routeServer.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  it('resolves concurrent middleware requests from session-scoped mock identities', async () => {
    const document = {
      openapi: '3.0.0',
      info: { title: 'Authenticated middleware', version: '1' },
      paths: {},
    };
    const service = createService('resources', document).middleware((router) => {
      router.get('/resources/:resourceId', (_req, res, { identity, params }) => {
        // Only supported mock-auth tokens expose normalized identity claims.
        if (identity.status !== 'authenticated') {
          res.statusCode = 401;
          res.json(identity);
          return;
        }
        res.json({
          resourceId: params.resourceId,
          userId: identity.userId,
          sessionId: identity.sessionId,
          roles: identity.claims.roles,
        });
      });
    });
    server = createMockServer().use([service]);
    const { url } = await server.start();

    const firstSession = await fetch(`${url}/@fusion-mock/auth/user`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'first-user', claims: { roles: ['reader'] } }),
    });
    const secondSession = await fetch(`${url}/@fusion-mock/auth/user`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'second-user', claims: { roles: ['owner'] } }),
    });
    const firstCookie = firstSession.headers.getSetCookie()[0]?.split(';')[0];
    const secondCookie = secondSession.headers.getSetCookie()[0]?.split(';')[0];
    const [firstTokenResponse, secondTokenResponse] = await Promise.all([
      fetch(`${url}/@fusion-mock/auth/token`, {
        method: 'POST',
        headers: { cookie: firstCookie, 'content-type': 'application/json' },
        body: JSON.stringify({ scopes: ['api://resources/.default'] }),
      }),
      fetch(`${url}/@fusion-mock/auth/token`, {
        method: 'POST',
        headers: { cookie: secondCookie, 'content-type': 'application/json' },
        body: JSON.stringify({ scopes: ['api://resources/.default'] }),
      }),
    ]);
    const firstToken = (await firstTokenResponse.json()) as { token: string };
    const secondToken = (await secondTokenResponse.json()) as { token: string };

    const [firstResource, secondResource, cookieAuthenticatedResource] = await Promise.all([
      fetch(`${url}/resources/resources/shared`, {
        headers: { authorization: `Bearer ${firstToken.token}` },
      }),
      fetch(`${url}/resources/resources/shared`, {
        headers: { authorization: `Bearer ${secondToken.token}` },
      }),
      fetch(`${url}/resources/resources/proxied`, {
        headers: {
          authorization: 'Bearer proxy-replacement-token',
          cookie: firstCookie,
        },
      }),
    ]);
    const cookieOnlyResource = await fetch(`${url}/resources/resources/anonymous`, {
      headers: { cookie: firstCookie },
    });

    await expect(firstResource.json()).resolves.toEqual({
      resourceId: 'shared',
      userId: 'first-user',
      sessionId: expect.any(String),
      roles: ['reader'],
    });
    await expect(secondResource.json()).resolves.toEqual({
      resourceId: 'shared',
      userId: 'second-user',
      sessionId: expect.any(String),
      roles: ['owner'],
    });
    await expect(cookieAuthenticatedResource.json()).resolves.toEqual({
      resourceId: 'proxied',
      userId: 'first-user',
      sessionId: expect.any(String),
      roles: ['reader'],
    });
    expect(cookieOnlyResource.status).toBe(401);
    await expect(cookieOnlyResource.json()).resolves.toEqual({ status: 'missing' });
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

  it('isolates users by browser session and issues tokens for requested scopes', async () => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();

    const normalPut = await fetch(`${url}/@fusion-mock/auth/user`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'normal-user' }),
    });
    const administratorPut = await fetch(`${url}/@fusion-mock/auth/user`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        userId: 'administrator',
        claims: { roles: ['Demand.Admin'] },
      }),
    });
    const normalCookie = normalPut.headers.getSetCookie()[0]?.split(';')[0];
    const administratorCookie = administratorPut.headers.getSetCookie()[0]?.split(';')[0];

    const [normalResolution, administratorResolution] = await Promise.all([
      fetch(`${url}/@fusion-mock/auth/token`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: normalCookie,
        },
        body: JSON.stringify({ scopes: ['api://application/.default'] }),
      }),
      fetch(`${url}/@fusion-mock/auth/token`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: administratorCookie,
        },
        body: JSON.stringify({ scopes: ['api://application/.default'] }),
      }),
    ]);

    const normalBody = (await normalResolution.json()) as { status: string; token: string };
    const administratorBody = (await administratorResolution.json()) as {
      status: string;
      token: string;
    };
    const normalClaims = JSON.parse(
      Buffer.from(normalBody.token.split('.')[1], 'base64url').toString('utf8'),
    ) as Record<string, unknown>;
    const administratorClaims = JSON.parse(
      Buffer.from(administratorBody.token.split('.')[1], 'base64url').toString('utf8'),
    ) as Record<string, unknown>;

    expect(normalBody.status).toBe('issued');
    expect(normalClaims).toMatchObject({
      oid: 'normal-user',
      aud: 'api://application',
      scp: 'api://application/.default',
    });
    expect(administratorBody.status).toBe('issued');
    expect(administratorClaims).toMatchObject({
      oid: 'administrator',
      roles: ['Demand.Admin'],
    });
  });

  it('switches and resets a session bearer token without exposing token diagnostics', async () => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();
    const configured = await fetch(`${url}/@fusion-mock/auth/user`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'normal-user' }),
    });
    const cookie = configured.headers.getSetCookie()[0]?.split(';')[0];

    await fetch(`${url}/@fusion-mock/auth/user`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ userId: 'administrator', name: 'Administrator' }),
    });
    const metadata = await fetch(`${url}/@fusion-mock/auth/user`, {
      headers: { cookie },
    });
    expect(await metadata.json()).toEqual({
      configured: true,
      user: {
        userId: 'administrator',
        name: 'Administrator',
      },
    });

    await fetch(`${url}/@fusion-mock/auth/user`, {
      method: 'DELETE',
      headers: { cookie },
    });
    const reset = await fetch(`${url}/@fusion-mock/auth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ scopes: ['scope'] }),
    });
    await expect(reset.json()).resolves.toEqual({ status: 'missing' });
  });

  it('rejects invalid user selection and empty token scopes', async () => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();

    const invalidUser = await fetch(`${url}/@fusion-mock/auth/user`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: 'real-credential' }),
    });
    const invalidScopes = await fetch(`${url}/@fusion-mock/auth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scopes: [] }),
    });

    expect(invalidUser.status).toBe(400);
    expect(invalidScopes.status).toBe(400);
  });

  it.each([99, 600])('rejects an override with invalid HTTP status %i', async (status) => {
    server = createMockServer().use(fixturesDir);
    const { url } = await server.start();

    const response = await fetch(`${url}/@fusion-mock/pet-store/getPetById`, {
      method: 'POST',
      body: JSON.stringify({ status, mock: { error: 'invalid override' } }),
    });

    expect(response.status).toBe(400);
    const unchanged = await fetch(`${url}/pet-store/pets/1`);
    expect(unchanged.status).toBe(200);
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

  it('rejects a concurrent start() call', async () => {
    server = createMockServer().use(fixturesDir);

    const firstStart = server.start();

    await expect(server.start()).rejects.toThrow('start() was already called');
    await expect(firstStart).resolves.toMatchObject({ url: expect.stringMatching(/^http:\/\//) });
  });

  it('returns a valid URL when listening on an IPv6 host', async () => {
    server = createMockServer().use(fixturesDir);

    const { url } = await server.start({ host: '::1' });

    expect(new URL(url).hostname).toBe('[::1]');
  });

  it('allows close() to be called repeatedly', async () => {
    server = createMockServer().use(fixturesDir);
    await server.start();

    await server.close();

    await expect(server.close()).resolves.toBeUndefined();
    expect(server.url).toBeUndefined();
  });
});
