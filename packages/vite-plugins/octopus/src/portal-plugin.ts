import http, { type IncomingMessage, type ServerResponse } from 'node:http';

import type { Plugin } from 'vite';

import { DEFAULT_OCTOPUS_URL } from './server/index.js';
import { parseLocalUrl, portOf, type RegisteredApp } from './server/registry.js';
import { setResponseDeadline } from './server/response-deadline.js';
import { parseAppRequest, parseRequestUrl } from './server/routes.js';
import {
  OCTOPUS_HEADER,
  OCTOPUS_MOCK_HEADER,
  OCTOPUS_REGISTRY,
  PROXY_PREFIX,
} from './server/server.js';
import { type RunningOctopus, startOctopus } from './server/start.js';

/** Connect-style request handler, as used by Vite's dev server. */
export type RequestHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) => void | Promise<void>;

/** What {@link ensureOctopus} found or did. */
export type OctopusStatus =
  /** Octopus already answered at the address, e.g. `ffc octopus` or another portal. */
  | 'running'
  /** Nothing answered, so Octopus was started here. */
  | 'started'
  /** Something other than Octopus answers at the address. */
  | 'port-taken'
  /** Octopus is not running, and the address is not on this machine, so it cannot be started here. */
  | 'not-local';

/** Octopus started by {@link ensureOctopus}, so its owner can stop it. */
export interface EnsureOctopusState {
  running?: RunningOctopus;
}

/** Thrown when something answers at the Octopus address, but not with Octopus's list of apps. */
class NotOctopusError extends Error {}

/**
 * Gets the registered apps from Octopus. Only an answer marked as Octopus's own
 * (`x-octopus: registry`) with a list counts, so another program on the port, even one that
 * answers with a JSON array, is never taken for Octopus and its answer never trusted.
 *
 * @param octopusUrl - Octopus address.
 * @returns The registered apps.
 * @throws {NotOctopusError} When the answer is not Octopus's list of apps.
 * @throws When nothing answers within a second.
 */
const fetchRegisteredApps = async (octopusUrl: string): Promise<RegisteredApp[]> => {
  const response = await fetch(`${octopusUrl}/api/apps`, { signal: AbortSignal.timeout(1000) });
  const body: unknown =
    response.ok && response.headers.get(OCTOPUS_HEADER) === OCTOPUS_REGISTRY
      ? await response.json().catch(() => undefined)
      : undefined;
  if (!Array.isArray(body)) {
    throw new NotOctopusError(`${octopusUrl} answered ${response.status}, but not as Octopus`);
  }
  return body as RegisteredApp[];
};

/** What answers at an Octopus address: Octopus, another program, or nothing. */
type ProbeResult = 'octopus' | 'other' | 'none';

/**
 * Finds out what answers at `octopusUrl`. Only Octopus answers `GET /api/apps` with a list, so
 * another program on the port is not mistaken for it. A program that accepts the connection but
 * does not answer within a second counts as another program.
 *
 * @param octopusUrl - Octopus address.
 * @returns What answers.
 */
const probeOctopus = async (octopusUrl: string): Promise<ProbeResult> => {
  try {
    await fetchRegisteredApps(octopusUrl);
    return 'octopus';
  } catch (error) {
    if (error instanceof NotOctopusError) {
      return 'other';
    }
    // A timeout means a program holds the port without answering; any other failure, e.g. a
    // refused connection, means nothing answers.
    return (error as Error).name === 'TimeoutError' ? 'other' : 'none';
  }
};

/**
 * Makes sure Octopus runs at `octopusUrl`: uses one that already answers, or starts one when
 * nothing does.
 *
 * @param octopusUrl - Octopus address, e.g. `http://localhost:2000`.
 * @param options - Logger, and state that receives the Octopus started here, if any.
 * @returns What was found or done.
 */
export const ensureOctopus = async (
  octopusUrl: string,
  {
    log = (line: string) => console.log(line),
    state = {},
  }: { log?: (line: string) => void; state?: EnsureOctopusState } = {},
): Promise<OctopusStatus> => {
  const portTaken = (): OctopusStatus => {
    log(
      `🐙 Something other than Octopus answers at ${octopusUrl}; local apps are off. Use another Octopus address.`,
    );
    return 'port-taken';
  };

  const found = await probeOctopus(octopusUrl);
  if (found === 'octopus') {
    log(`🐙 Octopus at ${octopusUrl} (already running)`);
    return 'running';
  }
  if (found === 'other') {
    return portTaken();
  }

  const url = parseLocalUrl(octopusUrl);
  if (!url) {
    log(
      `🐙 Octopus is not running at ${octopusUrl}, and it is not on this machine; local apps are off.`,
    );
    return 'not-local';
  }

  try {
    // Listen where clients connect: `[::1]` is IPv6 loopback only, while `localhost` reaches
    // `127.0.0.1` as well.
    const host = url.hostname === '[::1]' ? '::1' : '127.0.0.1';
    state.running = await startOctopus(portOf(url), (line) => log(`octopus: ${line}`), host);
    log(`🐙 Octopus at ${octopusUrl} (started by the portal)`);
    return 'started';
  } catch (error) {
    // Something took the port since the check, e.g. another dev server starting Octopus at the
    // same moment. Only a real Octopus counts as running; anything else must not get requests.
    if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE') {
      if ((await probeOctopus(octopusUrl)) === 'octopus') {
        log(`🐙 Octopus at ${octopusUrl} (already running)`);
        return 'running';
      }
      return portTaken();
    }
    log(`🐙 Failed to start Octopus at ${octopusUrl}: ${(error as Error).message}`);
    return 'not-local';
  }
};

/** Where the portal loads an app from, as answered by the app source handler. */
export interface AppSource {
  /** `local` or `mock` when Octopus serves the app from a dev server, `ci` otherwise. */
  source: 'local' | 'mock' | 'ci';
  /** The app's dev server, for local apps. */
  url?: string;
  /** The app's mock server, for apps in mock mode. */
  mockUrl?: string;
}

/** Path below the API base where the portal UI asks where an app comes from. */
export const APP_SOURCE_PATH = '/octopus/apps';

/**
 * Creates the handler that loads apps registered with Octopus from their local dev server.
 * Paths are below the API base, e.g. `/apps/persons/me/apps/my-app`. Apps Octopus does not
 * know, and every request while Octopus is not running, go on to `next()`, i.e. to CI.
 *
 * @param octopusUrl - Octopus address.
 * @param log - Writes warnings, e.g. about apps in mock mode.
 * @returns The handler.
 */
export const createAppRequestHandler = (
  octopusUrl: string,
  log: (line: string) => void = (line) => console.warn(line),
): RequestHandler => {
  const warnedMockApps = new Set<string>();

  return (req, res, next) => {
    const url = parseRequestUrl(req.url);
    const path = url.pathname.replace(/^\/apps/, '');
    const appRequest = parseAppRequest(path);
    // A local app only answers reads. Writes, e.g. `PUT` of a build's config, go to CI, where
    // they are stored.
    const isRead = req.method === 'GET' || req.method === 'HEAD';
    if (!url.pathname.startsWith('/apps/') || !appRequest || !isRead) {
      next();
      return;
    }

    const target = new URL(`${octopusUrl}${PROXY_PREFIX}${path}${url.search}`);
    // The app's dev server answers without the portal's token, so it never leaves the portal.
    const { authorization: _, ...headers } = req.headers;
    const proxyReq = http.request(
      target,
      { method: req.method, headers: { ...headers, host: target.host } },
      (proxyRes) => {
        if (proxyRes.headers[OCTOPUS_HEADER] !== 'hit') {
          proxyRes.resume();
          next();
          return;
        }

        const mockUrl = proxyRes.headers[OCTOPUS_MOCK_HEADER];
        if (typeof mockUrl === 'string' && !warnedMockApps.has(appRequest.appKey)) {
          warnedMockApps.add(appRequest.appKey);
          log(
            `octopus: ${appRequest.appKey} runs in mock mode; its requests to services its mock server (${mockUrl}) knows go there, the login stays the portal's`,
          );
        }
        res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );
    // Octopus not running: load the app from CI as before.
    proxyReq.on('error', () => {
      if (!res.headersSent) {
        next();
      }
    });
    proxyReq.end();
  };
};

/**
 * Creates the handler that tells the portal UI where an app comes from:
 * `GET <API base>/octopus/apps/<appKey>` answers an {@link AppSource}. Apps Octopus does not
 * serve, and all apps while Octopus is not running, are `ci`.
 *
 * @param octopusUrl - Octopus address.
 * @returns The handler.
 */
export const createAppSourceHandler =
  (octopusUrl: string): RequestHandler =>
  async (req, res, next) => {
    const { pathname } = parseRequestUrl(req.url);
    if (!pathname.startsWith(`${APP_SOURCE_PATH}/`)) {
      next();
      return;
    }

    let appKey: string;
    try {
      appKey = decodeURIComponent(pathname.slice(APP_SOURCE_PATH.length + 1));
    } catch {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid app key' }));
      return;
    }
    let source: AppSource = { source: 'ci' };
    try {
      const apps = await fetchRegisteredApps(octopusUrl);
      const app = apps.find((entry) => entry.appKey === appKey);
      if (app) {
        source = app.mockUrl
          ? { source: 'mock', url: app.url, mockUrl: app.mockUrl }
          : { source: 'local', url: app.url };
      }
    } catch {
      // Octopus is not running, or something else answers, so the app comes from CI.
    }
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify(source));
  };

/** Header the Fusion Framework adds to an app's requests, with the app key. */
export const APP_KEY_HEADER = 'x-fusion-app';

/** How long a mock server's list of services is reused, in milliseconds. */
const CACHE_MS = 2000;

/** Caches the result of `load` for {@link CACHE_MS} per key; failures are not cached. */
const createCache = <T>(load: (key: string) => Promise<T>) => {
  const entries = new Map<string, { value: Promise<T>; expires: number }>();
  return (key: string): Promise<T> => {
    const entry = entries.get(key);
    if (entry && entry.expires > Date.now()) {
      return entry.value;
    }
    const value = load(key);
    entries.set(key, { value, expires: Date.now() + CACHE_MS });
    value.catch(() => entries.delete(key));
    return value;
  };
};

/** Options for {@link createMockApiHandler}. */
export interface MockApiHandlerOptions {
  /**
   * Whether Octopus can be asked now. While it cannot, e.g. because another program has its
   * port, apps last seen in mock mode get a `502` and all other apps go to CI. Defaults to always.
   */
  isAvailable?: () => boolean;
  /**
   * How long, in milliseconds, an app last seen in mock mode stays fail-closed after it is no
   * longer registered. A restarted Octopus lists no apps until their next heartbeat, so the app
   * must not fall through to CI meanwhile. Defaults to 15000, the time Octopus keeps an entry
   * without a heartbeat.
   */
  mockGraceMs?: number;
  /** How long, in milliseconds, to wait for the mock server's response headers. Defaults to 10000. */
  responseTimeoutMs?: number;
}

/** A mock app's server, and since when it is no longer registered, if it is not. */
interface KnownMockApp {
  mockUrl: string;
  missingSince?: number;
}

/** Answers that a request of an app in mock mode cannot go anywhere, rather than to CI. */
const sendMockUnavailable = (res: ServerResponse, error: string): void => {
  res.writeHead(502, { 'content-type': 'application/json', [OCTOPUS_HEADER]: 'mock' });
  res.end(JSON.stringify({ error }));
};

/**
 * Creates the handler that sends API requests from an app in mock mode to its mock server.
 *
 * A request below the API base, e.g. `/people/persons/me`, goes to the mock server
 * (`<mockUrl>/people/persons/me`) when:
 * - its `x-fusion-app` header names an app whose active Octopus entry has a mock server, and
 * - that mock server lists the service (`/@fusion-mock/discovery`).
 *
 * Everything else, including the portal's own requests, goes on to `next()`, i.e. to CI. The
 * portal's token is not sent to the mock server.
 *
 * An app in mock mode never falls back to CI for the services it mocks, since its writes would
 * reach real services with the real token. Its requests get a `502` instead when:
 * - its mock server does not list its services, or sends no response in time;
 * - Octopus cannot be asked, or is not available (`isAvailable`), and the app was in mock mode
 *   at the last answer;
 * - the app was in mock mode but is no longer listed, for up to `mockGraceMs`, e.g. while a
 *   restarted Octopus waits for its next heartbeat.
 *
 * @param octopusUrl - Octopus address.
 * @param options - Availability, grace period and response deadline; see {@link MockApiHandlerOptions}.
 * @returns The handler.
 */
export const createMockApiHandler = (
  octopusUrl: string,
  {
    isAvailable = () => true,
    mockGraceMs = 15_000,
    responseTimeoutMs = 10_000,
  }: MockApiHandlerOptions = {},
): RequestHandler => {
  // Asked for every request, since a mock instance can become active at any time; requests
  // arriving while a lookup is under way share it.
  let pendingLookup: Promise<RegisteredApp[]> | undefined;
  const activeApps = (): Promise<RegisteredApp[]> => {
    pendingLookup ??= fetchRegisteredApps(octopusUrl).finally(() => {
      pendingLookup = undefined;
    });
    return pendingLookup;
  };
  // Apps seen in mock mode, kept while Octopus cannot be asked or no longer lists them.
  const knownMockApps = new Map<string, KnownMockApp>();

  /** Updates the known mock apps from Octopus's answer. */
  const remember = (apps: RegisteredApp[]): void => {
    const now = Date.now();
    const listed = new Map(apps.map((app) => [app.appKey, app]));
    for (const [appKey, known] of knownMockApps) {
      const app = listed.get(appKey);
      if (app && !app.mockUrl) {
        // Registered again without a mock server, so it has left mock mode.
        knownMockApps.delete(appKey);
      } else if (!app) {
        known.missingSince ??= now;
        if (now - known.missingSince > mockGraceMs) {
          knownMockApps.delete(appKey);
        }
      }
    }
    for (const app of apps) {
      if (app.mockUrl) {
        knownMockApps.set(app.appKey, { mockUrl: app.mockUrl });
      }
    }
  };
  const mockServices = createCache(async (mockUrl) => {
    const response = await fetch(`${mockUrl}/@fusion-mock/discovery`, {
      signal: AbortSignal.timeout(1000),
    });
    if (!response.ok) {
      throw new Error(`answered ${response.status}`);
    }
    const services = (await response.json()) as Array<{ key: string }>;
    return new Set(services.map(({ key }) => key));
  });

  return async (req, res, next) => {
    const appKey = req.headers[APP_KEY_HEADER];
    if (typeof appKey !== 'string') {
      next();
      return;
    }

    const url = parseRequestUrl(req.url);
    const service = url.pathname.split('/')[1];
    let mockUrl: string | undefined;
    try {
      if (!isAvailable()) {
        throw new Error('Octopus is not available');
      }
      remember(await activeApps());
      const known = knownMockApps.get(appKey);
      // Not listed now, but recently in mock mode: e.g. Octopus restarted and the app has not
      // sent its next heartbeat yet.
      if (known?.missingSince !== undefined) {
        sendMockUnavailable(
          res,
          `${appKey} was in mock mode (${known.mockUrl}), but is not registered with Octopus at ${octopusUrl} right now`,
        );
        return;
      }
      mockUrl = known?.mockUrl;
    } catch (error) {
      // Without Octopus, an app last seen in mock mode cannot be confirmed to have left it; its
      // requests could reach real services with the real token. Other apps go to CI as usual,
      // so the portal keeps working while Octopus is down.
      const known = knownMockApps.get(appKey);
      if (known) {
        sendMockUnavailable(
          res,
          `${appKey} was in mock mode (${known.mockUrl}), but Octopus at ${octopusUrl} cannot confirm it still is (${(error as Error).message})`,
        );
        return;
      }
    }
    if (!mockUrl || !service) {
      next();
      return;
    }

    let services: Set<string>;
    try {
      services = await mockServices(mockUrl);
    } catch (error) {
      // The app expects mock data. Falling back to CI would send its requests, with the real
      // token, to real services, where a POST or DELETE changes real data.
      sendMockUnavailable(
        res,
        `${appKey} runs in mock mode, but its mock server ${mockUrl} did not list its services (${(error as Error).message})`,
      );
      return;
    }
    // Only services the mock server does not mock go to CI.
    if (!services.has(service)) {
      next();
      return;
    }

    const target = new URL(`${mockUrl.replace(/\/$/, '')}${url.pathname}${url.search}`);
    const { authorization: _, ...headers } = req.headers;
    const proxyReq = http.request(
      target,
      { method: req.method, headers: { ...headers, host: target.host } },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 502, {
          ...proxyRes.headers,
          [OCTOPUS_HEADER]: 'mock',
        });
        proxyRes.pipe(res);
      },
    );
    setResponseDeadline(proxyReq, responseTimeoutMs, `Mock server ${mockUrl}`);
    proxyReq.on('error', (error) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'content-type': 'application/json' });
      }
      res.end(JSON.stringify({ error: `Mock server ${mockUrl} failed: ${error.message}` }));
    });
    req.pipe(proxyReq);
  };
};

/** Options for {@link octopusPortalPlugin}. */
export interface OctopusPortalPluginOptions {
  /** Octopus address. Defaults to `http://localhost:2000`. */
  octopusUrl?: string;
  /** Base path of the portal's API proxy. Defaults to `/@fusion-api`. */
  apiBase?: string;
  /** Writes status and warnings. Defaults to the Vite logger. */
  log?: (line: string) => void;
  /**
   * How often to check, in milliseconds, that an Octopus run by someone else still answers, so
   * the plugin can start its own when it stops. Defaults to 2000.
   */
  checkMs?: number;
}

/**
 * Vite plugin for a portal dev server: loads apps registered with Octopus from their local dev
 * server, and every other app from CI as before.
 *
 * - Manifest, config and script reads (`GET`, `HEAD`) for registered apps are answered through Octopus;
 *   everything else goes on to the portal's API proxy.
 * - `GET <apiBase>/octopus/apps/<appKey>` tells the portal UI whether an app is local, local in
 *   mock mode, or from CI.
 * - API requests from an app in mock mode go to its mock server, for the services it mocks.
 * - When nothing answers at the Octopus address, the plugin starts Octopus, and stops it again
 *   when the dev server closes. While someone else runs it, e.g. `ffc octopus` or the dev server
 *   Vite replaces on a restart, the plugin starts its own once that Octopus stops.
 * - Requests only go to Octopus once it is known to run. While it starts, and when another
 *   program has its port, everything goes to CI. The portal's token is never sent to Octopus.
 *
 * The plugin runs before other plugins (`enforce: 'pre'`), so its handlers come before the API
 * proxy.
 *
 * @param options - Octopus address, API base and logger.
 * @returns A Vite plugin for the portal dev server.
 */
export const octopusPortalPlugin = (options: OctopusPortalPluginOptions = {}): Plugin => {
  const octopusUrl = (options.octopusUrl ?? DEFAULT_OCTOPUS_URL).replace(/\/$/, '');
  const apiBase = options.apiBase ?? '/@fusion-api';

  return {
    name: 'fusion-framework-octopus-portal',
    apply: 'serve',
    enforce: 'pre',

    configureServer(server) {
      const log = options.log ?? ((line: string) => server.config.logger.info(line));

      const state: EnsureOctopusState = {};
      let closed = false;
      // Requests only go to Octopus once it is known to run there. While starting, and when
      // another program has the port or Octopus is not on this machine, everything goes to CI,
      // so no request, and none of the portal's headers, reach an unrelated program.
      let forwarding = false;
      let watch: NodeJS.Timeout | undefined;
      let checking = false;

      const connect = async (): Promise<void> => {
        const status = await ensureOctopus(octopusUrl, { log, state });
        // An Octopus started here lives as long as this dev server.
        if (closed) {
          void state.running?.close();
          return;
        }
        forwarding = status === 'running' || status === 'started';
        // An Octopus run by someone else can stop while this dev server runs. On a restart, Vite
        // creates the new dev server before closing the old one, which then stops the Octopus it
        // started. Watch it, and take over when it is gone.
        if (status === 'running' && !watch) {
          watch = setInterval(() => {
            if (closed || checking || state.running) {
              return;
            }
            checking = true;
            void probeOctopus(octopusUrl)
              .then(async (found) => {
                if (found === 'none') {
                  await connect();
                  return;
                }
                // Another program took the port: send it nothing until Octopus answers again.
                const octopusAnswers = found === 'octopus';
                if (octopusAnswers !== forwarding) {
                  forwarding = octopusAnswers;
                  log(
                    octopusAnswers
                      ? `🐙 Octopus at ${octopusUrl} answers again; local apps are on`
                      : `🐙 Something other than Octopus answers at ${octopusUrl}; local apps are off`,
                  );
                }
              })
              .finally(() => {
                checking = false;
              });
          }, options.checkMs ?? 2000);
          watch.unref();
        }
      };

      void connect();
      server.httpServer?.once('close', () => {
        closed = true;
        clearInterval(watch);
        void state.running?.close();
      });

      const handleAppSource = createAppSourceHandler(octopusUrl);
      const handleMockApi = createMockApiHandler(octopusUrl, { isAvailable: () => forwarding });
      const handleAppRequest = createAppRequestHandler(octopusUrl, log);
      server.middlewares.use(apiBase, (req, res, next) => {
        // A failing handler answers through Vite's error handler instead of stopping the dev server.
        const run = (handler: RequestHandler, then: () => void) =>
          Promise.resolve()
            .then(() => handler(req, res, then))
            .catch((error: unknown) => next(error));

        // The mock handler also runs while forwarding is off, so apps last seen in mock mode
        // stay fail-closed instead of reaching CI; it asks Octopus only while forwarding is on.
        void run(handleAppSource, () =>
          run(handleMockApi, () => (forwarding ? run(handleAppRequest, next) : next())),
        );
      });
    },
  };
};

export default octopusPortalPlugin;
