import http, { type IncomingMessage, type ServerResponse } from 'node:http';

import type { Plugin } from 'vite';

import { DEFAULT_OCTOPUS_URL } from './server/index.js';
import { parseLocalUrl, type RegisteredApp } from './server/registry.js';
import { parseAppRequest } from './server/routes.js';
import { OCTOPUS_HEADER, OCTOPUS_MOCK_HEADER, PROXY_PREFIX } from './server/server.js';
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
  try {
    const response = await fetch(`${octopusUrl}/api/apps`, { signal: AbortSignal.timeout(1000) });
    // Only Octopus answers this with a list, so another program on the port is not mistaken for it.
    const body: unknown = response.ok ? await response.json().catch(() => undefined) : undefined;
    if (Array.isArray(body)) {
      log(`🐙 Octopus at ${octopusUrl} (already running)`);
      return 'running';
    }
    log(
      `🐙 Something other than Octopus answers at ${octopusUrl}; local apps are off. Use another Octopus address.`,
    );
    return 'port-taken';
  } catch {
    // Nothing answers; start Octopus here.
  }

  const url = parseLocalUrl(octopusUrl);
  if (!url) {
    log(
      `🐙 Octopus is not running at ${octopusUrl}, and it is not on this machine; local apps are off.`,
    );
    return 'not-local';
  }

  try {
    state.running = await startOctopus(Number(url.port), (line) => log(`octopus: ${line}`));
    log(`🐙 Octopus at ${octopusUrl} (started by the portal)`);
    return 'started';
  } catch (error) {
    // Another dev server started it at the same moment.
    if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE') {
      log(`🐙 Octopus at ${octopusUrl} (already running)`);
      return 'running';
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
    const url = new URL(req.url ?? '/', 'http://localhost');
    const path = url.pathname.replace(/^\/apps/, '');
    const appRequest = parseAppRequest(path);
    if (!url.pathname.startsWith('/apps/') || !appRequest) {
      next();
      return;
    }

    const target = new URL(`${octopusUrl}${PROXY_PREFIX}${path}${url.search}`);
    const proxyReq = http.request(
      target,
      { method: req.method, headers: { ...req.headers, host: target.host } },
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
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    if (!pathname.startsWith(`${APP_SOURCE_PATH}/`)) {
      next();
      return;
    }

    const appKey = decodeURIComponent(pathname.slice(APP_SOURCE_PATH.length + 1));
    let source: AppSource = { source: 'ci' };
    try {
      const response = await fetch(`${octopusUrl}/api/apps`, {
        signal: AbortSignal.timeout(1000),
      });
      const apps = response.ok ? ((await response.json()) as RegisteredApp[]) : [];
      const app = apps.find((entry) => entry.appKey === appKey);
      if (app) {
        source = app.mockUrl
          ? { source: 'mock', url: app.url, mockUrl: app.mockUrl }
          : { source: 'local', url: app.url };
      }
    } catch {
      // Octopus is not running, so the app comes from CI.
    }
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    res.end(JSON.stringify(source));
  };

/** Header the Fusion Framework adds to an app's requests, with the app key. */
export const APP_KEY_HEADER = 'x-fusion-app';

/** How long the active apps and a mock server's services are reused, in milliseconds. */
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
 * @param octopusUrl - Octopus address.
 * @returns The handler.
 */
export const createMockApiHandler = (octopusUrl: string): RequestHandler => {
  const activeApps = createCache(async () => {
    const response = await fetch(`${octopusUrl}/api/apps`, { signal: AbortSignal.timeout(1000) });
    return response.ok ? ((await response.json()) as RegisteredApp[]) : [];
  });
  const mockServices = createCache(async (mockUrl) => {
    const response = await fetch(`${mockUrl}/@fusion-mock/discovery`, {
      signal: AbortSignal.timeout(1000),
    });
    const services = response.ok ? ((await response.json()) as Array<{ key: string }>) : [];
    return new Set(services.map(({ key }) => key));
  });

  return async (req, res, next) => {
    const appKey = req.headers[APP_KEY_HEADER];
    if (typeof appKey !== 'string') {
      next();
      return;
    }

    const url = new URL(req.url ?? '/', 'http://localhost');
    const service = url.pathname.split('/')[1];
    let mockUrl: string | undefined;
    try {
      mockUrl = (await activeApps(octopusUrl)).find((app) => app.appKey === appKey)?.mockUrl;
      if (!mockUrl || !service || !(await mockServices(mockUrl)).has(service)) {
        next();
        return;
      }
    } catch {
      // Octopus or the mock server is not answering; the request goes to CI.
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
}

/**
 * Vite plugin for a portal dev server: loads apps registered with Octopus from their local dev
 * server, and every other app from CI as before.
 *
 * - Manifest, config and script requests for registered apps are answered through Octopus;
 *   everything else goes on to the portal's API proxy.
 * - `GET <apiBase>/octopus/apps/<appKey>` tells the portal UI whether an app is local, local in
 *   mock mode, or from CI.
 * - API requests from an app in mock mode go to its mock server, for the services it mocks.
 * - When nothing answers at the Octopus address, the plugin starts Octopus, and stops it again
 *   when the dev server closes.
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
      // An Octopus started here lives as long as this dev server.
      void ensureOctopus(octopusUrl, { log, state }).then(() => {
        if (closed) {
          void state.running?.close();
        }
      });
      server.httpServer?.once('close', () => {
        closed = true;
        void state.running?.close();
      });

      const handleAppSource = createAppSourceHandler(octopusUrl);
      const handleMockApi = createMockApiHandler(octopusUrl);
      const handleAppRequest = createAppRequestHandler(octopusUrl, log);
      server.middlewares.use(apiBase, (req, res, next) => {
        void handleAppSource(req, res, () =>
          handleMockApi(req, res, () => handleAppRequest(req, res, next)),
        );
      });
    },
  };
};

export default octopusPortalPlugin;
