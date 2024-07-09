/**
 * Represents an error that occurs when handling an HTTP response.
 * @template TResponse The type of the HTTP response.
 */
export class HttpResponseError<TResponse = Response> extends Error {
    static Name = 'HttpResponseError';
    constructor(
        message: string,
        public readonly response: TResponse,
        options?: ErrorOptions,
    ) {
        super(message, options);
    }
}

/**
 * Represents an error that occurs when handling a JSON response in an HTTP request.
 * Extends the base `HttpResponseError` class.
 *
 * @template TType - The type of the data associated with the error.
 * @template TResponse - The type of the HTTP response.
 */
export class HttpJsonResponseError<
    TType = unknown,
    TResponse = Response,
> extends HttpResponseError<TResponse> {
    static Name = 'HttpJsonResponseError';
    public readonly data?: TType;

    /**
     * Creates a new instance of `HttpJsonResponseError`.
     *
     * @param message - The error message.
     * @param response - The HTTP response associated with the error.
     * @param options - Additional options for the error, including the associated data.
     */
    constructor(message: string, response: TResponse, options?: ErrorOptions & { data?: TType }) {
        super(message, response, options);
        this.name = HttpJsonResponseError.Name;
        this.data = options?.data;
    }
}
