import { describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { HttpMiddlewareHandler } from '../src/lib/operators';
import type { HttpMiddleware } from '../src/lib/operators';

const terminal = (): Promise<Response> => Promise.resolve(Response.json('from-network'));

describe('HttpMiddlewareHandler', () => {
  it('calls the terminal step when no middleware is registered', async () => {
    const handler = new HttpMiddlewareHandler();

    const response = await firstValueFrom(handler.process('https://api.example.com', {}, terminal));

    await expect(response.json()).resolves.toBe('from-network');
  });

  it('runs registered middleware outermost-first, wrapping the terminal step', async () => {
    const handler = new HttpMiddlewareHandler();
    const order: string[] = [];

    const trace =
      (name: string): HttpMiddleware =>
      async (uri, init, next) => {
        order.push(`${name}-before`);
        const response = await next(uri, init);
        order.push(`${name}-after`);
        return response;
      };

    handler.use(trace('outer'));
    handler.use(trace('inner'));

    await firstValueFrom(handler.process('https://api.example.com', {}, terminal));

    expect(order).toEqual(['outer-before', 'inner-before', 'inner-after', 'outer-after']);
  });

  it('short-circuits when a middleware never calls next', async () => {
    const handler = new HttpMiddlewareHandler();
    handler.use(() => Response.json('from-middleware'));

    const response = await firstValueFrom(handler.process('https://api.example.com', {}, terminal));

    await expect(response.json()).resolves.toBe('from-middleware');
  });

  it('clones registered middleware from another handler without sharing mutations', () => {
    const source = new HttpMiddlewareHandler();
    source.use(() => Response.json('a'));

    const clone = new HttpMiddlewareHandler(source);
    clone.use(() => Response.json('b'));

    expect(source.middleware).toHaveLength(1);
    expect(clone.middleware).toHaveLength(2);
  });
});
