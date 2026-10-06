import { describe, expect, it } from 'vitest';

import { createMockServer } from '../index.js';
import { defineService } from '../discovery/define-service.js';

const schema = { openapi: '3.0.0', info: { title: 'Echo', version: '1' }, paths: {} };

/** Starts a server whose `echo` route reports the parsed body it received. */
async function startEcho() {
  const server = createMockServer().use([
    defineService({
      key: 'echo',
      serviceDiscovery: 'replace',
      schema,
      middleware: (router) =>
        router.post('/echo', (_req, res, { body }) => res.json({ body: body ?? null })),
    }),
  ]);
  const { url } = await server.start();
  return { server, url };
}

describe('middleware route request bodies', () => {
  it.each([
    ['application/json', '{"a":1}', 200, { body: { a: 1 } }],
    ['text/plain;charset=UTF-8', '{"a":1}', 200, { body: { a: 1 } }],
    ['text/plain', 'hello', 200, { body: null }],
    ['application/json', '{"a":', 400, undefined],
    ['application/problem+json', '{"a":', 400, undefined],
    [undefined, '{"a":', 400, undefined],
  ])('handles content-type %s with body %j', async (type, payload, status, expected) => {
    const { server, url } = await startEcho();
    try {
      const response = await fetch(`${url}/echo/echo`, {
        method: 'POST',
        headers: type ? { 'content-type': type } : {},
        body: new Blob([payload]),
      });

      expect(response.status).toBe(status);
      const json = (await response.json()) as Record<string, unknown>;
      if (expected) expect(json).toEqual(expected);
      else expect(json).toMatchObject({ error: { code: 'InvalidJson' } });
    } finally {
      await server.close();
    }
  });
});
