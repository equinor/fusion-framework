import type { IncomingMessage, ServerResponse } from 'node:http';

import { readJsonBody } from './read-json-body.js';
import { sendJson } from './send-json.js';
import type { MockOverride, MockServerHandle, ServiceState } from './types.js';

/**
 * Handles a request under the reserved `/@fusion-mock/*` control-plane prefix.
 *
 * @remarks
 * `health` and `discovery` are read-only; `reset` and `<service>/<operationId>`
 * delegate to the same {@link MockServerHandle.reset}/`override` logic a Node
 * caller would use directly, so both paths stay in sync by construction.
 *
 * @param handle - The `reset`/`override` implementation to delegate to.
 * @param services - Every currently active (possibly overridden) service, by key.
 * @param method - The HTTP method of the request.
 * @param segments - The request path (with the `@fusion-mock` prefix already stripped), split into segments.
 * @param req - The incoming request.
 * @param res - The response to write the result to.
 */
export async function handleControlRequest(
  handle: Pick<MockServerHandle, 'reset' | 'override'>,
  services: Map<string, ServiceState>,
  method: string,
  segments: string[],
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const [first, second] = segments;

  // GET /@fusion-mock/health
  if (first === 'health' && method === 'GET') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  // GET /@fusion-mock/discovery
  if (first === 'discovery' && method === 'GET') {
    const port = new URL(`http://${req.headers.host}`).port;
    // each service gets its own `<key>.localhost` origin, like a real service-discovery entry,
    // instead of a shared origin with a `/<key>` path prefix a real backend wouldn't expect
    const discovered = Array.from(services.keys(), (key) => ({
      key,
      uri: `http://${key}.localhost:${port}`,
    }));
    sendJson(res, 200, discovered);
    return;
  }

  // POST /@fusion-mock/reset
  if (first === 'reset' && method === 'POST') {
    handle.reset();
    sendJson(res, 200, { status: 'reset' });
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
    // The override body must be a plain object carrying "mock", with an integer "status" if present.
    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      !('mock' in body) ||
      ('status' in body && !Number.isInteger((body as { status?: unknown }).status))
    ) {
      sendJson(res, 400, {
        error:
          'Expected a JSON body with a "mock" field and, if present, an integer "status" field.',
      });
      return;
    }
    handle.override(serviceKey, operationId, body as MockOverride);
    sendJson(res, 200, { status: 'registered' });
    return;
  }

  sendJson(res, 404, { error: `Unknown control route "/@fusion-mock/${segments.join('/')}"` });
}
