import type { MsalMockUser } from './MsalMockClient';
import { decodeJwtSegment } from './decode-jwt-segment';
import type { MockTokenClaims } from './create-mock-token';

/**
 * Derives a {@link MsalMockUser} from a JWT's payload claims, so a token minted
 * outside this module (e.g. by a backend's own mock) can drive who the mock
 * signs in as.
 *
 * @remarks
 * Maps the standard Entra ID claims Fusion applications read — `name`,
 * `preferred_username`, `oid`, `tid`, `scp` — onto the matching
 * {@link MsalMockUser} fields. Identity only: it does not affect which token
 * the client returns — use {@link MsalMockConfigurator.setToken} for that.
 *
 * @param token - A JWT (e.g. from {@link createMockToken}, or issued by an
 * external mock) with a base64url-encoded payload segment.
 * @returns A mock user built from the token's claims.
 * @throws When the token has no payload segment (`header.payload.signature`).
 *
 * @example
 * ```typescript
 * enableMsalMock(configurator, (builder) => {
 *   builder.setAccount(createMockUserFromToken(token));
 * });
 * ```
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
