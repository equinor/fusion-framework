import { HttpResponseError } from './HttpResponseError.js';

/**
 * Represents an error that occurs when handling a server-sent event (SSE) HTTP response.
 *
 * @template TType - The type of additional data associated with the error.
 * @template TResponse - The type of the HTTP response object.
 *
 * @extends HttpResponseError<TResponse>
 */
export class ServerSentEventResponseError<
  TType = unknown,
  TResponse = Response,
> extends HttpResponseError<TResponse> {
  static Name = 'ServerSentEventResponseError';

  /**
   * Creates a new instance of the error.
   *
   * @param message - The error message describing the cause of the error.
   * @param response - The HTTP response associated with the error.
   * @param options - Optional error options, which may include additional data of type `TType`.
   */
  constructor(message: string, response: TResponse, options?: ErrorOptions & { data?: TType }) {
    super(message, response, options);
    this.name = ServerSentEventResponseError.Name;
  }
}

export default ServerSentEventResponseError;
