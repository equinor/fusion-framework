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
  it('answers the CouchDB server-root lookup locally with an empty 200 instead of forwarding it', async () => {
    const { client, fetch } = createClient();
    const pouchFetch = createHttpClientFetch(client);

    const response = await pouchFetch('https://app-state.invalid/', {});

    expect(fetch).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({});
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

  it('keeps the PouchDB remote id (replication checkpoint input) on the database-URL fallback', async () => {
    const { client, fetch } = createClient();
    const remote = new PouchDB(PLACEHOLDER_DB, {
      fetch: createHttpClientFetch(client),
      skip_setup: true,
    });

    // Must match PouchDB's fallback for a failed/uuid-less root lookup, or existing checkpoints reset.
    expect(await remote.id()).toBe(`${PLACEHOLDER_DB}/`);
    expect(fetch).not.toHaveBeenCalled();
  });
});
