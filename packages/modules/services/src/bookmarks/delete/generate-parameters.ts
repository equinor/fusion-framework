import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiClientArguments } from '../types';
import type { DeleteBookmarkApiVersion, DeleteBookmarkRequest } from './types';

import { HttpJsonResponseError } from '@equinor/fusion-framework-module-http';
import { generateEndpoint } from './generate-endpoint';

/**
 * Generates the default parameters for a client request to delete a bookmark.
 *
 * The `selector` function checks the response status and returns `true` if the
 * bookmark was successfully deleted. If the response is not successful, it
 * throws an error with the appropriate error message and cause.
 *
 * @returns The default parameters for a client request to delete a bookmark.
 */
const defaultParams: ClientRequestInit<IHttpClient, boolean> = {
    method: 'DELETE',
    selector: async (res) => {
        if (res.ok) {
            return true;
        }
        const message = `Could not delete bookmark. Status code: ${res.status}`;
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
 * Generates the API client arguments for deleting bookmarks.
 *
 * @param version - The version of the delete bookmarks API to use.
 * @param args - The request arguments for deleting bookmarks.
 * @param init - Optional additional request initialization options.
 * @returns The API client arguments, including the path and request parameters.
 */
export const generateParameters = <TResult, TVersion extends DeleteBookmarkApiVersion>(
    version: TVersion,
    args: DeleteBookmarkRequest<TVersion>,
    init?: ClientRequestInit<IHttpClient, TResult>,
): ApiClientArguments<IHttpClient, TResult> => {
    const path = generateEndpoint(version, args);

    const requestParams: ClientRequestInit<IHttpClient, TResult> = Object.assign(
        {},
        defaultParams,
        init,
    );

    return [path, requestParams];
};
