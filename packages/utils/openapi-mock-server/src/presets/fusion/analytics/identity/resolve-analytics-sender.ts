import type { IncomingMessage } from 'node:http';

import type { MockRequestIdentity } from '../../../../discovery/index.js';
import type { AnalyticsSender } from '../store/index.js';
import { readStartupMockUserId } from './read-startup-mock-user-id.js';

/** Session that collects analytics sent with the framework MSAL mock's startup identity. */
const LOCAL_DEVELOPMENT_SESSION = 'local-development';

/**
 * Resolves which user and browser session an analytics request belongs to, so the analytics
 * mocks can stamp the user and keep parallel sessions apart.
 *
 * @remarks
 * A mock-auth identity (bearer token or browser session) gives its user and session. A browser
 * still using the framework MSAL mock's startup identity — `ffc app dev --mock` before a test
 * selects a user — is accepted as the shared `local-development` session. Every other request is
 * treated as not signed in.
 *
 * @param req - Incoming request.
 * @param identity - Mock-auth identity resolved by the mock server.
 * @returns The sender, or `undefined` when the request has no signed-in user.
 *
 * @example
 * ```typescript
 * const sender = resolveAnalyticsSender(req, identity);
 * if (!sender) res.statusCode = 401;
 * ```
 */
export function resolveAnalyticsSender(
  req: IncomingMessage,
  identity: MockRequestIdentity,
): AnalyticsSender | undefined {
  // Tokens and sessions issued by the mock server identify the user and keep sessions apart.
  if (identity.status === 'authenticated') {
    return { userId: identity.userId, sessionId: identity.sessionId ?? identity.userId };
  }
  // Only the MSAL mock's startup token is adapted; other foreign tokens stay unauthenticated.
  if (identity.status === 'unsupported') {
    const userId = readStartupMockUserId(req.headers.authorization);
    return userId ? { userId, sessionId: LOCAL_DEVELOPMENT_SESSION } : undefined;
  }
  return undefined;
}

export default resolveAnalyticsSender;
