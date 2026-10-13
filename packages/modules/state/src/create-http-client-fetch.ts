import type { IHttpClient } from '@equinor/fusion-framework-module-http';

/**
 * Builds a PouchDB-compatible `fetch` that routes replication requests through the Fusion
 * {@link IHttpClient}, so token acquisition, request/response instrumentation, and any other
 * cross-cutting `IHttpClient` behavior apply to PouchDB's traffic the same way they do for the
 * rest of the app, instead of PouchDB talking to the Fusion App State backend on its own.
 *
 * @remarks
 * PouchDB parses replication URLs with a legacy regex, not the WHATWG `URL` API, which
 * misreads a literal `@` (as used by the dev-server's `/@fusion-api/...` proxy prefix) as
 * a userinfo delimiter and corrupts the parsed host. The remote database is therefore
 * always constructed under a placeholder origin (see `createDefaultStorage`), so the only
 * thing that needs forwarding here is the path PouchDB computed relative to it -
 * `client.fetch` resolves that path against its own `uri` the same way `IHttpClient` always does.
 *
 * Every path is forwarded, including PouchDB's server-root lookup (`/` → `sync/`), which it
 * makes at the start of each replication to read a server `uuid` for the replication
 * checkpoint ID. The App State backend answers it with its pinned, per-environment `uuid`, so
 * the server - not the client - owns the replication identity.
 *
 * @param client - The `IHttpClient` used to resolve, authenticate, and execute requests
 * against the Fusion App State service.
 * @returns A `fetch` implementation for `PouchDB.Configuration.RemoteDatabaseConfiguration`.
 */
export function createHttpClientFetch(
  client: IHttpClient,
): PouchDB.Configuration.RemoteDatabaseConfiguration['fetch'] {
  return async (url, opts) => {
    // `pathname` already starts with `/` - do not add another slash before it.
    const { pathname, search } = new URL(typeof url === 'string' ? url : url.url);
    return client.fetch(`sync${pathname}${search}`, { ...opts, cache: 'no-store' });
  };
}

export default createHttpClientFetch;
