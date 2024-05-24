import { HttpJsonResponseError } from '../../errors';

/**
 * Asynchronously parses the JSON data from a given HTTP response.
 *
 * If the response has a status code of 204 (No Content), this function will resolve with `undefined`.
 *
 * If the response is not successful (i.e. `response.ok` is `false`), this function will throw an `HttpJsonResponseError` with the response details and the parsed data (if any).
 *
 * If there is an error parsing the JSON data, this function will throw an `HttpJsonResponseError` with the parsing error and the original response.
 *
 * @template TType - The expected type of the parsed JSON data.
 * @template TResponse - The type of the HTTP response object.
 * @param response - The HTTP response to parse.
 * @returns A promise that resolves with the parsed JSON data, or rejects with an `HttpJsonResponseError`.
 */
export const jsonSelector = async <TType = unknown, TResponse extends Response = Response>(
    response: TResponse,
): Promise<TType> => {
    /** Status code 204 indicates no content in the response */
    if (response.status === 204) {
        return Promise.resolve() as Promise<TType>;
    }

    try {
        // Parse the response JSON data
        const data = await response.json();

        // Check if the response was successful
        if (!response.ok) {
            // Throw an error with the response details
            throw new HttpJsonResponseError('network response was not OK', response, { data });
        }

        // Return the parsed data
        return data;
    } catch (cause) {
        // If the cause is an HttpJsonResponseError, rethrow it
        if (cause instanceof HttpJsonResponseError) {
            throw cause;
        }

        // Otherwise, throw a new HttpJsonResponseError with the parsing error
        throw new HttpJsonResponseError('failed to parse response', response, { cause });
    }
};

export default jsonSelector;
