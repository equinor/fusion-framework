import { firstValueFrom, from } from 'rxjs';
import type { ObservableInput } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { createRouterMiddleware } from '../../src/mock/create-router-middleware';

const next = async (): Promise<Response> => new Response(null, { status: 599 });

// HttpMiddleware may return an ObservableInput, so tests can't assume the result is a Response.
const toResponse = (result: Response | ObservableInput<Response>): Promise<Response> =>
  result instanceof Response ? Promise.resolve(result) : firstValueFrom(from(result));

describe('createRouterMiddleware', () => {
  it('answers a matching route without calling next', async () => {
    const middleware = createRouterMiddleware('https://api.example.com', (router) => {
      router.get('/items', () => Response.json([{ id: 1 }]));
    });

    const response = await toResponse(
      middleware('https://api.example.com/items', { method: 'GET' }, next),
    );

    await expect(response.json()).resolves.toEqual([{ id: 1 }]);
  });

  it('extracts path parameters from a `:param` segment', async () => {
    const middleware = createRouterMiddleware('https://api.example.com', (router) => {
      router.get('/items/:id', ({ params }) => Response.json({ id: params.id }));
    });

    const response = await toResponse(
      middleware('https://api.example.com/items/42', { method: 'GET' }, next),
    );

    await expect(response.json()).resolves.toEqual({ id: '42' });
  });

  it('falls through to next when no route matches', async () => {
    const middleware = createRouterMiddleware('https://api.example.com', (router) => {
      router.get('/items', () => Response.json([]));
    });

    const response = await toResponse(
      middleware('https://api.example.com/unknown', { method: 'GET' }, next),
    );

    expect(response.status).toBe(599);
  });

  it('falls through to next when the method does not match', async () => {
    const middleware = createRouterMiddleware('https://api.example.com', (router) => {
      router.get('/items', () => Response.json([]));
    });

    const response = await toResponse(
      middleware('https://api.example.com/items', { method: 'POST' }, next),
    );

    expect(response.status).toBe(599);
  });

  it('falls through to next for a request to a different origin', async () => {
    const middleware = createRouterMiddleware('https://api.example.com', (router) => {
      router.get('/items', () => Response.json([]));
    });

    const response = await toResponse(
      middleware('https://other.example.com/items', { method: 'GET' }, next),
    );

    expect(response.status).toBe(599);
  });

  it('matches non-overlapping routes independently of registration order', async () => {
    const middleware = createRouterMiddleware('https://api.example.com', (router) => {
      router.get('/items/:id/relations', () => Response.json({ from: 'relations' }));
      router.get('/items/:id', () => Response.json({ from: 'single' }));
    });

    const response = await toResponse(
      middleware('https://api.example.com/items/1/relations', { method: 'GET' }, next),
    );

    await expect(response.json()).resolves.toEqual({ from: 'relations' });
  });

  it('the first registered route wins when two patterns both match', async () => {
    const middleware = createRouterMiddleware('https://api.example.com', (router) => {
      router.get('/items/:id', () => Response.json({ from: 'first' }));
      router.get('/items/:id', () => Response.json({ from: 'second' }));
    });

    const response = await toResponse(
      middleware('https://api.example.com/items/1', { method: 'GET' }, next),
    );

    await expect(response.json()).resolves.toEqual({ from: 'first' });
  });

  it('`.on` matches any method when none is given', async () => {
    const middleware = createRouterMiddleware('https://api.example.com', (router) => {
      router.on(undefined, '/items', () => Response.json({ ok: true }));
    });

    const response = await toResponse(
      middleware('https://api.example.com/items', { method: 'DELETE' }, next),
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('exposes query parameters through `url.searchParams`', async () => {
    const middleware = createRouterMiddleware('https://api.example.com', (router) => {
      router.get('/items', ({ url }) => Response.json({ search: url.searchParams.get('q') }));
    });

    const response = await toResponse(
      middleware('https://api.example.com/items?q=needle', { method: 'GET' }, next),
    );

    await expect(response.json()).resolves.toEqual({ search: 'needle' });
  });

  it('strips a non-root base path before matching the route template', async () => {
    const middleware = createRouterMiddleware('https://api.example.com/v1', (router) => {
      router.get('/items', () => Response.json({ ok: true }));
    });

    const response = await toResponse(
      middleware('https://api.example.com/v1/items', { method: 'GET' }, next),
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
