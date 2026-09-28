import { mockAuthTokenSignature } from './mock-auth-token-signature.js';
import type { MockRequestIdentity } from './discovery/create-router.js';

/**
 * Checks whether a decoded JWT segment is a JSON object.
 *
 * @param value - Decoded JSON value.
 * @returns Whether the value can be read as JWT claims.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Decodes a base64url JWT segment without validating it as a production credential.
 *
 * @param segment - Encoded JWT segment.
 * @returns Decoded JSON, or `undefined` when decoding or parsing fails.
 */
function decodeJwtSegment(segment: string): unknown {
  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
  } catch {
    return undefined;
  }
}

/**
 * Normalizes an Authorization header containing a mock-auth bearer token.
 *
 * @param authorization - Incoming Authorization header.
 * @returns Explicit authentication state for middleware request context.
 */
export function parseMockRequestIdentity(authorization: string | undefined): MockRequestIdentity {
  // Anonymous mock routes need an explicit state without requiring an Authorization header.
  if (authorization === undefined) return { status: 'missing' };

  const bearer = /^Bearer ([^\s]+)$/.exec(authorization);
  // Non-bearer or ambiguous header syntax is malformed rather than anonymous.
  if (!bearer) return { status: 'malformed' };

  const segments = bearer[1].split('.');
  // Mock-auth tokens use the same three-segment shape as the token contract from session auth.
  if (segments.length !== 3) return { status: 'malformed' };

  const [encodedHeader, encodedClaims, signature] = segments;
  const header = decodeJwtSegment(encodedHeader);
  const claims = decodeJwtSegment(encodedClaims);
  // Broken base64url or JSON must not escape into unrelated anonymous mock routes.
  if (!isRecord(header) || !isRecord(claims)) return { status: 'malformed' };

  // Only unsigned tokens minted by this mock server belong to the supported test-only contract.
  if (header.alg !== 'none' || header.typ !== 'JWT' || signature !== mockAuthTokenSignature) {
    return { status: 'unsupported' };
  }

  const userId = claims.oid;
  // The session-scoped mock-auth contract always normalizes the selected user into oid.
  if (typeof userId !== 'string' || userId.length === 0) return { status: 'malformed' };

  return { status: 'authenticated', userId, claims };
}
