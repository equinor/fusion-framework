import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiClientArguments } from '../types';
import type { GetBookmarkPayloadApiVersion, GetBookmarkPayloadRequest } from './types';

import { generateEndpoint } from './generate-endpoint';

/**
 * Generates the API client arguments for a request to retrieve bookmark payload data.
 *
 * @param version - The version of the bookmark payload API to use.
 * @param args - The request arguments for the bookmark payload API.
 * @param init - Optional initialization options for the HTTP client.
 * @returns The API client arguments, including the endpoint path and any initialization options.
 */
export const generateParameters = <TResult, TVersion extends GetBookmarkPayloadApiVersion>(
    version: TVersion,
    args: GetBookmarkPayloadRequest<TVersion>,
    init?: ClientRequestInit<IHttpClient, TResult>,
): ApiClientArguments<IHttpClient, TResult> => {
    const path = generateEndpoint(version, args);
    return [path, init];
};
