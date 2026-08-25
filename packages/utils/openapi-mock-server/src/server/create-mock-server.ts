import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { mergeServiceDefinitions } from '../discovery/merge-service-definitions.js';
import { buildMock } from './build-mock.js';
import { handleRequest } from './handle-request.js';
import { resolveSource } from './resolve-source.js';
import { sendJson } from './send-json.js';
import type {
  CreateMockServerOptions,
  MockServerHandle,
  MockSource,
  ServiceState,
} from './types.js';

import type { AddressInfo } from 'node:net';

/**
 * Creates a mock server: add sources with `use()`, then `start()` it once —
 * so a test runner like Playwright can point a service-discovery URL at one
 * address and drive per-test overrides directly, either over HTTP or, in a
 * Node test, straight through `reset()`/`override()` on the same handle.
 *
 * @remarks
 * Routing, once started:
 * - `GET /@fusion-mock/discovery` — the service-discovery response: each
 *   service's `key` and its own `http://<key>.localhost:<port>` `uri` — a
 *   distinct origin per service, the same shape a real service-discovery
 *   response has, so the default `processServices` proxy needs no overrides.
 * - `GET /@fusion-mock/health` — `200 OK` once the server is ready.
 * - `POST /@fusion-mock/reset` — same as calling `reset()`.
 * - `POST /@fusion-mock/:service/:operationId` — same as calling `override()`;
 *   body is `{ status?: number, mock: unknown }`.
 * - A request to `<key>.localhost` is resolved directly against that
 *   service's mock; a request to `/:service/*` on the server's own host is
 *   resolved the same way, for embedding without a `*.localhost` DNS lookup.
 *
 * A service named `health`, `discovery`, or `reset` is still reachable at its
 * own `/<key>/*` or `<key>.localhost` address — those names are only
 * reserved as subpaths *under* `/@fusion-mock/`, not globally. Only a
 * service literally keyed `@fusion-mock` would be unreachable, since that
 * segment is always routed to the control plane first.
 *
 * @param options - See {@link CreateMockServerOptions}.
 * @returns A {@link MockServerHandle}, not yet listening.
 * @throws If `reset()`/`override()` is called before sources have been resolved (via `start()` or a request).
 * @throws If `use()` is called after sources have already been resolved.
 *
 * @example
 * ```typescript
 * const server = createMockServer({ seed: 42 });
 * server.use('fusion'); // bundled baseline for Fusion's mandatory service keys
 * server.use('./mocks'); // this app's own specs, overriding any baseline key by the same name
 *
 * const { url } = await server.start({ port: 4010 });
 * await server.close();
 * ```
 */
export function createMockServer(options: CreateMockServerOptions = {}): MockServerHandle {
  const { seed } = options;
  const layers: MockSource[] = [];
  let services: Map<string, ServiceState> | undefined;
  let resolving: Promise<Map<string, ServiceState>> | undefined;
  let httpServer: ReturnType<typeof createServer> | undefined;
  let starting = false;
  let url: string | undefined;

  /** Resolves every registered source exactly once, memoizing the in-flight promise so concurrent callers share it. */
  function ensureResolved(): Promise<Map<string, ServiceState>> {
    // Already resolved: reuse the memoized map instead of re-resolving sources.
    if (services) return Promise.resolve(services);
    resolving ??= Promise.all(
      layers
        // resolve every registered source in parallel
        .map((source) => resolveSource(source)),
    ).then((resolvedGroups) => {
      services = new Map(
        mergeServiceDefinitions(...resolvedGroups)
          // key each service by its definition key, so later use() layers override by that key
          .map((definition) => [definition.key, { definition, mock: buildMock(definition, seed) }]),
      );
      return services;
    });
    return resolving;
  }

  /** Guards every method that needs sources to have already been resolved. */
  function requireServices(): Map<string, ServiceState> {
    // Sources aren't resolved yet: fail loudly instead of silently no-op'ing reset()/override().
    if (!services) {
      throw new Error(
        'Call start() (or make one request through requestListener) before reset()/override() on a MockServerHandle.',
      );
    }
    return services;
  }

  const requestListener = (req: IncomingMessage, res: ServerResponse): void => {
    ensureResolved()
      .then((activeServices) => handleRequest(handle, activeServices, req, res, seed))
      .catch((error: unknown) => {
        sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
      });
  };

  const handle: MockServerHandle = {
    use(source) {
      // Sources are only read once, by ensureResolved(); registering one afterward would be a silent no-op.
      if (services || resolving) {
        throw new Error(
          'Call use() before start() (or before the first request) on a MockServerHandle.',
        );
      }
      layers.push(source);
      return handle;
    },

    preset(source) {
      return handle.use(Object.values(source));
    },

    async start(options = {}) {
      // Concurrent or repeated starts would create an orphaned HTTP server that close() could never reach.
      if (httpServer || starting) {
        throw new Error('start() was already called on this MockServerHandle; call close() first.');
      }
      starting = true;
      try {
        await ensureResolved();
        const server = createServer(requestListener);
        httpServer = server;
        const host = options.host ?? 'localhost';
        await new Promise<void>((resolve, reject) => {
          /** Removes the temporary error listener after the server starts successfully. */
          const handleListening = (): void => {
            server.off('error', handleError);
            resolve();
          };
          /** Rejects start() for bind errors instead of leaving an unhandled server error. */
          const handleError = (error: Error): void => {
            server.off('listening', handleListening);
            reject(error);
          };
          server.once('error', handleError);
          server.once('listening', handleListening);
          server.listen(options.port ?? 0, host);
        });
        const address = server.address() as AddressInfo;
        const urlHost = host.includes(':') ? `[${host}]` : host;
        url = `http://${urlHost}:${address.port}`;
        return { url };
      } catch (error) {
        // A failed server never became owned by the returned handle.
        httpServer = undefined;
        throw error;
      } finally {
        starting = false;
      }
    },

    requestListener,

    get url() {
      return url;
    },

    async close() {
      const server = httpServer;
      // Clear ownership before awaiting so repeated or concurrent close() calls are harmless.
      httpServer = undefined;
      url = undefined;
      // Never started (or already closed): nothing to release.
      if (!server) return;
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },

    reset() {
      const activeServices = requireServices();
      // Rebuild every service from its original document, discarding registered overrides.
      for (const [key, state] of activeServices) {
        activeServices.set(key, {
          definition: state.definition,
          mock: buildMock(state.definition, seed),
        });
      }
    },

    override(serviceKey, operationId, response) {
      const activeServices = requireServices();
      const service = activeServices.get(serviceKey);
      // Unknown service key: fail loudly instead of silently registering a dangling override.
      if (!service) {
        throw new Error(`No mocked service registered for "${serviceKey}"`);
      }
      service.mock.register(operationId, async ({ mockResponseForOperation }) => {
        const baseline = await mockResponseForOperation();
        return { status: response.status ?? baseline.status, mock: response.mock };
      });
    },
  };

  return handle;
}

export default createMockServer;
