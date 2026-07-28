/**
 * Represents an error that occurs when handling an HTTP response.
 * @template TResponse The type of the HTTP response.
 */
export class HttpResponseError<TResponse = Response> extends Error {
  static Name = 'HttpResponseError';
  /**
   * @param message - The error message.
   * @param response - The HTTP response associated with the error.
   * @param options - Additional error options.
   */
  constructor(
    message: string,
    public readonly response: TResponse,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

export default HttpResponseError;
