import type { IncomingMessage, ServerResponse } from 'node:http';

import { sendJson } from './send-json.js';
import type { ServiceState } from './types.js';

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
 */
export async function handleServiceRequest(
  services: Map<string, ServiceState>,
  method: string,
  segments: string[],
  query: Record<string, string>,
  req: IncomingMessage,
  res: ServerResponse,
  seed?: number,
): Promise<void> {
  const [key, ...rest] = segments;
  const service = key ? services.get(key) : undefined;
  // No service registered under this key: report it instead of resolving against nothing.
  if (!service) {
    sendJson(res, 404, { error: `No mocked service registered for "${key ?? ''}"` });
    return;
  }
  const path = `/${rest.join('/')}`;
  const originalUrl = req.url;
  const search = new URL(req.url ?? '/', 'http://localhost').search;
  // Middleware models the service's own routes, so hide the shared server's /<service> prefix.
  req.url = `${path}${search}`;
  // A registered middleware route takes precedence over the generated mock for this request.
  try {
    // Let middleware resolve the normalized service-relative request before generated mocks.
    if (await service.definition.router?.handle(req, res, seed)) {
      return;
    }
  } finally {
    req.url = originalUrl;
  }
  const resolved = await service.mock.resolve({ method, path, query });
  // The service has no operation matching this method/path.
  if (!resolved) {
    sendJson(res, 404, { error: `No mock operation for ${method} ${path}` });
    return;
  }
  sendJson(res, resolved.status, resolved.mock);
}
