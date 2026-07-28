import { ProcessOperators } from './process-operators';

/**
 * The `HttpResponseHandler` class extends the `ProcessOperators` class and is responsible for handling HTTP responses.
 * It provides a common interface for processing HTTP responses, allowing for consistent error handling and response transformation.
 *
 * @template T - The type of the HTTP response. Defaults to `Response`.
 */
export class HttpResponseHandler<T = Response> extends ProcessOperators<T> {}

export default HttpResponseHandler;
