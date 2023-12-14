import { HttpJsonResponseError } from '../../errors';

/**
 * Converts the JSON response from an HTTP request into the specified type.
 * If the response is not OK or if there is an error parsing the response, an error is thrown.
 * If the response has a status code of 204 (No Content), a resolved Promise is returned.
 *
 * @param response The HTTP response object.
 * @returns A Promise that resolves to the parsed JSON data.
 * @throws {Error} If the network response is not OK.
 * @throws {HttpJsonResponseError} If there is an error parsing the response.
 */
export const jsonSelector = async <TType = unknown, TResponse extends Response = Response>(
    response: TResponse,
): Promise<TType> => {
    /** Status code 204 is no content */
    if (response.status === 204) {
        return Promise.resolve() as Promise<TType>;
    }

    try {
        const data = await response.json();
        if (!response.ok) {
            throw new HttpJsonResponseError('network response was not OK', response, { data });
        }
        return data;
    } catch (cause) {
        throw new HttpJsonResponseError('failed to parse response', response, { cause });
    }
};

export default jsonSelector;
