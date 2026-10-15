import { afterEach, describe, expect, it, vi } from 'vitest';

import { createServer, type ViteDevServer } from 'vite';
import nock from 'nock';

import { DEFAULT_VALUES, plugin as apiServicePlugin } from '../src';

describe('API Service Vite Plugin - response transformation', () => {
  let server: ViteDevServer | undefined;

  const startServer = async (transformResponse: (data: unknown) => unknown) => {
    server = await createServer({
      plugins: [
        apiServicePlugin({
          routes: [
            {
              match: '/api/posts',
              proxy: { target: 'http://localhost:3001', transformResponse },
            },
          ],
        }),
      ],
      server: { port: 0, host: 'localhost' },
    });
    await server.listen();
    return new URL(
      `${DEFAULT_VALUES.API_PATH}/api/posts`,
      `http://localhost:${server.config.server.port}`,
    );
  };

  afterEach(async () => {
    await server?.close();
    nock.cleanAll();
  });

  it('transforms JSON responses and keeps upstream headers', async () => {
    nock('http://localhost:3001').get('/api/posts').reply(200, { id: 1 }, { 'x-upstream': 'yes' });
    const transform = vi.fn((data) => ({ ...(data as object), processed: true }));

    const response = await fetch(await startServer(transform));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 1, processed: true });
    expect(response.headers.get('x-upstream')).toBe('yes');
    expect(response.headers.get('x-proxy-rewrite-target')).toBe('http://localhost:3001');
  });

  it('passes error responses through untouched with their status and headers', async () => {
    nock('http://localhost:3001')
      .get('/api/posts')
      .reply(404, { error: 'missing' }, { 'x-upstream': 'yes' });
    const transform = vi.fn();

    const response = await fetch(await startServer(transform));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'missing' });
    expect(response.headers.get('x-upstream')).toBe('yes');
    expect(transform).not.toHaveBeenCalled();
  });

  it('passes non-JSON responses through untouched with their status and headers', async () => {
    nock('http://localhost:3001')
      .get('/api/posts')
      .reply(201, 'plain text', { 'content-type': 'text/plain', 'x-upstream': 'yes' });
    const transform = vi.fn();

    const response = await fetch(await startServer(transform));

    expect(response.status).toBe(201);
    expect(await response.text()).toBe('plain text');
    expect(response.headers.get('x-upstream')).toBe('yes');
    expect(transform).not.toHaveBeenCalled();
  });
});
