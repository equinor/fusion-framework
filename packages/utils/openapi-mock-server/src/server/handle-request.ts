import type { IncomingMessage, ServerResponse } from 'node:http';

import { handleControlRequest } from './handle-control-request.js';
import { handleServiceRequest } from './handle-service-request.js';
import { sendJson } from './send-json.js';
import type { MockServerHandle, ServiceState } from './types.js';
import type { MockAuthSessionStore } from './MockAuthSessionStore.js';

/**
 * Checks whether a request is negotiating CORS access rather than invoking an OPTIONS operation.
 *
 * @param method - The normalized HTTP method.
 * @param request - The incoming HTTP request.
 * @returns Whether the request carries the method and headers required for a CORS preflight.
 */
function isCorsPreflightRequest(method: string, request: IncomingMessage): boolean {
  // Only OPTIONS requests can be CORS preflights.
  if (method !== 'OPTIONS') return false;
  const { origin, 'access-control-request-method': requestedMethod } = request.headers;
  return origin !== undefined && requestedMethod !== undefined;
}

/**
 * Checks whether an origin is a canonical HTTP(S) loopback origin.
 *
 * @param origin - Serialized browser origin.
 * @returns Whether the origin targets localhost or a loopback IP on any port.
 */
function isLoopbackOrigin(origin: string): boolean {
  try {
    const parsed = new URL(origin);
    // Browser origins are canonical and only HTTP(S) origins can host the local SPA.
    if (parsed.origin !== origin || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')) {
      return false;
    }
    return (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '[::1]'
    );
  } catch {
    return false;
  }
}

/**
 * Resolves an origin trusted to use the credentialed mock-auth control plane.
 *
 * @param requestOrigin - Origin supplied by the browser.
 * @param allowedOrigins - Additional exact origins configured by the server owner.
 * @returns The canonical trusted origin, or `undefined`.
 */
function resolveAllowedOrigin(
  requestOrigin: string | undefined,
  allowedOrigins: readonly string[],
): string | undefined {
  // Server-to-server callers omit Origin and do not need credentialed CORS response headers.
  if (!requestOrigin) return undefined;
  // Exact matching prevents configured origins from widening the browser trust boundary.
  const configuredOrigin = allowedOrigins.find((origin) => origin === requestOrigin);
  // Loopback origins are trusted by default because this server issues mock-only tokens for local development.
  if (configuredOrigin || isLoopbackOrigin(requestOrigin)) {
    return configuredOrigin ?? new URL(requestOrigin).origin;
  }
  return undefined;
}

/**
 * Routes one incoming request to the control plane or a service's mock.
 *
 * @param handle - The `reset`/`override` implementation control-plane routes delegate to.
 * @param services - Every currently active (possibly overridden) service, by key.
 * @param req - The incoming request.
 * @param res - The response to write the result to.
 * @param seed - The mock server's own seed (see `CreateMockServerOptions`), threaded into a matched `middleware` route's `RouteContext`.
 * @param authSessions - Session store used by mock-auth control routes.
 * @param allowedOrigins - Additional exact origins trusted to make credentialed mock-auth requests.
 * @throws When a control-plane auth request is received without a session store.
 */
export async function handleRequest(
  handle: Pick<MockServerHandle, 'reset' | 'override'>,
  services: Map<string, ServiceState>,
  req: IncomingMessage,
  res: ServerResponse,
  seed?: number,
  authSessions?: MockAuthSessionStore,
  allowedOrigins: readonly string[] = [],
): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const method = (req.method ?? 'GET').toUpperCase();
  // Empty segments (from leading/trailing/double slashes) don't identify a route.
  const segments = url.pathname.split('/').filter(Boolean);
  // Direct-only services run on a different localhost origin than the browser app.
  const requestOrigin = req.headers.origin;
  // Loopback browser apps are trusted by default; other origins require exact configuration.
  const allowedOrigin = resolveAllowedOrigin(requestOrigin, allowedOrigins);
  // Reject cross-origin control-plane access before it can read or mutate session state.
  if (requestOrigin && segments[0] === '@fusion-mock' && !allowedOrigin) {
    sendJson(res, 403, { error: 'Origin is not allowed for mock-server control requests' });
    return;
  }
  // Reflect only an allowlisted value; ordinary mock APIs remain available without credentials.
  res.setHeader('access-control-allow-origin', allowedOrigin ?? '*');
  // Credentialed browser requests require a trusted loopback or explicitly allowlisted origin.
  if (allowedOrigin) {
    res.setHeader('access-control-allow-credentials', 'true');
    res.setHeader('vary', 'Origin');
  }
  res.setHeader('access-control-allow-methods', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
  const requestedHeaders = req.headers['access-control-request-headers'];
  res.setHeader('access-control-allow-headers', requestedHeaders ?? 'authorization, content-type');
  // A CORS preflight only negotiates access; ordinary OPTIONS requests still target mock operations.
  if (isCorsPreflightRequest(method, req)) {
    res.writeHead(204);
    res.end();
    return;
  }
  // Control-plane routes live under a reserved prefix, never a real service key.
  if (segments[0] === '@fusion-mock') {
    // Mock-auth routes require the server-owned store created alongside this listener.
    if (!authSessions) {
      throw new Error('Mock auth session store is unavailable');
    }
    await handleControlRequest(handle, services, method, segments.slice(1), req, res, authSessions);
    return;
  }

  const query = Object.fromEntries(url.searchParams);

  // A request addressed to `<key>.localhost` (the discovery `uri`'s own host) targets that
  // service directly, so the path needs no `/<key>` prefix stripped by an upstream proxy first.
  const hostname = (req.headers.host ?? '').split(':')[0];
  const hostKey = hostname.endsWith('.localhost')
    ? hostname.slice(0, -'.localhost'.length)
    : undefined;
  // The request's host names a registered service directly: resolve against it without a path prefix.
  if (hostKey && services.has(hostKey)) {
    await handleServiceRequest(
      services,
      method,
      [hostKey, ...segments],
      query,
      req,
      res,
      seed,
      authSessions,
    );
    return;
  }

  await handleServiceRequest(services, method, segments, query, req, res, seed, authSessions);
}
