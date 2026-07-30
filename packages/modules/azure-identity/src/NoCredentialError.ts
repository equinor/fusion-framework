/**
 * Thrown when a provider cannot acquire a token because no cached credentials
 * or authentication record are available.
 *
 * Allows callers (e.g. the CLI `token` command) to discriminate this specific
 * failure without relying on brittle string matching.
 */
export class NoCredentialError extends Error {
  /** Discriminant used to identify this error type. */
  override readonly name = 'NoCredentialError';
}
