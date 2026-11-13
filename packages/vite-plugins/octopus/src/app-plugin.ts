import { randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';

import type { Plugin } from 'vite';

/** Options for {@link octopusAppPlugin}. */
export interface OctopusAppPluginOptions {
  /** App key to register, from the app manifest. */
  appKey: string;
  /** Octopus address, e.g. `http://localhost:2000`. */
  octopusUrl: string;
  /** Mock server the app's dev page uses, when the dev server runs with `--mock`. */
  mockUrl?: string;
  /**
   * Folder with the app's source, relative to the Vite root. Vite scans it at startup, so a
   * portal importing the app's entry does not trigger a dependency re-bundle mid-load.
   */
  sourceDir?: string;
  /** How often to renew the registration. */
  heartbeatMs?: number;
}

const REQUEST_TIMEOUT_MS = 1000;

// One instance ID per process: the CLI may merge the Vite config more than once, but the dev
// server registers once.
const instanceId = `${process.pid}-${randomUUID().slice(0, 8)}`;
// Lets Octopus keep the most recently started dev server active, even after Octopus restarts.
const startedAt = Date.now();
const configuredServers = new WeakSet<object>();

/**
 * Checks whether a request comes from a page on this machine, e.g. a portal on
 * `http://localhost:3000`. Only such pages may load the app's modules across origins.
 *
 * @param origin - Value of the request's `Origin` header.
 * @returns `true` for `localhost`, `127.0.0.1` and `[::1]` origins.
 */
export const isLocalOrigin = (origin: string): boolean => {
  try {
    const { protocol, hostname } = new URL(origin);
    return (
      (protocol === 'http:' || protocol === 'https:') &&
      ['localhost', '127.0.0.1', '[::1]'].includes(hostname)
    );
  } catch {
    return false;
  }
};

/**
 * Vite plugin that registers a Fusion app with Octopus while its dev server runs, so a local
 * portal (`ffc portal dev --octopus`) loads the app from this dev server instead of CI.
 *
 * While the dev server runs, the plugin registers the app key and address with Octopus, renews
 * the registration with a heartbeat, and unregisters when the dev server closes. It also lets
 * portals on this machine import the app's modules across origins. When Octopus is not running the
 * app works as usual and registers once Octopus starts.
 *
 * @param options - App key, Octopus address and mock server.
 * @returns A Vite plugin for the app dev server.
 */
export const octopusAppPlugin = (options: OctopusAppPluginOptions): Plugin => {
  const { appKey, mockUrl, sourceDir, heartbeatMs = 5000 } = options;
  const octopusUrl = options.octopusUrl.replace(/\/$/, '');

  return {
    name: 'fusion-framework-octopus-app',
    apply: 'serve',

    // The portal imports the app's source directly, so without a scan Vite would only discover
    // dependencies as they are requested, re-bundle them mid-load, and fail the page with
    // "Outdated Optimize Dep".
    config: (config) =>
      sourceDir && !config.optimizeDeps?.entries
        ? {
            optimizeDeps: {
              entries: [
                `${sourceDir}/**/*.{ts,tsx,js,jsx}`,
                `!${sourceDir}/**/*.d.ts`,
                `!${sourceDir}/**/*.test.*`,
              ],
            },
          }
        : undefined,

    configureServer(server) {
      if (configuredServers.has(server)) {
        return;
      }
      configuredServers.add(server);
      const logger = server.config.logger;

      // `ffc app dev` turns Vite's CORS handling off; allow only portals on this machine here.
      server.middlewares.use((req, res, next) => {
        const origin = req.headers.origin;
        if (origin && isLocalOrigin(origin)) {
          res.setHeader('access-control-allow-origin', origin);
          res.setHeader('access-control-allow-credentials', 'true');
          res.setHeader('vary', 'Origin');
          if (req.method === 'OPTIONS' && req.headers['access-control-request-method']) {
            res.setHeader('access-control-allow-methods', 'GET, HEAD, OPTIONS');
            res.setHeader(
              'access-control-allow-headers',
              req.headers['access-control-request-headers'] ?? '*',
            );
            res.statusCode = 204;
            res.end();
            return;
          }
        }
        next();
      });

      const httpServer = server.httpServer;
      if (!httpServer) {
        return;
      }

      const entryUrl = `${octopusUrl}/api/apps/${encodeURIComponent(appKey)}`;
      let timer: NodeJS.Timeout | undefined;
      let registered = false;
      let warnedUnavailable = false;
      let blocked = false;

      const register = async (url: string) => {
        try {
          const response = await fetch(entryUrl, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ url, mockUrl, instanceId, startedAt }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          });
          // Unregistered by hand. Keep sending heartbeats: this Octopus refuses them until the
          // dev server restarts, but a restarted Octopus has forgotten the block and accepts them.
          if (response.status === 410) {
            registered = false;
            if (!blocked) {
              blocked = true;
              logger.info(
                `🐙 ${appKey} was unregistered in Octopus; restart the dev server to register again`,
              );
            }
            return;
          }
          if (!response.ok) {
            throw new Error(`${response.status} ${await response.text()}`);
          }
          if (!registered) {
            registered = true;
            warnedUnavailable = false;
            blocked = false;
            logger.info(`🐙 Registered ${appKey} at ${url} with Octopus at ${octopusUrl}`);
          }
        } catch (error) {
          registered = false;
          if (!warnedUnavailable) {
            warnedUnavailable = true;
            logger.info(
              `🐙 Not registered with Octopus (${(error as Error).message}); retrying while ${octopusUrl} is unavailable`,
            );
          }
        }
      };

      httpServer.once('listening', () => {
        const { port } = httpServer.address() as AddressInfo;
        const url = `http://localhost:${port}`;
        void register(url);
        timer = setInterval(() => void register(url), heartbeatMs);
        timer.unref();
      });

      httpServer.once('close', () => {
        clearInterval(timer);
        // Best effort; Octopus also removes the app once its port stops answering.
        void fetch(`${entryUrl}?instanceId=${encodeURIComponent(instanceId)}`, {
          method: 'DELETE',
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }).catch(() => undefined);
      });
    },
  };
};

export default octopusAppPlugin;
