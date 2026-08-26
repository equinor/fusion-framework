import type { ServerResponse } from 'node:http';

/**
 * Writes a JSON response, or an empty body when `body` is `undefined` (e.g. a `204`).
 *
 * @param res - The response to write to.
 * @param status - The HTTP status code to send.
 * @param body - The value to serialize as the JSON body, or `undefined` for an empty body.
 */
export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  // No body to serialize: send status-only, e.g. a 204.
  if (body === undefined) {
    res.writeHead(status);
    res.end();
    return;
  }
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}
