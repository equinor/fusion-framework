import { z } from 'zod';

import type {
    ClientRequestInit,
    FetchRequestInit,
    IHttpClient,
    JsonRequest,
} from '@equinor/fusion-framework-module-http/client';

import type { ClientMethod, ExtractApiVersion, FilterAllowedApiVersions } from './types';

import { extractVersion } from '../utils';
import { ApiVersion } from './api-version';
import { statusSelector } from './selectors';

/** API version which this operation uses. */
type AvailableVersions = ApiVersion.v1;

/** Defines the allowed versions for this operation. (key of enum as string or enum value) */
type AllowedVersions = FilterAllowedApiVersions<AvailableVersions>;

/** Schema for the input arguments to this operation. */
const ArgSchema = {
    [ApiVersion.v1]: z.object({
        bookmarkId: z.string(),
    }),
};

/** Schema for the response from the API. */
const ApiResponseSchema = {
    [ApiVersion.v1]: z.boolean(),
};

/** Defines the expected output from the api. */
type ApiResponse<TVersion extends AllowedVersions> = z.infer<
    (typeof ApiResponseSchema)[ExtractApiVersion<TVersion>]
>;

/** Defines the input arguments to this operation. */
type MethodArg<TVersion extends AllowedVersions> = z.input<
    (typeof ArgSchema)[ExtractApiVersion<TVersion>]
>;

/** Defines the expected output of this operation. */
type MethodResult<
    TVersion extends AllowedVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = ApiResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];

/** utility function for generating http request initialization parameters  */
const generateRequestParameters = <TResult, TVersion extends AvailableVersions>(
    version: TVersion,
    args: z.infer<(typeof ArgSchema)[TVersion]>,
    init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
    switch (version) {
        case ApiVersion.v1: {
            const baseInit: FetchRequestInit<ApiResponse<ApiVersion.v1>, JsonRequest> = {
                method: 'DELETE',
                selector: statusSelector,
            };
            return Object.assign({}, baseInit, init);
        }
    }
    throw Error(`Unknown API version: ${version}`);
};

/** utility function for generating the api path */
const generateApiPath = <TVersion extends AvailableVersions>(
    version: TVersion,
    args: z.infer<(typeof ArgSchema)[TVersion]>,
): string => {
    switch (version) {
        case ApiVersion.v1: {
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `/persons/me/bookmarks/favourites/${args.bookmarkId}?${String(params)}`;
        }
    }
    throw Error(`Unknown API version: ${version}`);
};

/** executes the api call */
const executeApiCall = <TVersion extends AllowedVersions, TMethod extends keyof ClientMethod>(
    version: TVersion,
    client: IHttpClient,
    method: TMethod = 'json' as TMethod,
) => {
    type MethodVersion = ExtractApiVersion<TVersion>;
    const apiVersion = extractVersion(ApiVersion, version);
    const execute = client[method];
    return <
        TResponse = ApiResponse<MethodVersion>,
        TResult = MethodResult<MethodVersion, TMethod, TResponse>,
    >(
        input: MethodArg<MethodVersion>,
        init?: ClientRequestInit<IHttpClient, TResponse>,
    ): TResult => {
        const args = ArgSchema[apiVersion].parse(input);
        return execute(
            generateApiPath(apiVersion, args),
            generateRequestParameters(apiVersion, args, init),
        ) as TResult;
    };
};

export {
    AllowedVersions as RemoveBookmarkFavouriteVersion,
    MethodArg as RemoveBookmarkFavouriteArgs,
    ApiResponse as RemoveBookmarkFavouriteResponse,
    MethodResult as RemoveBookmarkFavouriteResult,
    executeApiCall as removeFavoriteBookmark,
};
