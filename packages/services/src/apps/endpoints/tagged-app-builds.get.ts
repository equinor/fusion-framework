import { z } from 'zod';

import type {
  ClientRequestInit,
  FetchRequestInit,
  IHttpClient,
  JsonRequest,
} from '@equinor/fusion-framework-module-http/client';

import type {
  ApiVersionContract,
  ClientMethod,
  ClientMethodType,
  ExtractApiVersion,
  FilterAllowedApiVersions,
  VersionedArgs,
  VersionedParsedArgs,
  VersionedResponse,
} from '../types';

import { extractVersion, parseVersionedArgs, versionedResponseSelector } from '../../utils';
import { ApiVersion } from '../static';
import { apiPagedCollectionSchemaV1 } from '../v1/schemas/api-paged-collection-schema-v1';
import { ApiTagAppBuildSchemaV1 } from '../v1/schemas/api-tag-app-build-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `listTaggedAppBuilds` accepts for `GET /tags/{tagName}/app-builds`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link ListTaggedAppBuildsArg} and {@link ListTaggedAppBuildsResponse}.
 */
type ListTaggedAppBuildsVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `listTaggedAppBuilds`, implementing `GET /tags/{tagName}/app-builds`.
 *
 * Each concrete {@link ApiVersion} maps to the argument and response schemas that version
 * publishes, so the version a caller passes is the single discriminator for the request shape, the
 * request path, and the response shape.
 */
const VersionContract = {
  [ApiVersion.v1]: {
    /** Arguments accepted by version 1.0 of this operation. */
    args: z
      .object({
        /** Tag name (e.g., "latest", "preview", "pr-42"). */
        tagName: z.string().describe('Tag name (e.g., "latest", "preview", "pr-42").'),
      })
      .describe('Arguments for GET /tags/{tagName}/app-builds (listTaggedAppBuilds v1.0).'),
    /** Response published by version 1.0. */
    response: apiPagedCollectionSchemaV1(ApiTagAppBuildSchemaV1),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `listTaggedAppBuilds` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiPagedCollectionV1<ApiTagAppBuildV1>`, inferred from
 * `apiPagedCollectionSchemaV1(ApiTagAppBuildSchemaV1)` — the very schema that validates the `200
 * OK` body at runtime.
 */
type ListTaggedAppBuildsResponse<TVersion extends ListTaggedAppBuildsVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `listTaggedAppBuilds` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifier `tagName`.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type ListTaggedAppBuildsArg<TVersion extends ListTaggedAppBuildsVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `listTaggedAppBuilds` hands back once the request runs, for the selected API version and
 * client method.
 *
 * `'json'` gives `Promise<ListTaggedAppBuildsResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<ListTaggedAppBuildsResponse<TVersion>>`, so promise and observable callers share
 * one response type.
 */
type ListTaggedAppBuildsResult<
  TVersion extends ListTaggedAppBuildsVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<ListTaggedAppBuildsResponse<TVersion>>[TMethod];

/** Builds the request init for the resolved version, including its response-schema selector. */
const generateRequestParameters = <TResult, TVersion extends AvailableVersions>(
  version: TVersion,
  _args: VersionedParsedArgs<typeof VersionContract, TVersion>,
  init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
  // Select the response schema that matches the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const baseInit: FetchRequestInit<ListTaggedAppBuildsResponse<ApiVersion.v1>, JsonRequest> = {
        selector: versionedResponseSelector(VersionContract, version),
      };
      // Apply the caller-supplied `init` first, then the generated defaults, so the generated
      // version-specific response `selector` always wins and cannot be overridden or bypassed.
      return Object.assign({}, init, baseInit);
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/** Builds the request path for the resolved version, including its `api-version` parameter. */
const generateApiPath = <TVersion extends AvailableVersions>(
  version: TVersion,
  args: VersionedParsedArgs<typeof VersionContract, TVersion>,
): string => {
  // Build the endpoint path according to the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const params = new URLSearchParams();
      params.append('api-version', version);
      return `/tags/${encodeURIComponent(args.tagName)}/app-builds?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Gets all app builds currently tagged with the specified tag name.
 *
 * Fusion Apps API operation: `GET /tags/{tagName}/app-builds` — "Gets all app builds currently
 * tagged with the specified tag name."
 *
 * Curried in two stages: `listTaggedAppBuilds(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for a promise,
 * `'json$'` for an observable stream. The returned function takes {@link ListTaggedAppBuildsArg}
 * plus an optional `ClientRequestInit`, and gives back {@link ListTaggedAppBuildsResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `apiPagedCollectionSchemaV1(ApiTagAppBuildSchemaV1)`, and sends `api-version=1.0` on the request.
 *
 * The Apps service answers `200 OK`; the body is typed `ApiPagedCollectionV1<ApiTagAppBuildV1>`.
 *
 * Related: `listAppTags`.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link ListTaggedAppBuildsArg} and an optional
 * `ClientRequestInit`, returning {@link ListTaggedAppBuildsResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { listTaggedAppBuilds } from '@equinor/fusion-services/apps';
 *
 * const result = await listTaggedAppBuilds('v1', httpClient)({ tagName: 'latest' });
 * ```
 */
const listTaggedAppBuilds = <
  TVersion extends ListTaggedAppBuildsVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: ListTaggedAppBuildsArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, ListTaggedAppBuildsResponse<MethodVersion>>,
  ): ListTaggedAppBuildsResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as ListTaggedAppBuildsResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type ListTaggedAppBuildsArg,
  type ListTaggedAppBuildsResponse,
  type ListTaggedAppBuildsResult,
  type ListTaggedAppBuildsVersion,
  listTaggedAppBuilds,
};
