/**
 * Error thrown when no accounts are available for an operation that requires one.
 *
 * Typically used when attempting to acquire a token or perform an action that requires
 * a user account, but none are found in the MSAL cache.
 *
 * @param message - Description of the error.
 * @param options - Optional error options, including a cause for error chaining.
 */
export class NoAccountsError extends Error {
  static readonly Name: string = 'NoAccountsError';
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = NoAccountsError.Name;
  }
}

/**
 * Error thrown when silent token acquisition fails.
 *
 * This error is used when MSAL cannot acquire a token silently, often due to missing
 * credentials, expired tokens, or lack of a valid session.
 *
 * @param message - Description of the error.
 * @param options - Optional error options, including a cause for error chaining.
 */
export class SilentTokenAcquisitionError extends Error {
  static readonly Name: string = 'SilentTokenAcquisitionError';
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = SilentTokenAcquisitionError.Name;
  }
}

/**
 * Error representing a failure or issue in the authentication server flow.
 *
 * Used to signal problems during the OAuth 2.0 authorization code flow, such as
 * missing codes, invalid requests, or token exchange failures. Supports error chaining.
 *
 * @param message - Description of the error.
 * @param options - Optional error options, including a cause for error chaining.
 */
export class AuthServerError extends Error {
  static readonly Name: string = 'AuthServerError';
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = AuthServerError.Name;
  }
}

/**
 * Error thrown when the authentication server times out waiting for a response.
 *
 * Extends {@link AuthServerError} to provide additional context for timeout scenarios.
 *
 * @param message - Description of the error.
 * @param options - Optional error options, including a cause for error chaining.
 */
export class AuthServerTimeoutError extends AuthServerError {
  static readonly Name: string = 'AuthServerTimeoutError';
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = AuthServerTimeoutError.Name;
  }
}
