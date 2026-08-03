/**
 * Claims that can be set on a generated mock token.
 *
 * @remarks
 * Mirrors the subset of Entra ID claims that Fusion applications read. Any
 * additional claims are passed through unchanged.
 */
export interface MockTokenClaims {
  /** Object ID of the signed-in user. */
  oid?: string;
  /** Display name of the signed-in user. */
  name?: string;
  /** UPN / email of the signed-in user. */
  preferred_username?: string;
  /** Tenant the token was issued for. */
  tid?: string;
  /** Audience — normally the client or resource the token is intended for. */
  aud?: string;
  /** Issuer. */
  iss?: string;
  /** Scopes granted, space-separated as in a real Entra ID token. */
  scp?: string;
  /** Issued-at, seconds since epoch. */
  iat?: number;
  /** Not-before, seconds since epoch. */
  nbf?: number;
  /** Expiry, seconds since epoch. */
  exp?: number;
  [claim: string]: unknown;
}

/**
 * Encodes a value as base64url without padding, as used in JWT segments.
 *
 * @param value - Raw string to encode.
 * @returns The base64url representation.
 */
const base64Url = (value: string): string => {
  // btoa operates on latin1; encodeURIComponent round-trip keeps non-ASCII names intact
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  // Iterate over encoded bytes so Unicode claims are preserved before base64url encoding.
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/**
 * Creates a structurally valid, unsigned JWT for use in tests.
 *
 * The token has three base64url segments and decodes to the supplied claims, so
 * code that splits, decodes, or inspects token claims behaves exactly as it does
 * in production. The signature segment is a fixed placeholder — the token is
 * **not** cryptographically valid and will be rejected by any real service.
 *
 * @remarks
 * Timestamps default to a fixed issue time and a one-hour lifetime so repeated
 * runs produce byte-identical tokens. A test that needs an expired token can set
 * `exp` in the past.
 *
 * @param claims - Claims to embed in the token payload.
 * @returns An unsigned JWT string in `header.payload.signature` form.
 *
 * @example
 * ```typescript
 * const token = createMockToken({ name: 'Test User', scp: 'Files.Read' });
 * const [, payload] = token.split('.');
 * JSON.parse(atob(payload)).name; // 'Test User'
 * ```
 */
export const createMockToken = (claims: MockTokenClaims = {}): string => {
  const header = { alg: 'none', typ: 'JWT' };
  // Fixed default clock keeps generated tokens byte-identical between runs
  const issuedAt = claims.iat ?? 1_700_000_000;
  const payload: MockTokenClaims = {
    iss: 'https://login.microsoftonline.com/fusion-test-tenant/v2.0',
    aud: 'fusion-test-client',
    tid: 'fusion-test-tenant',
    oid: 'fusion-test-user',
    iat: issuedAt,
    nbf: issuedAt,
    exp: issuedAt + 3600,
    ...claims,
  };

  return [
    base64Url(JSON.stringify(header)),
    base64Url(JSON.stringify(payload)),
    'fusion-test-signature',
  ].join('.');
};
