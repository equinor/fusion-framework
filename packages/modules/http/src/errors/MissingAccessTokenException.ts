/**
 * Thrown when a scoped HTTP request cannot be sent because MSAL did not resolve an access token.
 *
 * The MSAL request handler fails closed rather than falling back to an anonymous request,
 * since a request that declares scopes has already signaled the target endpoint requires
 * authentication.
 */
export class MissingAccessTokenException extends Error {}

export default MissingAccessTokenException;
