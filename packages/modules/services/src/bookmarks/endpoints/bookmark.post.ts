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
import { ApiBookmarkPayload, ApiBookmarkSchema, ApiSourceSystem } from '../schemas';

/** API version which this operation uses. */
type AvailableVersions = ApiVersion.v1;

/** Defines the allowed versions for this operation. (key of enum as string or enum value) */
type AllowedVersions = FilterAllowedApiVersions<AvailableVersions>;

/** Schema for the input arguments to this operation. */
const ArgSchema = {
  [ApiVersion.v1]: z.object({
    name: z.string(),
    appKey: z.string(),
    payload: z.record(z.string(), z.unknown()).or(z.string()).optional(),
    description: z.string().nullish(),
    isShared: z.boolean().nullish(),
    contextId: z.string().nullish(),
    sourceSystem: ApiSourceSystem[ApiVersion.v1].nullish(),
  }),
};

/** Schema for the response from the API. */
const ApiResponseSchema = {
  [ApiVersion.v1]: ApiBookmarkSchema[ApiVersion.v1].and(
    z.object({
      payload: ApiBookmarkPayload[ApiVersion.v1].optional(),
    }),
  ),
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
        method: 'POST',
        selector: schemaSelector(ApiResponseSchema[version]),
        body: args,
      };
      return Object.assign({}, baseInit, init);
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/** utility function for generating the api path */
const generateApiPath = <TVersion extends AvailableVersions>(
  version: TVersion,
  _args: z.infer<(typeof ArgSchema)[TVersion]>,
): string => {
  switch (version) {
    case ApiVersion.v1: {
      const params = new URLSearchParams();
      params.append('api-version', version);
      return `/bookmarks?${String(params)}`;
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
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as TResult;
  };
};

export {
  type AllowedVersions as CreateBookmarkVersion,
  type MethodArg as CreateBookmarkArg,
  type ApiResponse as CreateBookmarkResponse,
  type MethodResult as CreateBookmarksResult,
  executeApiCall as createBookmark,
};
