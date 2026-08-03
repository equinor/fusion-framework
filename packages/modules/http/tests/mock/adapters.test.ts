import { describe, expect, it } from 'vitest';

import { fromExpressStyleHandler } from '../../src/mock/adapters/from-express-style-handler';
import { MockExpressResponse } from '../../src/mock/adapters/MockExpressResponse';
import { fromOpenApiMock } from '../../src/mock/adapters/from-open-api-mock';

describe('MockExpressResponse', () => {
  it('resolves done from .json()', async () => {
    const res = new MockExpressResponse();
    res.status(201).json({ id: 1 });

    const response = await res.done;

    expect(response.status).toBe(201);
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(await response.json()).toEqual({ id: 1 });
  });

  it('resolves done from .send() with a string body, defaulting to a text content-type', async () => {
    const res = new MockExpressResponse();
    res.send('plain text');

    const response = await res.done;

    expect(await response.text()).toBe('plain text');
    expect(response.headers.get('content-type')).toBe('text/plain;charset=UTF-8');
  });

  it('resolves done from .send() with a non-string body as JSON', async () => {
    const res = new MockExpressResponse();
    res.send({ ok: true });

    const response = await res.done;

    expect(await response.json()).toEqual({ ok: true });
  });

  it('resolves done from .end() with no body', async () => {
    const res = new MockExpressResponse();
    res.status(204).end();

    const response = await res.done;

    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
  });

  it('ignores a second terminal call, keeping the first response', async () => {
    const res = new MockExpressResponse();
    res.json({ first: true });
    res.json({ second: true });

    expect(await (await res.done).json()).toEqual({ first: true });
  });
});

describe('fromExpressStyleHandler', () => {
  it('maps a Request into { method, path, query, headers, body } for the handler', async () => {
    const middleware = fromExpressStyleHandler((req, res) => {
      res.status(200).json(req);
    });

    const response = await middleware(
      new Request('http://localhost/items/1?verbose=true', {
        headers: { 'x-test': 'yes' },
      }),
    );

    expect(await response?.json()).toEqual(
      expect.objectContaining({
        method: 'GET',
        path: '/items/1',
        query: { verbose: 'true' },
        headers: expect.objectContaining({ 'x-test': 'yes' }),
      }),
    );
  });

  it('parses a JSON request body before handing it to the handler', async () => {
    const middleware = fromExpressStyleHandler((req, res) => {
      res.status(200).json({ received: req.body });
    });

    const response = await middleware(
      new Request('http://localhost/items', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'foo' }),
      }),
    );

    expect(await response?.json()).toEqual({ received: { name: 'foo' } });
  });

  it('answers with whatever status/body the handler sets on the response', async () => {
    const middleware = fromExpressStyleHandler((_req, res) => {
      res.status(404).json({ message: 'not found' });
    });

    const response = await middleware(new Request('http://localhost/missing'));

    expect(response?.status).toBe(404);
    expect(await response?.json()).toEqual({ message: 'not found' });
  });
});

describe('fromOpenApiMock', () => {
  it('resolves a matching request into a JSON Response from the OpenApiMock', async () => {
    const middleware = fromOpenApiMock({
      resolve: async ({ method, path }) =>
        method === 'GET' && path === '/pets/1'
          ? { status: 200, mock: { id: '1', name: 'Rex' } }
          : undefined,
    });

    const response = await middleware(new Request('http://localhost/pets/1'));

    expect(response?.status).toBe(200);
    expect(await response?.json()).toEqual({ id: '1', name: 'Rex' });
  });

  it('declines (returns undefined) when the OpenApiMock has no matching operation', async () => {
    const middleware = fromOpenApiMock({ resolve: async () => undefined });

    await expect(middleware(new Request('http://localhost/unknown'))).resolves.toBeUndefined();
  });

  it('forwards query parameters to resolve()', async () => {
    const middleware = fromOpenApiMock({
      resolve: async ({ query }) => ({ status: 200, mock: query }),
    });

    const response = await middleware(new Request('http://localhost/items?page=2'));

    expect(await response?.json()).toEqual({ page: '2' });
  });
});
