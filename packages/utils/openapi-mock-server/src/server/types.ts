import type { IncomingMessage, ServerResponse } from 'node:http';

import type { OpenApiMock } from '@equinor/fusion-openapi-mock';
import type { ServiceMockDefinition } from '../discovery/discover-services.js';

/** A registered mock source: an already-resolved definition group, a bundled preset name (e.g. `'fusion'`), or a directory to scan. */
export type MockSource = ServiceMockDefinition[] | string;

/** Options for {@link createMockServer}. */
export interface CreateMockServerOptions {
  /** Seeds every service's faked responses, so the same document/fields/seed always fake the same values. */
  seed?: number;
}

/** Options for {@link MockServerHandle.start}. */
export interface StartOptions {
  /** Port to listen on; `0` (the default) lets the OS assign a free one. */
  port?: number;
  /** Hostname to bind to (default: `localhost`). */
  host?: string;
}

/** A one-off override registered through {@link MockServerHandle["override"]} or the `/@fusion-mock/:service/:operationId` route. */
export interface MockOverride {
  /** Overrides the operation's declared status; keeps the generated baseline's status when omitted. */
  status?: number;
  /** The response body to serve instead of the generated baseline. */
  mock: unknown;
}

/**
 * A mock server: add sources with {@link use}, then {@link start} it once —
 * mirrors `setupServer()`/`server.use()` from Mock Service Worker, so
 * layering sources and steering a specific response both read the same way
 * whether driven from Node (a test) or over HTTP (Playwright).
 */
export interface MockServerHandle {
  /**
   * Registers a mock source, in ascending precedence — later `use()` calls
   * override earlier ones' services by key. Resolved lazily by {@link start},
   * so this never touches the filesystem itself.
   *
   * @param source - A directory to scan, a bundled preset name (e.g. `'fusion'`), or an already-resolved definition group.
   * @returns `this`, for chaining.
   * @throws If called after {@link start} (or after the first request through {@link requestListener}).
   */
  use(source: MockSource): MockServerHandle;
  /**
   * Registers a mock source keyed by service key (e.g. `fusionPreset()`'s own return value) —
   * sugar for `use(Object.values(source))`, so a caller can also reach into one
   * service's own `ServiceBuilder` (e.g. to register `middleware`) before passing it here.
   *
   * @param source - Definitions keyed by service key.
   * @returns `this`, for chaining.
   */
  preset(source: Record<string, ServiceMockDefinition>): MockServerHandle;
  /**
   * Resolves every registered source and starts listening.
   *
   * @param options - See {@link StartOptions}.
   * @returns The origin the server is listening on.
   */
  start(options?: StartOptions): Promise<{ url: string }>;
  /** The origin the server is listening on, or `undefined` before {@link start}. */
  readonly url: string | undefined;
  /** Stops listening and releases the port. */
  close(): Promise<void>;
  /**
   * A plain `(req, res)` request handler for the same routes {@link start}
   * would serve — mountable into a server the caller already runs (Express,
   * Connect, `node:http`) instead of always listening on a separate port.
   * Resolves sources on first use, independently of {@link start}.
   */
  readonly requestListener: (req: IncomingMessage, res: ServerResponse) => void;
  /** Discards every registered override, back to each service's generated baseline. */
  reset(): void;
  /** Registers a one-off override for `operationId` on `serviceKey`, the same way `/@fusion-mock/:service/:operationId` does. */
  override(serviceKey: string, operationId: string, response: MockOverride): void;
}

/** A discovered service, plus its currently active (possibly overridden) mock. */
export interface ServiceState {
  definition: ServiceMockDefinition;
  mock: OpenApiMock;
}
