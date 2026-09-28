import type { IncomingMessage, ServerResponse } from 'node:http';

import { sendJson } from './send-json.js';
import type { MockAuthSessionStore } from './MockAuthSessionStore.js';
import type { ServiceState } from './types.js';
import { parseMockRequestIdentity } from '../parse-mock-request-identity.js';
import type { MockRequestIdentity } from '../discovery/create-router.js';

/**
 * Resolves service identity from a supported bearer token or the existing mock-auth browser session.
 *
 * @param request - Incoming service request.
 * @param authSessions - Server-owned mock-auth session store.
 * @returns Normalized middleware identity.
 */
function resolveServiceIdentity(
  request: IncomingMessage,
  authSessions?: MockAuthSessionStore,
): MockRequestIdentity {
  const bearerIdentity = parseMockRequestIdentity(request.headers.authorization);
  // Direct HTTP callers and proxies that preserve the supported token stay bearer-authenticated.
  if (bearerIdentity.status === 'authenticated') return bearerIdentity;
  // A browser session cannot turn an anonymous request into an authenticated service request.
  if (bearerIdentity.status === 'missing') return bearerIdentity;

  const session = authSessions?.getRequestSession(request);
  // Dev-server proxies can preserve the browser cookie even when they replace the bearer token.
  if (!session) return bearerIdentity;
  return {
    status: 'authenticated',
    userId: session.user.userId,
    sessionId: session.sessionId,
    claims: {
      ...session.user.claims,
      oid: session.user.userId,
      sid: session.sessionId,
    },
  };
}

/**
 * Resolves a plain data-plane request (`/<service>/<rest...>`) against the matching mock.
 *
 * @param services - Every currently active (possibly overridden) service, by key.
 * @param method - The HTTP method of the request.
 * @param segments - The request path, split into segments; the first is the service key.
 * @param query - The parsed query string.
 * @param req - The incoming request, passed to the service's `middleware` router, if any.
 * @param res - The response to write the resolved mock (or an error) to.
 * @param seed - The mock server's own seed, threaded into a matched `middleware` route's `RouteContext`.
 * @param authSessions - Existing mock-auth sessions used when a dev-server proxy replaces the bearer token.
 */
export async function handleServiceRequest(
  services: Map<string, ServiceState>,
  method: string,
  segments: string[],
  query: Record<string, string>,
  req: IncomingMessage,
  res: ServerResponse,
  seed?: number,
  authSessions?: MockAuthSessionStore,
): Promise<void> {
  const [key, ...rest] = segments;
  const service = key ? services.get(key) : undefined;
  // No service registered under this key: report it instead of resolving against nothing.
  if (!service) {
    sendJson(res, 404, { error: `No mocked service registered for "${key ?? ''}"` });
    return;
  }
  const path = `/${rest.join('/')}`;
  const search = new URL(req.url ?? '/', 'http://localhost').search;
  const serviceUrl = new URL(`${path}${search}`, 'http://localhost');
  // A registered middleware route takes precedence over the generated mock for this request.
  // Pass service-relative routing data separately so middleware cannot observe a temporarily mutated request.
  if (
    await service.definition.router?.handle(
      req,
      res,
      seed,
      serviceUrl,
      resolveServiceIdentity(req, authSessions),
    )
  ) {
    return;
  }
  const resolved = await service.mock.resolve({ method, path, query });
  // The service has no operation matching this method/path.
  if (!resolved) {
    sendJson(res, 404, { error: `No mock operation for ${method} ${path}` });
    return;
  }
  sendJson(res, resolved.status, resolved.mock);
}
