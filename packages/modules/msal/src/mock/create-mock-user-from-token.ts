import { decodeJwtSegment } from './decode-jwt-segment.js';
import type { MockTokenClaims } from './create-mock-token.js';
import type { MsalMockUser } from './types.js';

/**
 * Derives internal mock identity fields from a JWT payload.
 *
 * @remarks
 * Maps the standard Entra ID claims Fusion applications read — `name`,
 * `preferred_username`, `oid`, `tid`, `scp` — onto the matching
 * {@link MsalMockUser} fields used to synchronize the account with the acquired token.
 *
 * @param token - A JWT (e.g. from {@link createMockToken}, or issued by an
 * external mock) with a base64url-encoded payload segment.
 * @returns A mock user built from the token's claims.
 * @throws When the token has no payload segment (`header.payload.signature`).
 *
 */
export const createMockUserFromToken = (token: string): MsalMockUser => {
  const [, payload] = token.split('.');
  // fail loudly rather than signing in an empty/garbage user from a malformed token
  if (!payload) {
    throw new Error(
      'createMockUserFromToken: expected a JWT with a payload segment (header.payload.signature)',
    );
  }

  const claims: MockTokenClaims = JSON.parse(decodeJwtSegment(payload));

  return {
    name: claims.name,
    username: claims.preferred_username,
    userId: claims.oid,
    tenantId: claims.tid,
    scopes: claims.scp?.split(' '),
  };
};
