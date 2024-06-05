import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiClientArguments } from '../types';
import type { AddFavouriteBookmarkApiVersion, AddFavouriteBookmarkRequest } from './types';

import { HttpJsonResponseError } from '@equinor/fusion-framework-module-http';
import { generateEndpoint } from './generate-endpoint';

/**
 * Provides default parameters for a client request to add a bookmark to the user's favorites.
 *
 * The `selector` function checks the response status and returns `true` if the request was successful.
 * If the request failed, it throws an `HttpJsonResponseError` with the appropriate error message and additional information.
 *
 * @param res - The response object from the client request.
 * @returns `true` if the request was successful, otherwise throws an `HttpJsonResponseError`.
 */
const defaultParams: ClientRequestInit<IHttpClient, boolean> = {
    method: 'POST',
    selector: async (res) => {
        if (res.ok) {
            return true;
        }
        const message = `Could not add bookmark to user favourites. Status code: ${res.status}`;
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
 * Generates the API client arguments for adding a favourite bookmark.
 *
 * @param version - The API version to use.
 * @param request - The request arguments for adding a favourite bookmark.
 * @param init - Optional initialization options for the client request.
 * @returns The API client arguments, including the request path and parameters.
 */
export const generateParameters = <TResult, TVersion extends AddFavouriteBookmarkApiVersion>(
    version: TVersion,
    request: AddFavouriteBookmarkRequest<TVersion>,
    init?: ClientRequestInit<IHttpClient, TResult>,
): ApiClientArguments<IHttpClient, TResult> => {
    const path = generateEndpoint(version, request);
    const params: ClientRequestInit<IHttpClient, TResult> = Object.assign({}, defaultParams, init);
    return [path, params];
};
