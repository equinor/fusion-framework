import { HttpJsonResponseError, HttpResponseError } from '@equinor/fusion-framework-module-http';
import { type ResponseSelector } from '@equinor/fusion-framework-module-http/selectors';

/**
 * A response selector that checks the status of an HTTP response and throws an error if the response is not successful.
 *
 * @param res - The HTTP response to check.
 * @returns `true` if the response is successful, otherwise throws an `HttpJsonResponseError`.
 * @throws {HttpJsonResponseError} If the response is not successful, with the error message, response, and any additional data or cause.
 */
export const statusSelector: ResponseSelector<boolean> = async (res) => {
    if (res.ok) {
        return true;
    }
    const message = `Failed to execute request. Status code: ${res.status}`;
    let cause: unknown;
    let data: unknown;
    switch (res.status) {
        case 403:
        case 404: {
            try {
                data = await res.json();
            } catch (error) {
                cause = error;
            }
        }
    }
    throw new HttpJsonResponseError(message, res, { cause, data });
};

/**
 * A response selector that checks the status of an HTTP response is `2xx` = true or `404` = false, otherwise throws an error.
 *
 * @param res - The HTTP response to check.
 * @returns `true` if the response is successful, `false` if the response has a 404 status code, otherwise throws an `HttpJsonResponseError`.
 * @throws {HttpJsonResponseError} If the response is not successful and does not have a 404 status code, with the error message, response, and any additional data or cause.
 */
export const headSelector: ResponseSelector<boolean> = async (res) => {
    if (res.ok) {
        return true;
    }
    if (res.status === 404) {
        return false;
    }
    throw new HttpResponseError(`Failed to execute request. Status code: ${res.status}`, res);
};
