import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiClientArguments } from '../..';
import { generateEndpoint } from './generate-endpoint';
import type { ApiVersions, PostBookmarkFavoriteArgs } from './types';

/** function for creating http client arguments  */
export const generateParameters = <
    TResult,
    TVersion extends ApiVersions,
    TClient extends IHttpClient = IHttpClient,
>(
    version: TVersion,
    args: PostBookmarkFavoriteArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
): ApiClientArguments<TClient, TResult> => {
    const path = generateEndpoint(version, args);

    const headers = new Headers();
    headers.append('content-type', 'application/json');

    const requestParams: ClientRequestInit<TClient, TResult> = Object.assign(
        {},
        { method: 'POST', body: JSON.stringify(args), headers: headers },
        init,
    );

    return [path, requestParams];
};
