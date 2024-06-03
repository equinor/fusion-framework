import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ApiClientArguments } from '../..';
import { generateEndpoint } from './generate-endpoint';
import { DeleteBookmarkApiVersion, DeleteBookmarkRequest } from './types';

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
        { method: 'Delete' },
        init,
    );

    return [path, requestParams];
};
