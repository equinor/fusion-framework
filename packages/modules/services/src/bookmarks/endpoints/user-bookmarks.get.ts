import { z } from 'zod';

import type {
    ClientRequestInit,
    FetchRequestInit,
    IHttpClient,
    JsonRequest,
} from '@equinor/fusion-framework-module-http/client';

import type { ClientMethod, ExtractApiVersion, FilterAllowedApiVersions } from '../types';

import { extractVersion, schemaSelector } from '../../utils';
import { ApiVersion } from '../api-version';
import { ApiBookmarkSchema, ApiSourceSystem } from '../schemas';

/** API version which this operation uses. */
type AvailableVersions = ApiVersion.v1;

/** Defines the allowed versions for this operation. (key of enum as string or enum value) */
type AllowedVersions = FilterAllowedApiVersions<AvailableVersions>;

/** Schema for the input arguments to this operation. */
const ArgSchema = {
    [ApiVersion.v1]: z
        .object({
            filter: z
                .string()
                .or(
                    z
                        .object({
                            appKey: z.string().optional(),
                            contextId: z.string().optional(),
                            sourceSystem: ApiSourceSystem[ApiVersion.v1].partial().optional(),
                        })
                        .transform((x) => {
                            return Object.entries(x)
                                .map(([key, value]) => {
                                    if (typeof value === 'string') {
                                        return `${key} eq '${value}'`;
                                    }
                                    if (typeof value === 'object') {
                                        return Object.entries(value)
                                            .map(
                                                ([subKey, subValue]) =>
                                                    `${key}.${subKey} eq '${subValue}'`,
                                            )
                                            .join(' and ');
                                    }
                                })
                                .filter((x) => !!x)
                                .join(' and ');
                        }),
                )
                .optional(),
        })
        .optional(),
};

/** Schema for the response from the API. */
const ApiResponseSchema = {
    [ApiVersion.v1]: z.array(ApiBookmarkSchema[ApiVersion.v1]),
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
    _args: z.infer<(typeof ArgSchema)[TVersion]>,
    init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
    switch (version) {
        case ApiVersion.v1: {
            const baseInit: FetchRequestInit<ApiResponse<ApiVersion.v1>, JsonRequest> = {
                selector: schemaSelector(ApiResponseSchema[version]),
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
            args?.filter && params.append('$filter', args.filter);
            return `/persons/me/bookmarks/?${String(params)}`;
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
    return <
        TResponse = ApiResponse<MethodVersion>,
        TResult = MethodResult<MethodVersion, TMethod, TResponse>,
    >(
        input: MethodArg<MethodVersion>,
        init?: ClientRequestInit<IHttpClient, TResponse>,
    ): TResult => {
        const args = ArgSchema[apiVersion].parse(input);
        const path = generateApiPath(apiVersion, args);
        const params = generateRequestParameters(apiVersion, args, init);
        return client[method](path, params) as TResult;
    };
};

export {
    AllowedVersions as GetBookmarksVersion,
    MethodArg as GetBookmarksArgs,
    ApiResponse as GetBookmarksResponse,
    MethodResult as GetBookmarksResult,
    executeApiCall as getBookmarks,
};
