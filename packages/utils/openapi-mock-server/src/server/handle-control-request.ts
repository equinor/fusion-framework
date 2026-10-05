import type { IncomingMessage, ServerResponse } from 'node:http';

import { readJsonBody } from './read-json-body.js';
import { resolveServiceDiscovery } from './resolve-service-discovery.js';
import { sendJson } from './send-json.js';
import { handleMockAuthRequest } from './handle-mock-auth-request.js';
import type { MockAuthSessionStore } from './MockAuthSessionStore.js';
import type { MockOverride, MockServerHandle, ServiceState } from './types.js';
import type { MockControlHandler } from '../discovery/mock-control.js';

/**
 * Checks whether a value is a standard HTTP status code.
 *
 * @param value - The status value supplied by the caller.
 * @returns Whether the value is an integer from 100 through 599.
 */
function isHttpStatusCode(value: unknown): value is number {
  // Status codes must be numeric values.
  if (typeof value !== 'number') return false;
  // Fractional numbers are not valid status codes.
  if (!Number.isInteger(value)) return false;
  return value >= 100 && value <= 599;
}

/**
 * Validates the control-plane payload before registering a mock override.
 *
 * @param value - The parsed request body.
 * @returns Whether the body contains a mock and an optional valid HTTP status.
 */
function isMockOverride(value: unknown): value is MockOverride {
  // Override payloads must be JSON objects rather than null, arrays, or primitive values.
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  // A response body is required even when the caller only wants to change its status.
  if (!('mock' in value)) return false;
  // Omitting status preserves the generated response's original status code.
  if (!('status' in value)) return true;
  return isHttpStatusCode(value.status);
}

/** Control-plane names owned by the server itself, which services cannot register. */
const RESERVED_CONTROL_NAMES = new Set(['auth', 'health', 'discovery', 'reset']);

/**
 * Finds the control handler a service registered under a control-plane name.
 *
 * @param services - Every active service, by key.
 * @param name - The first path segment after `/@fusion-mock/`.
 * @returns The handler, or `undefined` when no service registered the name.
 */
function findControlHandler(
  services: Map<string, ServiceState>,
  name: string | undefined,
): MockControlHandler | undefined {
  // Empty and server-owned names never reach a service, whatever the method.
  if (!name || RESERVED_CONTROL_NAMES.has(name)) return undefined;
  // The first service, in key order, that registered the name owns it.
  for (const { definition } of services.values()) {
    const handler = definition.control?.[name];
    // Only an own handler counts, so names like `constructor` never resolve to prototype members.
    if (handler && Object.hasOwn(definition.control ?? {}, name)) return handler;
  }
  return undefined;
}

/**
 * Handles a request under the reserved `/@fusion-mock/*` control-plane prefix.
 *
 * @remarks
 * `health` and `discovery` are read-only; `reset` and `<service>/<operationId>`
 * delegate to the same {@link MockServerHandle.reset}/`override` logic a Node
 * caller would use directly, so both paths stay in sync by construction.
 * `<name>` without a second segment goes to a service's own `control[name]`
 * handler, when one is registered.
 *
 * @param handle - The `reset`/`override` implementation to delegate to.
 * @param services - Every currently active (possibly overridden) service, by key.
 * @param method - The HTTP method of the request.
 * @param segments - The request path (with the `@fusion-mock` prefix already stripped), split into segments.
 * @param req - The incoming request.
 * @param res - The response to write the result to.
 * @param authSessions - Session store used by mock-auth control routes.
 */
export async function handleControlRequest(
  handle: Pick<MockServerHandle, 'reset' | 'override'>,
  services: Map<string, ServiceState>,
  method: string,
  segments: string[],
  req: IncomingMessage,
  res: ServerResponse,
  authSessions: MockAuthSessionStore,
): Promise<void> {
  const [first, second] = segments;

  // The standalone mock server owns browser-session users and token issuance.
  if (first === 'auth' && (second === 'user' || second === 'token')) {
    await handleMockAuthRequest(authSessions, method, second, req, res);
    return;
  }

  // GET /@fusion-mock/health
  if (first === 'health' && method === 'GET') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  // GET /@fusion-mock/discovery
  if (first === 'discovery' && method === 'GET') {
    const port = new URL(`http://${req.headers.host}`).port;
    // Resolve discovery exclusively from the predefined and local mock definitions.
    const discovered = resolveServiceDiscovery(
      Array.from(services.values(), (state) => state.definition),
      port,
    );
    sendJson(res, 200, discovered);
    return;
  }

  // POST /@fusion-mock/reset
  if (first === 'reset' && method === 'POST') {
    handle.reset();
    sendJson(res, 200, { status: 'reset' });
    return;
  }

  const control = second === undefined ? findControlHandler(services, first) : undefined;
  // `/@fusion-mock/<name>` routes to a service's own control handler, such as recorded analytics.
  if (control) {
    const { status, body } = await control({
      method,
      query: new URL(req.url ?? '/', 'http://localhost').searchParams,
      sessionId: authSessions.getRequestSession(req)?.sessionId,
    });
    sendJson(res, status, body ?? {});
    return;
  }

  // Anything else under the prefix is `/@fusion-mock/<service>/<operationId>`.
  const serviceKey = first;
  const operationId = second;
  // Only a well-formed service/operationId POST reaches the override logic below.
  if (serviceKey && operationId && method === 'POST') {
    // Unknown service key: fail loudly instead of silently registering a dangling override.
    if (!services.has(serviceKey)) {
      sendJson(res, 404, { error: `No mocked service registered for "${serviceKey}"` });
      return;
    }
    const body = await readJsonBody(req);
    // Invalid status codes would poison the override and make ServerResponse.writeHead() throw later.
    if (!isMockOverride(body)) {
      sendJson(res, 400, {
        error:
          'Expected a JSON body with a "mock" field and, if present, an HTTP "status" from 100 to 599.',
      });
      return;
    }
    handle.override(serviceKey, operationId, body);
    sendJson(res, 200, { status: 'registered' });
    return;
  }

  sendJson(res, 404, { error: `Unknown control route "/@fusion-mock/${segments.join('/')}"` });
}
