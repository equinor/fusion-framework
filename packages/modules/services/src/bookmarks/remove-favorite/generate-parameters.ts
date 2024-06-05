import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiClientArguments } from '../types';
import type { RemoveFavouriteBookmarkApiVersion, RemoveFavouriteBookmarkRequest } from './types';

import { HttpJsonResponseError } from '@equinor/fusion-framework-module-http';
import { generateEndpoint } from './generate-endpoint';

/**
 * Generates the default parameters for a client request to remove a favorite.
 *
 * The request will be a DELETE request, and the response will be checked for success.
 * If the response is not successful, an `HttpJsonResponseError` will be thrown with the
 * appropriate error message and data.
 *
 * @returns {ClientRequestInit<IHttpClient, boolean>} The default parameters for the request.
 */
const defaultParams: ClientRequestInit<IHttpClient, boolean> = {
    method: 'DELETE',
    selector: async (res) => {
        if (res.ok) {
            return true;
        }
        const message = `Could not remove favourite. Status code: ${res.status}`;
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
    },
};

/**
 * Generates the parameters for a request to remove a favorite bookmark.
 *
 * @param version - The API version to use for the request.
 * @param request - The request arguments, including the bookmark ID to remove.
 * @param init - Optional additional request initialization options.
 * @returns An array containing the request path and request parameters.
 */
export const generateParameters = <TResult, TVersion extends RemoveFavouriteBookmarkApiVersion>(
    version: TVersion,
    request: RemoveFavouriteBookmarkRequest<TVersion>,
    init?: ClientRequestInit<IHttpClient, TResult>,
): ApiClientArguments<IHttpClient, TResult> => {
    const path = generateEndpoint(version, request);

    const requestParams: ClientRequestInit<IHttpClient, TResult> = Object.assign(
        {},
        defaultParams,
        init,
    );

    return [path, requestParams];
};
