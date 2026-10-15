import type { IncomingMessage, ServerResponse } from 'node:http';

import type { PluginLogger } from './types.js';

/**
 * Checks whether an `Authorization` header carries an unsigned JWT (`alg: none`).
 *
 * Mock authentication (`@equinor/fusion-framework-module-msal/mock` and the
 * `ffc mock-server` token endpoint) issues unsigned tokens, while Entra ID tokens are
 * always signed, so an unsigned token can only be a mock token.
 *
 * @param authorization - Value of the `Authorization` request header.
 * @returns `true` when the header is a bearer JWT whose header declares `alg: none`.
 */
const isUnsignedBearer = (authorization: string | undefined): boolean => {
  const [scheme, token] = authorization?.split(' ') ?? [];
  // Only bearer JWTs can carry a mock token
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return false;
  }
  try {
    const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
    return String(header.alg).toLowerCase() === 'none';
  } catch {
    return false;
  }
};

/**
 * Checks whether a proxy target stays on the developer's machine or private network:
 * loopback, `*.localhost`, single-label hosts (Docker Compose services such as `api`),
 * `.local`/`.internal` hosts, and private IPv4 ranges.
 *
 * @param target - Proxy target URL.
 * @returns `true` when the target is local; `false` for public hosts or invalid URLs.
 */
const isLocalTarget = (target: string): boolean => {
  let hostname: string;
  try {
    hostname = new URL(target).hostname.toLowerCase().replace(/^\[|\]$/g, '');
  } catch {
    return false;
  }
  return (
    hostname === 'localhost' ||
    hostname === '::1' ||
    // Single-label hosts are Compose services; IPv6 literals have no dots but may be public
    (!hostname.includes('.') && !hostname.includes(':')) ||
    /\.(localhost|local|internal)$/.test(hostname) ||
    /^(127|10)\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
};

/**
 * Refuses to proxy a request carrying a mock (unsigned) token to a non-local upstream.
 *
 * Real Fusion services reject mock tokens, so forwarding them only produces `401`
 * responses — and a reload or retry loop turns that into a flood of failed requests.
 * The request is answered locally with `401` instead and never leaves the machine.
 *
 * @param req - Incoming request about to be proxied.
 * @param res - Response used to answer blocked requests.
 * @param target - Upstream URL the request would be proxied to.
 * @param logger - Optional logger for the blocked request.
 * @returns `true` when the request was blocked and answered; `false` when it may be proxied.
 */
export function blockMockTokenUpstream(
  req: IncomingMessage,
  res: ServerResponse,
  target: string,
  logger?: PluginLogger,
): boolean {
  // Mock tokens may reach local mocks and APIs; only public upstreams are protected
  if (isLocalTarget(target) || !isUnsignedBearer(req.headers.authorization)) {
    return false;
  }
  logger?.warn(`blocked ${req.method} ${req.url}: mock token must not be sent to ${target}`);
  res.writeHead(401, {
    'content-type': 'application/json',
    'x-fusion-dev-server-blocked': 'mock-token',
  });
  res.end(
    JSON.stringify({
      error: `Blocked by the dev server: a mock token must not be sent to ${new URL(target).host}. Point the request at a mock server (for example with --mock).`,
    }),
  );
  return true;
}
