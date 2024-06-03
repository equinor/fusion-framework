import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod, ExtractApiVersion } from '../types';
import type {
    DeleteBookmarkApiVersion,
    DeleteBookmarkRequest,
    DeleteBookmarkResponse,
    DeleteBookmarkResult,
} from './types';

import { extractApiVersion } from '../utils';

import { generateParameters } from './generate-parameters';

type Version<TVersion extends string> = ExtractApiVersion<TVersion, DeleteBookmarkApiVersion>;

/**
 * Deletes a bookmark from the server.
 *
 * @param version - The API version to use for the request.
 * @param method - The HTTP method to use for the request (default is 'json').
 * @returns A function that can be called to execute the delete bookmark request.
 */
export const deleteBookmark = <
    TVersion extends DeleteBookmarkApiVersion,
    TMethod extends keyof ClientMethod,
>(
    version: TVersion,
    client: IHttpClient,
    method: TMethod = 'json' as TMethod,
) => {
    const apiVersion = extractApiVersion<DeleteBookmarkApiVersion>(version);
    const execute = client[method];
    return <
        TResponse = DeleteBookmarkResponse<Version<TVersion>>,
        TResult = DeleteBookmarkResult<Version<TVersion>, TMethod, TResponse>,
    >(
        args: DeleteBookmarkRequest<TVersion>,
        init?: ClientRequestInit<IHttpClient, TResponse>,
    ): TResult => execute(...generateParameters(apiVersion, args, init)) as TResult;
};

export default deleteBookmark;
