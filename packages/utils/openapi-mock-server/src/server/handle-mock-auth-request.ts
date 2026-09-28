import type { IncomingMessage, ServerResponse } from 'node:http';

import { readJsonBody } from './read-json-body.js';
import { sendJson } from './send-json.js';
import type { MockAuthSessionStore, MockAuthUser } from './MockAuthSessionStore.js';
import { mockAuthTokenSignature } from '../mock-auth-token-signature.js';

interface MockAuthBody {
  userId?: unknown;
  name?: unknown;
  username?: unknown;
  tenantId?: unknown;
  claims?: unknown;
  scopes?: unknown;
}

/**
 * Validates and normalizes a browser-session mock user.
 *
 * @param value - Parsed request body.
 * @returns A normalized user, or `undefined` for invalid input.
 */
function parseUser(value: unknown): MockAuthUser | undefined {
  // User selection accepts only a JSON object with a deterministic object ID.
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const { userId, name, username, tenantId, claims } = value as MockAuthBody;
  // Reject partial user records before claims are persisted in the session store.
  if (
    typeof userId !== 'string' ||
    userId.length === 0 ||
    (name !== undefined && typeof name !== 'string') ||
    (username !== undefined && typeof username !== 'string') ||
    (tenantId !== undefined && typeof tenantId !== 'string') ||
    (claims !== undefined &&
      (claims === null || typeof claims !== 'object' || Array.isArray(claims)))
  ) {
    return undefined;
  }
  // Preserve only validated optional fields when normalizing the selected user.
  return {
    userId,
    ...(typeof name === 'string' ? { name } : {}),
    ...(typeof username === 'string' ? { username } : {}),
    ...(typeof tenantId === 'string' ? { tenantId } : {}),
    ...(claims ? { claims: claims as Record<string, unknown> } : {}),
  };
}

/**
 * Reads and normalizes requested scopes from a resolution request.
 *
 * @param value - Parsed request body.
 * @returns Normalized scopes, or `undefined` for invalid input.
 */
function parseRequestedScopes(value: unknown): string[] | undefined {
  // Resolution accepts only a JSON object with a string-array scope set.
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const { scopes } = value as MockAuthBody;
  // Every requested scope must be a non-empty string before token issuance.
  const hasValidScopes =
    Array.isArray(scopes) &&
    scopes.every((scope): scope is string => typeof scope === 'string' && scope.length > 0);
  // An empty request cannot deterministically select a scoped override.
  if (!hasValidScopes || scopes.length === 0) {
    return undefined;
  }
  return [...new Set(scopes)].sort();
}

/**
 * Encodes one JWT segment as base64url.
 *
 * @param value - JSON value to encode.
 * @returns Encoded JWT segment.
 */
function encodeJwtSegment(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

/**
 * Mints an unsigned OBO-style token for a selected user and requested scopes.
 *
 * @param user - Browser-session user.
 * @param scopes - Scopes requested by the Fusion MSAL provider.
 * @returns Deterministic unsigned mock JWT.
 */
function createUserToken(user: MockAuthUser, scopes: string[]): string {
  const tenantId = user.tenantId ?? 'fusion-mock-tenant';
  const audience = scopes[0]?.replace(/\/\.default$/, '') ?? 'fusion-mock-client';
  const issuedAt = 1_700_000_000;
  const payload = {
    ...user.claims,
    iss: `https://login.microsoftonline.com/${tenantId}/v2.0`,
    aud: audience,
    tid: tenantId,
    oid: user.userId,
    name: user.name ?? user.userId,
    preferred_username: user.username ?? `${user.userId}@example.test`,
    iat: issuedAt,
    nbf: issuedAt,
    exp: issuedAt + 3600,
    scp: scopes.join(' '),
  };
  return [
    encodeJwtSegment({ alg: 'none', typ: 'JWT' }),
    encodeJwtSegment(payload),
    mockAuthTokenSignature,
  ].join('.');
}

/**
 * Handles the mock server's session user and OBO-style token REST API.
 *
 * @param store - In-memory browser-session token store.
 * @param method - Normalized HTTP method.
 * @param resource - Route segment identifying the auth resource.
 * @param request - Incoming request.
 * @param response - Response to complete.
 */
export async function handleMockAuthRequest(
  store: MockAuthSessionStore,
  method: string,
  resource: string,
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  const sessionId = store.resolveSessionId(request, response);

  // Reading a user returns only non-sensitive session metadata.
  if (resource === 'user' && method === 'GET') {
    const user = store.get(sessionId);
    sendJson(response, 200, {
      configured: Boolean(user),
      user: user
        ? {
            userId: user.userId,
            name: user.name,
            username: user.username,
            tenantId: user.tenantId,
          }
        : undefined,
    });
    return;
  }

  // Deleting a user restores the session to the default MSAL identity.
  if (resource === 'user' && method === 'DELETE') {
    store.delete(sessionId);
    sendJson(response, 200, { configured: false });
    return;
  }

  // User selection validates metadata before replacing the session persona.
  if (resource === 'user' && method === 'PUT') {
    const user = parseUser(await readJsonBody(request));
    // Credentials are never accepted; tests select only deterministic user metadata.
    if (!user) {
      sendJson(response, 400, {
        error: 'Expected a mock user with a non-empty "userId".',
      });
      return;
    }
    store.set(sessionId, user);
    sendJson(response, 200, { configured: true });
    return;
  }

  // Token acquisition resolves the current persona for the requested resource scopes.
  if (resource === 'token' && method === 'POST') {
    const scopes = parseRequestedScopes(await readJsonBody(request));
    // OBO-style acquisition always requires the target resource scopes.
    if (!scopes) {
      sendJson(response, 400, { error: 'Expected at least one non-empty scope.' });
      return;
    }

    const user = store.get(sessionId);
    // Missing means the MSAL mock should restore its startup identity.
    if (!user) {
      sendJson(response, 200, { status: 'missing' });
      return;
    }

    sendJson(response, 200, { status: 'issued', token: createUserToken(user, scopes) });
    return;
  }

  response.setHeader('allow', resource === 'token' ? 'POST' : 'GET, PUT, DELETE');
  sendJson(response, 405, { error: 'Method not allowed' });
}
