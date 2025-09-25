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
type AvailableVersions = ApiVersion.v1 | ApiVersion.v2;

/** Defines the allowed versions for this operation. (key of enum as string or enum value) */
type AllowedVersions = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Schema transformer of the filter object to an OData filter string.
 *
 * @todo This function should be moved to a shared utility module.
 */
const transformOdataFilter = (filter: Record<string, unknown>) => {
  return Object.entries(filter)
    .map(([key, value]) => {
      if (value === null) {
        return `${key} eq null`;
      }
      if (typeof value === 'string') {
        return `${key} eq '${value}'`;
      }
      if (typeof value === 'boolean') {
        return `${key} eq ${value}`;
      }
      if (typeof value === 'object') {
        return Object.entries(value)
          .map(([subKey, subValue]) => `${key}.${subKey} eq '${subValue}'`)
          .join(' and ');
      }
      return undefined;
    })
    .filter((x) => !!x)
    .join(' and ');
};

const filterSchema_v1 = z
  .object({
    appKey: z.string().optional(),
    contextId: z.string().optional(),
    sourceSystem: ApiSourceSystem[ApiVersion.v1].partial().optional(),
  })
  .transform(transformOdataFilter);

const filterSchema_v2 = z
  .object({
    appKey: z.string().optional(),
    contextId: z.string().optional(),
    sourceSystem: ApiSourceSystem[ApiVersion.v1].partial().optional(),
    isFavourite: z.boolean().optional(),
  })
  .transform(transformOdataFilter);

/** Schema for the input arguments to this operation. */
const ArgSchema = {
  [ApiVersion.v1]: z
    .object({
      filter: z.string().or(filterSchema_v1).optional(),
    })
    .optional(),
  [ApiVersion.v2]: z
    .object({
      filter: z.string().or(filterSchema_v2).optional(),
    })
    .optional(),
} as const;

/** Schema for the response from the API. */
const ApiResponseSchema = {
  [ApiVersion.v1]: z.array(ApiBookmarkSchema[ApiVersion.v1]),
  [ApiVersion.v2]: z.array(ApiBookmarkSchema[ApiVersion.v2]),
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
    case ApiVersion.v1:
    case ApiVersion.v2: {
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
    case ApiVersion.v1:
    case ApiVersion.v2: {
      const params = new URLSearchParams();
      params.append('api-version', version);
      args?.filter && params.append('$filter', args.filter);
      return `/persons/me/bookmarks/?${String(params)}`;
    }
    default: {
      throw new Error(`Unknown API version: ${version}`);
    }
  }
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
    const args = ArgSchema[apiVersion].parse(input) as z.infer<(typeof ArgSchema)[MethodVersion]>;
    const path = generateApiPath(apiVersion as AvailableVersions, args);
    const params = generateRequestParameters(apiVersion as AvailableVersions, args, init);
    return client[method](path, params) as TResult;
  };
};

export {
  type AllowedVersions as GetBookmarksVersion,
  type MethodArg as GetBookmarksArgs,
  type ApiResponse as GetBookmarksResponse,
  type MethodResult as GetBookmarksResult,
  executeApiCall as getBookmarks,
};
