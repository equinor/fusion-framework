import { describe, it, expect, vi } from 'vitest';
import PouchDB from 'pouchdb';
import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import { createHttpClientFetch } from '../create-http-client-fetch.js';

const PLACEHOLDER_DB = 'https://app-state.invalid/reviews';

/**
 * Creates a minimal `IHttpClient` stand-in whose `fetch` is a spy.
 * @param impl - Response factory for forwarded requests.
 * @returns The client and its `fetch` spy.
 */
const createClient = (impl: () => Promise<Response> = async () => new Response('{}')) => {
  const fetch = vi.fn(impl);
  return { client: { fetch } as unknown as IHttpClient, fetch };
};

describe('createHttpClientFetch', () => {
  it('forwards the CouchDB server-root lookup to `sync/` so the backend supplies the server uuid', async () => {
    const { client, fetch } = createClient();
    const pouchFetch = createHttpClientFetch(client);

    await pouchFetch('https://app-state.invalid/', {});

    expect(fetch).toHaveBeenCalledWith('sync/', { cache: 'no-store' });
  });

  it('forwards app-scoped paths under `sync/` with the query string and `no-store` cache', async () => {
    const { client, fetch } = createClient();
    const pouchFetch = createHttpClientFetch(client);

    await pouchFetch(`${PLACEHOLDER_DB}/_changes?since=0&limit=100`, { method: 'GET' });
    await pouchFetch(new Request(`${PLACEHOLDER_DB}/`), { method: 'GET' });

    expect(fetch).toHaveBeenNthCalledWith(1, 'sync/reviews/_changes?since=0&limit=100', {
      method: 'GET',
      cache: 'no-store',
    });
    expect(fetch).toHaveBeenNthCalledWith(2, 'sync/reviews/', { method: 'GET', cache: 'no-store' });
  });

  it('returns app-scoped error responses unchanged', async () => {
    const { client } = createClient(
      async () => new Response('{"error":"unauthorized"}', { status: 401 }),
    );
    const pouchFetch = createHttpClientFetch(client);

    const response = await pouchFetch(`${PLACEHOLDER_DB}/_local/checkpoint`, {});

    expect(response.status).toBe(401);
  });

  it('propagates client failures such as token or network errors', async () => {
    const { client } = createClient(() => Promise.reject(new Error('token acquisition failed')));
    const pouchFetch = createHttpClientFetch(client);

    await expect(pouchFetch(`${PLACEHOLDER_DB}/_bulk_docs`, { method: 'POST' })).rejects.toThrow(
      'token acquisition failed',
    );
  });

  it('builds the PouchDB remote id (replication checkpoint input) from the backend server uuid', async () => {
    const { client } = createClient(
      async () => new Response('{"couchdb":"Welcome","uuid":"0a1b2c3d4e5f60718293a4b5c6d7e8f9"}'),
    );
    const remote = new PouchDB(PLACEHOLDER_DB, { fetch: createHttpClientFetch(client) });

    expect(await remote.id()).toBe('0a1b2c3d4e5f60718293a4b5c6d7e8f9reviews');
  });

  it('lets PouchDB create a missing remote database before the first read', async () => {
    const { client, fetch } = createClient(async () => new Response('{}'));
    fetch
      .mockResolvedValueOnce(new Response('{"error":"not_found"}', { status: 404 }))
      .mockResolvedValueOnce(new Response('{"ok":true}', { status: 201 }));
    const remote = new PouchDB(PLACEHOLDER_DB, { fetch: createHttpClientFetch(client) });

    await remote.info();

    expect(fetch.mock.calls.map(([path, init]) => `${init?.method ?? 'GET'} ${path}`)).toEqual([
      'GET sync/reviews/',
      'PUT sync/reviews/',
      'GET sync/reviews/',
    ]);
  });
});
