import type { IncomingMessage, ServerResponse } from 'node:http';

import { handleControlRequest } from './handle-control-request.js';
import { handleServiceRequest } from './handle-service-request.js';
import type { MockServerHandle, ServiceState } from './types.js';
import type { MockAuthSessionStore } from './mock-auth-session-store.js';

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
 * Routes one incoming request to the control plane or a service's mock.
 *
 * @param handle - The `reset`/`override` implementation control-plane routes delegate to.
 * @param services - Every currently active (possibly overridden) service, by key.
 * @param req - The incoming request.
 * @param res - The response to write the result to.
 * @param seed - The mock server's own seed (see `CreateMockServerOptions`), threaded into a matched `middleware` route's `RouteContext`.
 */
export async function handleRequest(
  handle: Pick<MockServerHandle, 'reset' | 'override'>,
  services: Map<string, ServiceState>,
  req: IncomingMessage,
  res: ServerResponse,
  seed?: number,
  authSessions?: MockAuthSessionStore,
): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const method = (req.method ?? 'GET').toUpperCase();
  // Direct-only services run on a different localhost origin than the browser app.
  const requestOrigin = req.headers.origin;
  res.setHeader('access-control-allow-origin', requestOrigin ?? '*');
  // Credentialed browser requests require an explicit origin rather than a wildcard.
  if (requestOrigin) {
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
  // Empty segments (from leading/trailing/double slashes) don't identify a route.
  const segments = url.pathname.split('/').filter(Boolean);

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
    await handleServiceRequest(services, method, [hostKey, ...segments], query, req, res, seed);
    return;
  }

  await handleServiceRequest(services, method, segments, query, req, res, seed);
}
