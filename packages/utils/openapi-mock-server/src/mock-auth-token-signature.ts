/**
 * Identifies bearer tokens minted by the standalone mock-auth server.
 *
 * @remarks
 * This marker is not a cryptographic signature. It only prevents middleware from
 * treating unrelated JWTs as supported mock identities.
 */
export const mockAuthTokenSignature = 'fusion-mock-signature';
