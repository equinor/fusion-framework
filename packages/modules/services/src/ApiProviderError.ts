/**
 * Shape of the structured error response attached to an {@link ApiProviderError}.
 */
type ApiProviderErrorResponse = {
  type: ResponseType;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;
  data: unknown;
};

/**
 * Error thrown when an API response indicates a non-OK HTTP status.
 *
 * Contains the full response details so callers can inspect the failure.
 */
export class ApiProviderError extends Error {
  /** Structured HTTP response data associated with this error. */
  readonly response: ApiProviderErrorResponse;

  /**
   * Creates an API provider error with response details.
   *
   * @param msg - Human-readable error message.
   * @param response - The parsed HTTP response details.
   * @param options - Standard `ErrorOptions` such as `cause`.
   */
  constructor(msg: string, response: ApiProviderErrorResponse, options?: ErrorOptions) {
    super(msg, options);
    this.response = response;
    this.name = 'ApiProviderError';
  }
}
