import type { ClientRequest } from 'node:http';

/**
 * Ends a request with an error when no response headers arrive within `ms`, e.g. from a server
 * that accepts the connection but never answers. The request's `error` handler then runs as
 * for any other failure.
 *
 * @param request - Outgoing request to watch.
 * @param ms - How long to wait for the response headers.
 * @param target - What the request goes to, for the error message.
 */
export const setResponseDeadline = (request: ClientRequest, ms: number, target: string): void => {
  const timer = setTimeout(
    () => request.destroy(new Error(`${target} sent no response within ${ms} ms`)),
    ms,
  );
  request.once('response', () => clearTimeout(timer));
  request.once('close', () => clearTimeout(timer));
};
