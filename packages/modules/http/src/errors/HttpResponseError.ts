import { HttpException } from './HttpException.js';

/**
 * Represents an error that occurs when handling an HTTP response.
 * @template TResponse The type of the HTTP response.
 */
export class HttpResponseError<TResponse = Response> extends HttpException {
  static Name = 'HttpResponseError';

  /**
   * Identifies HTTP response failures, including JSON and SSE response errors.
   *
   * Only the presence of `response` is checked; its runtime shape is not validated.
   *
   * @param error - Unknown thrown value, possibly from another bundle.
   * @returns Whether the value is a response error with an unknown response payload.
   */
  public static override is(error: unknown): error is HttpResponseError<unknown> {
    // Preserve local subclass recognition even when a consumer customizes its error name.
    if (error instanceof HttpResponseError) {
      return true;
    }
    return (
      HttpException.is(error) &&
      (error.name === HttpResponseError.Name ||
        error.name === 'HttpJsonResponseError' ||
        error.name === 'ServerSentEventResponseError') &&
      'response' in error
    );
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
