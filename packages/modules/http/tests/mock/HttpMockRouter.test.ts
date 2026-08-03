import { describe, expect, it } from 'vitest';

import { HttpMockRouter } from '../../src/mock/HttpMockRouter';

describe('HttpMockRouter', () => {
  it('answers a request from a middleware registered with .use', async () => {
    const router = new HttpMockRouter();
    router.use(() => Response.json({ ok: true }));

    const response = await router.resolve('http://localhost/anything', {});

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it('runs middleware in registration order, stopping at the first that answers', async () => {
    const router = new HttpMockRouter();
    const calls: string[] = [];
    router.use(() => {
      calls.push('first');
      return undefined;
    });
    router.use(() => {
      calls.push('second');
      return Response.json({ from: 'second' });
    });
    router.use(() => {
      calls.push('third');
      return Response.json({ from: 'third' });
    });

    const response = await router.resolve('http://localhost/x', {});

    expect(calls).toEqual(['first', 'second']);
    expect(await response.json()).toEqual({ from: 'second' });
  });

  it('matches .get/.post/.put/.patch/.delete by method', async () => {
    const router = new HttpMockRouter();
    router
      .get('/items', () => Response.json('get'))
      .post('/items', () => Response.json('post'))
      .put('/items', () => Response.json('put'))
      .patch('/items', () => Response.json('patch'))
      .delete('/items', () => Response.json('delete'));

    // Verify every convenience method registers the correct HTTP method.
    for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) {
      const response = await router.resolve('http://localhost/items', { method });
      expect(await response.json()).toBe(method.toLowerCase());
    }
  });

  it('matches a method case-insensitively', async () => {
    const router = new HttpMockRouter();
    router.on('get', '/items', () => Response.json('ok'));

    const response = await router.resolve('http://localhost/items', { method: 'get' });

    expect(await response.json()).toBe('ok');
  });

  it('matches a string match as a substring of the resolved URL', async () => {
    const router = new HttpMockRouter();
    router.get('/items', () => Response.json('matched'));

    const response = await router.resolve('http://localhost/api/items/42', {});
    await expect(response.json()).resolves.toBe('matched');

    await expect(router.resolve('http://localhost/api/other', {})).rejects.toThrow(
      /No mock handler matched/,
    );
  });

  it('matches a RegExp against the full resolved URL', async () => {
    const router = new HttpMockRouter();
    router.get(/\/items\/\d+$/, () => Response.json('matched'));

    await expect((await router.resolve('http://localhost/items/42', {})).json()).resolves.toBe(
      'matched',
    );
    await expect(router.resolve('http://localhost/items/abc', {})).rejects.toThrow(
      /No mock handler matched/,
    );
  });

  it('throws naming the method and URL when no middleware answers', async () => {
    const router = new HttpMockRouter();

    await expect(router.resolve('http://localhost/missing', { method: 'GET' })).rejects.toThrow(
      'No mock handler matched GET http://localhost/missing.',
    );
  });

  it('clones the request per middleware so each can read the body independently', async () => {
    const router = new HttpMockRouter();
    const seenBodies: string[] = [];
    router.use(async (request) => {
      seenBodies.push(await request.clone().text());
      return undefined;
    });
    router.use(async (request) => {
      seenBodies.push(await request.text());
      return Response.json({ ok: true });
    });

    await router.resolve('http://localhost/x', { method: 'POST', body: 'hello' });

    expect(seenBodies).toEqual(['hello', 'hello']);
  });

  it('forgets every registered middleware after reset()', async () => {
    const router = new HttpMockRouter();
    router.use(() => Response.json({ ok: true }));

    router.reset();

    await expect(router.resolve('http://localhost/x', {})).rejects.toThrow(
      /No mock handler matched/,
    );
  });
});
