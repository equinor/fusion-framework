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

  /**
   * @param message - Description of the error.
   * @param options - Optional error options, including a cause for error chaining.
   */
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = SilentTokenAcquisitionError.Name;
  }
}
