import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import net from 'node:net';

import { renderPage } from './page.js';
import { parseLocalUrl, portOf, type RegisteredApp, type Registry } from './registry.js';
import { setResponseDeadline } from './response-deadline.js';
import { parseAppRequest, parseRequestUrl } from './routes.js';

/** Prefix for app requests the portal forwards to Octopus, e.g. `/proxy/persons/me/apps/my-app`. */
export const PROXY_PREFIX = '/proxy';

/** Response header telling the portal whether Octopus served the request (`hit`) or not (`miss`). */
export const OCTOPUS_HEADER = 'x-octopus';
/**
 * Value of {@link OCTOPUS_HEADER} on Octopus's list of apps (`GET /api/apps`). Clients require it
 * before they treat an answer as Octopus's, so another program on the port is never mistaken
 * for it, even if it answers with a JSON array.
 */
export const OCTOPUS_REGISTRY = 'registry';

/** Response header with the mock server of an app running in mock mode. */
export const OCTOPUS_MOCK_HEADER = 'x-octopus-mock';

// The Fusion CLI dev server answers apps API requests under this prefix.
const APP_DEV_SERVER_API = '/@fusion-api/apps';
const APP_KEY = /^[a-z0-9][a-z0-9-]*$/i;
const MAX_BODY_BYTES = 10_000;

/** Something that happened to the registry, for logging. */
export type RegistryEvent =
  | { type: 'registered' | 'unregistered' | 'expired' | 'unreachable'; app: RegisteredApp }
  | { type: 'replaced'; app: RegisteredApp; previous: RegisteredApp };

/**
 * Options for {@link createOctopusServer}: the registry the server reads and changes, and a
 * listener that reports registry changes, e.g. for logging.
 */
export interface OctopusServerOptions {
  /** Registered apps; the server's API and proxy read and change it. */
  registry: Registry;
  /** Called when the registry changes. */
  onEvent?: (event: RegistryEvent) => void;
  /**
   * How long, in milliseconds, to wait for a dev server's response headers before the request
   * counts as failed and the dev server as unreachable. Defaults to 10000.
   */
  responseTimeoutMs?: number;
  /** Checks whether a dev server still listens before redirecting to it; replaceable in tests. */
  reachable?: (url: string) => Promise<boolean>;
}

const sendJson = (res: ServerResponse, status: number, body: unknown): void => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};

const readJson = (req: IncomingMessage): Promise<unknown> =>
  new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => {
      body += chunk;
      if (body.length > MAX_BODY_BYTES) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Request body is not JSON'));
      }
    });
    req.on('error', reject);
  });

/** Decodes an app key from a request path; `undefined` for an invalid percent encoding. */
const decodeAppKey = (value: string): string | undefined => {
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
};

/** Answers that Octopus does not serve the request, so the portal falls back to CI. */
const sendMiss = (res: ServerResponse): void => {
  res.writeHead(404, { [OCTOPUS_HEADER]: 'miss', 'content-type': 'text/plain' });
  res.end('Not served by Octopus');
};

/**
 * Removes one dev server and reports it. When it was the active one and another dev server for
 * the same app is still running, that one takes over, which is reported too.
 *
 * @returns The removed entry, or `undefined` when it was not registered.
 */
const removeInstance = (
  registry: Registry,
  appKey: string,
  instanceId: string,
  type: 'unregistered' | 'expired' | 'unreachable',
  onEvent?: (event: RegistryEvent) => void,
): RegisteredApp | undefined => {
  const wasActive = registry.get(appKey)?.instanceId === instanceId;
  const removed = registry.unregister(appKey, instanceId);
  if (!removed) {
    return undefined;
  }
  onEvent?.({ type, app: removed });
  const next = wasActive ? registry.get(appKey) : undefined;
  if (next) {
    onEvent?.({ type: 'replaced', app: next, previous: removed });
  }
  return removed;
};

/**
 * Forwards an app request to the app's dev server. When the dev server cannot be reached, the
 * app is removed and the request answered as a miss.
 */
const proxyToApp = (
  req: IncomingMessage,
  res: ServerResponse,
  app: RegisteredApp,
  target: URL,
  onUnreachable: () => void,
  responseTimeoutMs: number,
): void => {
  const appHeaders = {
    [OCTOPUS_HEADER]: 'hit',
    ...(app.mockUrl ? { [OCTOPUS_MOCK_HEADER]: app.mockUrl } : {}),
  };
  const proxyReq = http.request(
    target,
    { method: req.method, headers: { ...req.headers, host: target.host } },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, { ...proxyRes.headers, ...appHeaders });
      proxyRes.pipe(res);
    },
  );
  setResponseDeadline(proxyReq, responseTimeoutMs, `Dev server ${app.url}`);
  proxyReq.on('error', () => {
    onUnreachable();
    if (!res.headersSent) {
      sendMiss(res);
    } else {
      res.end();
    }
  });
  req.pipe(proxyReq);
};

/**
 * Creates the Octopus server: a registry API apps announce themselves to, a page listing them,
 * and a proxy the portal sends app requests to.
 *
 * | Request | Answer |
 * | --- | --- |
 * | `GET /` | Page listing the registered apps |
 * | `GET /api/apps` | Registered apps as JSON |
 * | `PUT /api/apps/:appKey` | Registers an app or renews its entry (`{ url, mockUrl?, instanceId, startedAt? }`) |
 * | `DELETE /api/apps/:appKey[?instanceId=]` | Removes an app. With `instanceId` (the app itself), only that process's entry; without (page or CLI), also refuses that process's heartbeats until it restarts |
 * | `/proxy/<apps API path>` | Manifest, config and scripts of registered apps (`GET`, `HEAD`); `404` with `x-octopus: miss` otherwise |
 *
 * @param options - Registry and event listener.
 * @returns An HTTP server that is not yet listening.
 */
export const createOctopusServer = ({
  registry,
  onEvent,
  responseTimeoutMs = 10_000,
  reachable = (url) => isReachable(url),
}: OctopusServerOptions): http.Server => {
  const handle = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    // A web page whose own host name resolves to this machine (DNS rebinding) sends its own
    // host name here; only requests addressed to this machine are answered.
    if (!parseLocalUrl(`http://${req.headers.host ?? ''}`)) {
      sendJson(res, 403, { error: 'Octopus only answers requests to localhost' });
      return;
    }

    const url = parseRequestUrl(req.url);

    if (url.pathname === '/' && req.method === 'GET') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(renderPage());
      return;
    }

    if (url.pathname === '/api/apps' && req.method === 'GET') {
      res.writeHead(200, {
        'content-type': 'application/json',
        [OCTOPUS_HEADER]: OCTOPUS_REGISTRY,
      });
      res.end(JSON.stringify(registry.list()));
      return;
    }

    const entry = url.pathname.match(/^\/api\/apps\/([^/]+)$/);
    if (entry) {
      const appKey = decodeAppKey(entry[1]);
      if (appKey === undefined || !APP_KEY.test(appKey)) {
        sendJson(res, 400, { error: `Invalid app key: ${appKey ?? entry[1]}` });
        return;
      }

      if (req.method === 'PUT') {
        let body: { url?: unknown; mockUrl?: unknown; instanceId?: unknown; startedAt?: unknown };
        try {
          const json = await readJson(req);
          // `null`, arrays and other JSON values are not a registration.
          if (typeof json !== 'object' || json === null || Array.isArray(json)) {
            throw new Error('Request body is not a JSON object');
          }
          body = json;
        } catch (error) {
          sendJson(res, 400, { error: (error as Error).message });
          return;
        }
        const appUrl = parseLocalUrl(body.url);
        const mockUrl = body.mockUrl === undefined ? undefined : parseLocalUrl(body.mockUrl);
        if (
          !appUrl ||
          (body.mockUrl !== undefined && !mockUrl) ||
          typeof body.instanceId !== 'string'
        ) {
          sendJson(res, 400, {
            error: 'Expected { url, mockUrl?, instanceId } with http://localhost addresses',
          });
          return;
        }
        if (registry.isBlocked(body.instanceId)) {
          sendJson(res, 410, {
            error: `${appKey} was unregistered by hand; restart its dev server to register again`,
          });
          return;
        }
        const { app, created, replaced } = registry.register(appKey, {
          url: appUrl.origin,
          mockUrl: mockUrl?.origin,
          instanceId: body.instanceId,
          startedAt:
            typeof body.startedAt === 'number' && Number.isFinite(body.startedAt)
              ? body.startedAt
              : undefined,
        });
        if (replaced) {
          onEvent?.({ type: 'replaced', app, previous: replaced });
        } else if (created) {
          onEvent?.({ type: 'registered', app });
        }
        sendJson(res, 200, app);
        return;
      }

      if (req.method === 'DELETE') {
        // Without an instance ID the request comes from a person (page or CLI), not the app itself.
        const instanceId = url.searchParams.get('instanceId') ?? undefined;
        let removed: RegisteredApp | undefined;
        if (instanceId === undefined) {
          removed = registry.block(appKey);
          if (removed) {
            onEvent?.({ type: 'unregistered', app: removed });
          }
        } else {
          removed = removeInstance(registry, appKey, instanceId, 'unregistered', onEvent);
        }
        res.writeHead(removed ? 204 : 404);
        res.end();
        return;
      }
    }

    if (url.pathname.startsWith(`${PROXY_PREFIX}/`)) {
      const path = url.pathname.slice(PROXY_PREFIX.length);
      const appRequest = parseAppRequest(path);
      let app = appRequest && registry.get(appRequest.appKey);
      // Only reads are served; a miss sends writes on to CI.
      const isRead = req.method === 'GET' || req.method === 'HEAD';
      if (!appRequest || !app || !isRead) {
        sendMiss(res);
        return;
      }

      // The browser loads scripts straight from the dev server, so make sure it still runs: a
      // dev server can stop between health checks. A stopped one is removed, and the next most
      // recent dev server of the app, if any, takes over.
      if (appRequest.type === 'bundle') {
        while (app && !(await reachable(app.url))) {
          removeInstance(registry, app.appKey, app.instanceId, 'unreachable', onEvent);
          app = registry.get(appRequest.appKey);
        }
        if (!app) {
          sendMiss(res);
          return;
        }
      }

      // Only the registered origin and checked parts of the request make up the address, so a
      // request can neither reach another host nor another path on the dev server.
      const target = new URL(app.url);

      if (appRequest.type === 'bundle') {
        // Point straight at the app's dev server, so the module's root-relative imports
        // (e.g. `/@vite/client`) also resolve against that app.
        target.pathname = `/${appRequest.path}`;
        res.writeHead(302, { location: target.href, [OCTOPUS_HEADER]: 'hit' });
        res.end();
        return;
      }

      // The dev server's manifest and config routes take no query parameters.
      target.pathname =
        appRequest.type === 'manifest'
          ? `${APP_DEV_SERVER_API}/persons/me/apps/${app.appKey}`
          : `${APP_DEV_SERVER_API}/apps/${app.appKey}/builds/${appRequest.version}/config`;
      const { appKey, instanceId } = app;
      proxyToApp(
        req,
        res,
        app,
        target,
        () => removeInstance(registry, appKey, instanceId, 'unreachable', onEvent),
        responseTimeoutMs,
      );
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  };

  return http.createServer((req, res) => {
    // A failing request must not take Octopus down, nor the portal dev server that started it.
    handle(req, res).catch((error: unknown) => {
      if (!res.headersSent) {
        sendJson(res, 500, { error: (error as Error).message });
      } else {
        res.end();
      }
    });
  });
};

/**
 * Checks whether something listens at an address.
 *
 * @param url - Address to check.
 * @param timeoutMs - How long to wait for a connection.
 * @returns `true` when a connection could be opened.
 */
export const isReachable = (url: string, timeoutMs = 1000): Promise<boolean> =>
  new Promise((resolve) => {
    const address = new URL(url);
    const socket = net.connect({
      host: address.hostname.replace(/^\[|\]$/g, ''),
      port: portOf(address),
    });
    const done = (result: boolean) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeoutMs, () => done(false));
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
  });

/**
 * Options for {@link startHealthChecks}: the registry to clean up, how often and after how long
 * entries are removed, and the probe that decides whether a dev server still answers.
 */
export interface HealthCheckOptions {
  /** Registered apps; entries for stopped dev servers are removed from it. */
  registry: Registry;
  /** How often to check. */
  intervalMs?: number;
  /** How long an entry lives without a heartbeat. */
  ttlMs?: number;
  /** Checks whether an app's dev server still listens; replaceable in tests. */
  reachable?: (url: string) => Promise<boolean>;
  /** Called for each removed entry. */
  onEvent?: (event: RegistryEvent) => void;
}

/**
 * Removes apps that stopped without unregistering: entries without a recent heartbeat, and
 * entries whose dev server no longer accepts connections.
 *
 * @param options - Registry, timings and event listener.
 * @returns A function that stops the checks.
 */
export const startHealthChecks = ({
  registry,
  intervalMs = 2000,
  ttlMs = 15_000,
  reachable = isReachable,
  onEvent,
}: HealthCheckOptions): (() => void) => {
  const check = async () => {
    for (const { appKey, instanceId } of registry.stale(ttlMs)) {
      removeInstance(registry, appKey, instanceId, 'expired', onEvent);
    }
    await Promise.all(
      registry.instances().map(async ({ appKey, instanceId, url }) => {
        if (!(await reachable(url))) {
          removeInstance(registry, appKey, instanceId, 'unreachable', onEvent);
        }
      }),
    );
  };

  const timer = setInterval(() => void check(), intervalMs);
  return () => clearInterval(timer);
};
