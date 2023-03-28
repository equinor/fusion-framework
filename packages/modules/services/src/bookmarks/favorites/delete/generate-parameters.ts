import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ApiClientArguments } from '../..';
import { generateEndpoint } from './generate-endpoint';
import { ApiVersions, DeleteBookmarkFavoriteArgs } from './types';

/** function for creating http client arguments  */
export const generateParameters = <
    TResult,
    TVersion extends ApiVersions,
    TClient extends IHttpClient = IHttpClient
>(
    version: TVersion,
    args: DeleteBookmarkFavoriteArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
): ApiClientArguments<TClient, TResult> => {
    const path = generateEndpoint(version, args);

    const requestParams: ClientRequestInit<TClient, TResult> = Object.assign(
        {},
        { method: 'Delete' },
        init
    );

    return [path, requestParams];
};
