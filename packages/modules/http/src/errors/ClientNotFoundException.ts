import { HttpException } from './HttpException.js';

/**
 * Thrown when `createClient(name)` is called with an unknown client key.
 *
 * This is only used when the provided string is neither a registered client name
 * nor an absolute `http:` or `https:` URL.
 */
export class ClientNotFoundException extends HttpException {
  /**
   * Identifies unknown-client failures, including errors from another bundle.
   *
   * @param error - Unknown thrown value.
   * @returns Whether the value identifies an unknown HTTP client.
   */
  public static override is(error: unknown): error is ClientNotFoundException {
    return (
      error instanceof ClientNotFoundException ||
      (HttpException.is(error) && error.name === 'ClientNotFoundException')
    );
  }

  /**
   * Creates an unknown-client failure.
   *
   * @param message - Explanation identifying the unavailable client.
   * @param options - Standard error options, including an optional cause.
   */
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ClientNotFoundException';
  }
}

export default ClientNotFoundException;
