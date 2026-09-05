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
import { ApiAppListItemSchemaV1 } from '../v1/schemas/api-app-list-item-schema-v1';
import { apiPagedCollectionSchemaV1 } from '../v1/schemas/api-paged-collection-schema-v1';
import { ExpandSchemaV1 } from '../v1/schemas/expand-schema-v1';
import { FilterSchemaV1 } from '../v1/schemas/filter-schema-v1';
import { SearchSchemaV1 } from '../v1/schemas/search-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `listApps` accepts for `GET /apps`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link ListAppsArg} and {@link ListAppsResponse}.
 */
type ListAppsVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `listApps`, implementing `GET /apps`.
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
        /** The `$filter` query option. */
        filter: FilterSchemaV1,
        /** The `$search` query option. */
        search: SearchSchemaV1,
        /** The `$expand` query option. */
        expand: ExpandSchemaV1,
      })
      .describe('Arguments for GET /apps (listApps v1.0).'),
    /** Response published by version 1.0. */
    response: apiPagedCollectionSchemaV1(ApiAppListItemSchemaV1),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `listApps` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiPagedCollectionV1<ApiAppListItemV1>`, inferred from
 * `apiPagedCollectionSchemaV1(ApiAppListItemSchemaV1)` — the very schema that validates the `200
 * OK` body at runtime.
 */
type ListAppsResponse<TVersion extends ListAppsVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `listApps` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the optional query options `filter`, `search`, `expand`.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type ListAppsArg<TVersion extends ListAppsVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `listApps` hands back once the request runs, for the selected API version and client method.
 *
 * `'json'` gives `Promise<ListAppsResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<ListAppsResponse<TVersion>>`, so promise and observable callers share one
 * response type.
 */
type ListAppsResult<
  TVersion extends ListAppsVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<ListAppsResponse<TVersion>>[TMethod];

/** Builds the request init for the resolved version, including its response-schema selector. */
const generateRequestParameters = <TResult, TVersion extends AvailableVersions>(
  version: TVersion,
  _args: VersionedParsedArgs<typeof VersionContract, TVersion>,
  init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
  // Select the response schema that matches the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const baseInit: FetchRequestInit<ListAppsResponse<ApiVersion.v1>, JsonRequest> = {
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
      args.filter !== undefined && params.append('$filter', args.filter);
      args.search !== undefined && params.append('$search', args.search);
      args.expand !== undefined && params.append('$expand', args.expand);
      return `/apps?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Gets all apps.
 *
 * Fusion Apps API operation: `GET /apps` — "Gets all apps."
 *
 * Curried in two stages: `listApps(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for a promise,
 * `'json$'` for an observable stream. The returned function takes {@link ListAppsArg} plus an
 * optional `ClientRequestInit`, and gives back {@link ListAppsResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `apiPagedCollectionSchemaV1(ApiAppListItemSchemaV1)`, and sends `api-version=1.0` on the request.
 *
 * Query options: `filter` is sent as `$filter`, `search` is sent as `$search`, `expand` is sent as
 * `$expand`.
 *
 * The Apps service answers `200 OK`; the body is typed `ApiPagedCollectionV1<ApiAppListItemV1>`.
 *
 * Related: `getApp`, `createApp`.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link ListAppsArg} and an optional
 * `ClientRequestInit`, returning {@link ListAppsResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { listApps } from '@equinor/fusion-services/apps';
 *
 * const result = await listApps('v1', httpClient)({ filter: 'name eq 1' });
 * ```
 */
const listApps = <TVersion extends ListAppsVersion, TMethod extends ClientMethodType = 'json'>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input?: ListAppsArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, ListAppsResponse<MethodVersion>>,
  ): ListAppsResult<MethodVersion, TMethod> => {
    // The operation has no required arguments, so an omitted argument object parses as empty.
    const args = parseVersionedArgs(VersionContract, apiVersion, input ?? {});
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as ListAppsResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type ListAppsArg,
  type ListAppsResponse,
  type ListAppsResult,
  type ListAppsVersion,
  listApps,
};
