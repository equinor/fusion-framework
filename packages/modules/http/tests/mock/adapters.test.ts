import { describe, expect, it, vi } from 'vitest';

import { createOpenApiMockMiddleware } from '../../src/mock/create-open-api-mock-middleware';

describe('createOpenApiMockMiddleware', () => {
  it('answers a matching request without calling next', async () => {
    const middleware = createOpenApiMockMiddleware({
      resolve: async ({ method, path }) =>
        method === 'GET' && path === '/pets/1'
          ? { status: 200, mock: { id: '1', name: 'Rex' } }
          : undefined,
    });
    const next = vi.fn();

    const response = await middleware('http://localhost/pets/1', { method: 'GET' }, next);

    expect(response instanceof Response ? response.status : undefined).toBe(200);
    expect(response instanceof Response ? await response.json() : undefined).toEqual({
      id: '1',
      name: 'Rex',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('falls through to next when the OpenApiMock has no matching operation', async () => {
    const middleware = createOpenApiMockMiddleware({ resolve: async () => undefined });
    const fallback = Response.json({ ok: true });
    const next = vi.fn(async () => fallback);

    const response = await middleware('http://localhost/unknown', { method: 'GET' }, next);

    expect(next).toHaveBeenCalledWith('http://localhost/unknown', { method: 'GET' });
    expect(response).toBe(fallback);
  });

  it('defaults to GET when init has no method', async () => {
    const resolve = vi.fn(async () => undefined);
    const middleware = createOpenApiMockMiddleware({ resolve });

    await middleware(
      'http://localhost/pets/1',
      {},
      vi.fn(async () => Response.json(null)),
    );

    expect(resolve).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', path: '/pets/1' }),
    );
  });

  it('forwards query parameters to resolve()', async () => {
    const middleware = createOpenApiMockMiddleware({
      resolve: async ({ query }) => ({ status: 200, mock: query }),
    });

    const response = await middleware('http://localhost/items?page=2', { method: 'GET' }, vi.fn());

    expect(response instanceof Response ? await response.json() : undefined).toEqual({
      page: '2',
    });
  });
});
