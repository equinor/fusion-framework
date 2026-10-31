import { describe, expect, it } from 'vitest';

import { defineService } from '../discovery/define-service.js';
import { createMockServer } from '../index.js';

const schema = { openapi: '3.0.0', info: { title: 'Routes', version: '1' }, paths: {} };

describe('path-to-regexp v9 middleware parameters', () => {
  it.each([
    {
      route: '/:file.:ext',
      path: '/foo.json.html',
      params: { file: 'foo', ext: 'json.html' },
    },
    {
      route: '/files/:file/extensions/:ext',
      path: '/files/foo.json/extensions/html',
      params: { file: 'foo.json', ext: 'html' },
    },
    { route: '/users/:id', path: '/users/42', params: { id: '42' } },
  ])('passes v9 captures for $route to the middleware handler', async ({ route, path, params }) => {
    const server = createMockServer().use([
      defineService({
        key: 'routes',
        serviceDiscovery: 'replace',
        schema,
        middleware: (router) => router.get(route, (_req, res, context) => res.json(context.params)),
      }),
    ]);
    const { url } = await server.start();

    try {
      const response = await fetch(`${url}/routes${path}`);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(params);
    } finally {
      await server.close();
    }
  });

  it('preserves service dispatch normalization of empty path segments', async () => {
    const server = createMockServer().use([
      defineService({
        key: 'routes',
        serviceDiscovery: 'replace',
        schema,
        middleware: (router) => router.get('/files', (_req, res) => res.json({ matched: true })),
      }),
    ]);
    const { url } = await server.start();

    try {
      expect((await fetch(`${url}/routes/files/`)).status).toBe(200);
      expect((await fetch(`${url}/routes/files`)).status).toBe(200);
      expect((await fetch(`${url}/routes/files//`)).status).toBe(200);
    } finally {
      await server.close();
    }
  });
});
