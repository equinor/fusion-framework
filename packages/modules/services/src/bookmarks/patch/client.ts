import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod, ExtractApiVersion } from '../types';
import {
    PatchBookmarksApiVersion,
    PatchBookmarkRequest,
    PatchBookmarkResponse,
    PatchBookmarksResult,
} from './types';

import { extractApiVersion } from '../utils';

import { generateParameters } from './generate-parameters';

type Version<TVersion extends string> = ExtractApiVersion<TVersion, PatchBookmarksApiVersion>;

/**
 * Generates a function that can be used to patch a bookmark using the provided HTTP client.
 *
 * @param client - The HTTP client to use for the patch request.
 * @param version - The API version to use for the patch request.
 * @param method - The HTTP method to use for the patch request (default is 'json').
 * @returns A function that can be used to patch a bookmark with the provided arguments and options.
 */
export const patchBookmark = <
    TVersion extends PatchBookmarksApiVersion,
    TMethod extends keyof ClientMethod,
>(
    version: TVersion,
    client: IHttpClient,
    method: TMethod = 'json' as TMethod,
) => {
    const apiVersion = extractApiVersion<PatchBookmarksApiVersion>(version);
    const execute = client[method];
    return <
        TResponse = PatchBookmarkResponse<Version<TVersion>>,
        TResult = PatchBookmarksResult<Version<TVersion>, TMethod, TResponse>,
    >(
        args: PatchBookmarkRequest<Version<TVersion>>,
        init?: ClientRequestInit<IHttpClient, TResponse>,
    ): TResult => execute(...generateParameters(apiVersion, args, init)) as TResult;
};
