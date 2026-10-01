import { HttpClientException } from './HttpClientException.js';

/**
 * Thrown when `createClient(name)` is called with an unknown client key.
 *
 * This is only used when the provided string is neither a registered client name
 * nor an absolute `http:` or `https:` URL.
 */
export class ClientNotFoundException extends HttpClientException {
  static Name = 'ClientNotFoundException';

  /**
   * Determines whether an unknown thrown value is a {@link ClientNotFoundException}.
   *
   * @param error - Thrown value to inspect, including values crossing application bundle boundaries.
   * @returns True when the value structurally matches this error, regardless of which module
   * instance constructed it.
   */
  public static is(error: unknown): error is ClientNotFoundException {
    return HttpClientException.is(error) && error.name === ClientNotFoundException.Name;
  }

  /**
   * @param message - The error message.
   * @param options - Additional error options.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = ClientNotFoundException.Name;
  }
}

export default ClientNotFoundException;
