import type {
  ConfigBuilderCallbackArgs,
  ModulesInstanceType,
} from '@equinor/fusion-framework-module';
import type {
  HttpMsalModule,
  IHttpClient,
  IHttpClientProvider,
} from '@equinor/fusion-framework-module-http';
import type { HttpClientMsal } from '@equinor/fusion-framework-module-http/client';
import type {
  ServiceDiscoveryModule,
  IServiceDiscoveryProvider,
} from '@equinor/fusion-framework-module-service-discovery';

import { PouchDbStorage, PouchDbSyncStorage } from './storage/index.js';
import type { IStorage, PouchDbSyncPullOptions } from './storage/index.js';

/** Local PouchDB database name used when no `setStorage` was configured. */
const DEFAULT_DB_NAME = 'app_state';

/** Service-discovery lookup key for the Fusion App State backend. */
const APP_STATE_SERVICE_KEY = 'app-state';

/**
 * Dummy origin used only so PouchDB's (non-WHATWG, `@`-unsafe) URL parser has something
 * to parse - see {@link createHttpClientFetch}. Never actually requested.
 */
const POUCHDB_PLACEHOLDER_ORIGIN = 'https://app-state.invalid';

/**
 * Builds a PouchDB-compatible `fetch` that routes replication requests through the Fusion
 * {@link IHttpClient}, so token acquisition, request/response instrumentation, and any other
 * cross-cutting `IHttpClient` behavior apply to PouchDB's traffic the same way they do for the
 * rest of the app, instead of PouchDB talking to the backend on its own.
 *
 * @remarks
 * PouchDB parses replication URLs with a legacy regex, not the WHATWG `URL` API, which
 * misreads a literal `@` (as used by the dev-server's `/@fusion-api/...` proxy prefix) as
 * a userinfo delimiter and corrupts the parsed host. The remote database is therefore
 * always constructed under {@link POUCHDB_PLACEHOLDER_ORIGIN} (see `createDefaultStorage`),
 * so the only thing that needs forwarding here is the path PouchDB computed relative to it -
 * `client.fetch` resolves that path against its own `uri` the same way `IHttpClient` always does.
 *
 * @param client - The `IHttpClient` used to resolve, authenticate, and execute requests
 * against the app-state service.
 * @returns A `fetch` implementation for `PouchDB.Configuration.RemoteDatabaseConfiguration`.
 */
function createHttpClientFetch(
  client: IHttpClient,
): PouchDB.Configuration.RemoteDatabaseConfiguration['fetch'] {
  return async (url, opts) => {
    // `pathname` already starts with `/` - do not add another slash before it.
    const { pathname, search } = new URL(typeof url === 'string' ? url : url.url);
    const path = `sync${pathname}${search}`;

    return client.fetch(path, { ...opts, cache: 'no-store' });
  };
}

/**
 * Resolves the {@link ServiceDiscoveryModule}'s provider, checking the local module scope
 * first and falling back to the hosting Fusion instance's `ref`. Apps and widgets rarely
 * register `serviceDiscovery` themselves — it's configured once on the portal/framework
 * that hosts them — so `hasModule`/`requireInstance` (local-scope only) alone would miss it.
 *
 * @param init - Module resolution context, including the parent `ref` instance.
 * @returns The resolved service discovery provider, or `undefined` if none is available.
 */
async function resolveServiceDiscovery(
  init: ConfigBuilderCallbackArgs,
): Promise<IServiceDiscoveryProvider | undefined> {
  // prefer a locally-registered instance over the hosting ref's, so a caller can override it.
  if (init.hasModule('serviceDiscovery')) {
    return init.requireInstance('serviceDiscovery');
  }
  return (init.ref as ModulesInstanceType<[ServiceDiscoveryModule]>)?.serviceDiscovery;
}

/**
 * Resolves the {@link HttpMsalModule}'s provider (registered under the `http` module name),
 * checking the local module scope first and falling back to the hosting Fusion instance's
 * `ref` - mirrors {@link resolveServiceDiscovery} since the HTTP client, like service
 * discovery, is normally configured once on the portal/framework rather than by each app or widget.
 *
 * @param init - Module resolution context, including the parent `ref` instance.
 * @returns The resolved HTTP client provider, or `undefined` if none is available.
 */
async function resolveHttpClientProvider(
  init: ConfigBuilderCallbackArgs,
): Promise<IHttpClientProvider<HttpClientMsal> | undefined> {
  // prefer a locally-registered instance over the hosting ref's, so a caller can override it.
  if (init.hasModule('http')) {
    return init.requireInstance('http');
  }
  return (init.ref as ModulesInstanceType<[HttpMsalModule]>)?.http;
}

/**
 * Default {@link IStorage} used by the state module when the consumer never calls
 * `setStorage`, scoped to the `name` set via `setName`. Builds a local PouchDB database
 * and, when a `serviceDiscovery` module is available (locally or on the hosting `ref`
 * instance), upgrades it to sync with the Fusion App State backend (a per-user CouchDB
 * reverse proxy resolved under the `app-state` service key): local writes push live, and
 * remote changes are pulled once a minute and on tab focus rather than over a continuous
 * live connection - see `PouchDbSyncStorage`'s `pull` option.
 *
 * @remarks
 * The Fusion App State backend's published OpenAPI spec only documents its management
 * endpoints — the CouchDB replication path itself is a raw protocol passthrough and is
 * assumed to be `${service.uri}/sync/${name}`. The per-user database is provisioned by
 * the backend, not the client, so `skip_setup: true` is required (see
 * {@link createHttpClientFetch}) - otherwise PouchDB's existence-check PUT hits the
 * passthrough and fails with `400`. Call `setStorage` directly to override this
 * assumption, or to opt out of PouchDB entirely.
 *
 * @param name - The caller-supplied identity (e.g. app key) used to scope local keys
 * and the remote sync path. Required so unrelated callers never share state.
 * @param init - Module resolution context, used to discover `serviceDiscovery` and `http`.
 * @param pull - Overrides for the default pull scheduling (e.g. a shorter `intervalMs` for
 * local preview/testing) - merged over the production default, not replacing it wholesale.
 * @returns The resolved default storage.
 * @throws Never - internal resolution failures are caught and result in a local-only fallback.
 */
export async function createDefaultStorage(
  name: string,
  init: ConfigBuilderCallbackArgs,
  pull?: PouchDbSyncPullOptions,
): Promise<IStorage> {
  const serviceDiscovery = await resolveServiceDiscovery(init);
  // Sync can't be resolved without service discovery; fall back to local-only storage.
  if (!serviceDiscovery) {
    return new PouchDbStorage(DEFAULT_DB_NAME, { key_prefix: name });
  }

  try {
    const [service, httpProvider] = await Promise.all([
      serviceDiscovery.resolveService(APP_STATE_SERVICE_KEY),
      resolveHttpClientProvider(init),
    ]);

    // without the http module there's nothing to build an authenticated client from -
    // let the catch below fall back to local-only storage.
    if (!httpProvider) {
      throw new Error('missing http module');
    }

    const httpClient = httpProvider.createClient({
      baseUri: service.uri,
      defaultScopes: service.scopes,
    });

    return new PouchDbSyncStorage({
      localDb: { name_or_instance: DEFAULT_DB_NAME, options: { key_prefix: name } },
      remoteDb: {
        // must stay `@`-free - service.uri (e.g. dev-server's `/@fusion-api/...`) is
        // applied by `createHttpClientFetch`, never parsed by PouchDB itself.
        name_or_instance: `${POUCHDB_PLACEHOLDER_ORIGIN}/${name}`,
        // the per-user database already exists behind the proxy; skip PouchDB's
        // GET/PUT existence-check dance, which the passthrough answers with 400.
        options: { fetch: createHttpClientFetch(httpClient), skip_setup: true },
      },
      // base options shared by push and the one-shot pulls below - `live`/`retry` apply
      // as-is to the (always-live) push, `_pullOnce` overrides `live: false, retry: false`.
      syncOptions: { live: true, retry: true },
      // At production user counts, a continuous pull connection per idle tab is a lot of
      // concurrently open sockets for a direction that's rarely needed in real time - push
      // stays live so local writes are never delayed, pull just polls instead, and pauses
      // entirely while the tab is hidden.
      pull: { mode: 'visible-interval', refreshOnFocus: true, ...pull },
    });
  } catch (error) {
    // The `app-state` service may not be registered (e.g. in local/dev environments) -
    // fall back to local-only storage rather than failing the whole state module.
    console.warn(
      `[state] Could not resolve '${APP_STATE_SERVICE_KEY}' service, using local-only storage`,
      error,
    );
    return new PouchDbStorage(DEFAULT_DB_NAME, { key_prefix: name });
  }
}

export default createDefaultStorage;
