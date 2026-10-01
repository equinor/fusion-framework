import { HttpClientException } from './HttpClientException.js';

/**
 * Represents an error that occurs when handling an HTTP response.
 * @template TResponse The type of the HTTP response.
 */
export class HttpResponseError<TResponse = Response> extends HttpClientException {
  static Name = 'HttpResponseError';

  /**
   * Determines whether an unknown thrown value is an {@link HttpResponseError}.
   *
   * @param error - Thrown value to inspect, including values crossing application bundle boundaries.
   * @returns True for `HttpResponseError` and every specialized subclass.
   */
  public static is(error: unknown): error is HttpResponseError {
    // Subclasses (HttpJsonResponseError, ServerSentEventResponseError) override `.name`, so this
    // base check can't require an exact name match; `response` is the structural feature every
    // class in this sub-hierarchy shares.
    return HttpClientException.is(error) && 'response' in error;
  }

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
    this.name = HttpResponseError.Name;
  }
}

export default HttpResponseError;
