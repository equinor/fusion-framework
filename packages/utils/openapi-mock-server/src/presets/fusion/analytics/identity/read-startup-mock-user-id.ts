import { isJsonObject } from '../utils/index.js';

/**
 * Signature segment of the startup token minted in-process by the framework's MSAL mock
 * (`createMockToken` in `@equinor/fusion-framework-module-msal/mock`). Kept here as a literal
 * because the mock server does not depend on the MSAL module.
 */
const STARTUP_TOKEN_SIGNATURE = 'fusion-test-signature';

/**
 * Reads the user id from the framework MSAL mock's startup token — the identity a browser has in
 * `ffc app dev --mock` before a test selects a mock-auth user.
 *
 * @remarks
 * The mock server reports that token as `unsupported`, because it did not mint it. Analytics are
 * still expected from that browser, so the analytics mock accepts this one token shape — an
 * unsigned `alg: none` JWT with the MSAL mock's fixed signature — and nothing else. Missing,
 * malformed, and any other foreign tokens are not read.
 *
 * @param authorization - The request's `Authorization` header.
 * @returns The token's `oid` claim, or `undefined` when the header is not the startup token.
 *
 * @example
 * ```typescript
 * readStartupMockUserId(req.headers.authorization); // → 'fusion-mock-user'
 * ```
 */
export function readStartupMockUserId(authorization: string | undefined): string | undefined {
  const token = /^Bearer\s+(\S+)$/i.exec(authorization ?? '')?.[1];
  const [encodedHeader, encodedClaims, signature, ...rest] = token?.split('.') ?? [];
  // Only the exact three-segment startup token shape is accepted.
  if (!encodedHeader || !encodedClaims || signature !== STARTUP_TOKEN_SIGNATURE || rest.length) {
    return undefined;
  }

  const header = decodeSegment(encodedHeader);
  const claims = decodeSegment(encodedClaims);
  // A signed or otherwise unexpected token is never treated as the local startup identity.
  if (!isJsonObject(header) || header.alg !== 'none' || !isJsonObject(claims)) return undefined;
  return typeof claims.oid === 'string' && claims.oid ? claims.oid : undefined;
}

/**
 * Decodes one base64url JWT segment.
 *
 * @param segment - Encoded segment.
 * @returns The parsed JSON, or `undefined` when it cannot be decoded.
 */
function decodeSegment(segment: string): unknown {
  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
  } catch {
    return undefined;
  }
}

export default readStartupMockUserId;
