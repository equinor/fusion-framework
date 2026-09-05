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
import { ApiChangelogSchemaV1 } from '../v1/schemas/api-changelog-schema-v1';
import { apiPagedCollectionSchemaV1 } from '../v1/schemas/api-paged-collection-schema-v1';
import { FilterSchemaV1 } from '../v1/schemas/filter-schema-v1';
import { OrderBySchemaV1 } from '../v1/schemas/order-by-schema-v1';
import { SkipSchemaV1 } from '../v1/schemas/skip-schema-v1';
import { TopSchemaV1 } from '../v1/schemas/top-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `listAppCategoryChangelog` accepts for `GET
 * /apps/categories/{appCategoryIdentifier}/changelog`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link ListAppCategoryChangelogArg} and {@link ListAppCategoryChangelogResponse}.
 */
type ListAppCategoryChangelogVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `listAppCategoryChangelog`, implementing `GET
 * /apps/categories/{appCategoryIdentifier}/changelog`.
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
        /** Identifier addressing the app category identifier. */
        appCategoryIdentifier: z
          .string()
          .describe('Identifier addressing the app category identifier.'),
        /** The `$filter` query option. */
        filter: FilterSchemaV1,
        /** The `$orderby` query option. */
        orderBy: OrderBySchemaV1,
        /** The `$top` query option. */
        top: TopSchemaV1,
        /** The `$skip` query option. */
        skip: SkipSchemaV1,
      })
      .describe(
        'Arguments for GET /apps/categories/{appCategoryIdentifier}/changelog (listAppCategoryChangelog v1.0).',
      ),
    /** Response published by version 1.0. */
    response: apiPagedCollectionSchemaV1(ApiChangelogSchemaV1),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `listAppCategoryChangelog` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiPagedCollectionV1<ApiChangelogV1>`, inferred from
 * `apiPagedCollectionSchemaV1(ApiChangelogSchemaV1)` — the very schema that validates the `200 OK`
 * body at runtime.
 */
type ListAppCategoryChangelogResponse<TVersion extends ListAppCategoryChangelogVersion> =
  VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `listAppCategoryChangelog` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifier `appCategoryIdentifier`, and the optional query options
 * `filter`, `orderBy`, `top`, `skip`.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type ListAppCategoryChangelogArg<TVersion extends ListAppCategoryChangelogVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `listAppCategoryChangelog` hands back once the request runs, for the selected API version
 * and client method.
 *
 * `'json'` gives `Promise<ListAppCategoryChangelogResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<ListAppCategoryChangelogResponse<TVersion>>`, so promise and observable callers
 * share one response type.
 */
type ListAppCategoryChangelogResult<
  TVersion extends ListAppCategoryChangelogVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<ListAppCategoryChangelogResponse<TVersion>>[TMethod];

/** Builds the request init for the resolved version, including its response-schema selector. */
const generateRequestParameters = <TResult, TVersion extends AvailableVersions>(
  version: TVersion,
  _args: VersionedParsedArgs<typeof VersionContract, TVersion>,
  init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
  // Select the response schema that matches the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const baseInit: FetchRequestInit<
        ListAppCategoryChangelogResponse<ApiVersion.v1>,
        JsonRequest
      > = {
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
      args.orderBy !== undefined && params.append('$orderby', args.orderBy);
      args.top !== undefined && params.append('$top', String(args.top));
      args.skip !== undefined && params.append('$skip', String(args.skip));
      return `/apps/categories/${encodeURIComponent(args.appCategoryIdentifier)}/changelog?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Lists the changelog entries recorded for an app category.
 *
 * Fusion Apps API operation: `GET /apps/categories/{appCategoryIdentifier}/changelog`
 *
 * Curried in two stages: `listAppCategoryChangelog(version, client, method)` binds the API version,
 * the `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for a
 * promise, `'json$'` for an observable stream. The returned function takes
 * {@link ListAppCategoryChangelogArg} plus an optional `ClientRequestInit`, and gives back
 * {@link ListAppCategoryChangelogResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `apiPagedCollectionSchemaV1(ApiChangelogSchemaV1)`, and sends `api-version=1.0` on the request.
 *
 * Query options: `filter` is sent as `$filter`, `orderBy` is sent as `$orderby`, `top` is sent as
 * `$top`, `skip` is sent as `$skip`.
 *
 * The Apps service answers `200 OK`; the body is typed `ApiPagedCollectionV1<ApiChangelogV1>`. The
 * contract declares `403 Forbidden` for callers the Apps service does not authorise for this
 * operation.
 *
 * Related: `listChangelog`.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link ListAppCategoryChangelogArg} and an optional
 * `ClientRequestInit`, returning {@link ListAppCategoryChangelogResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { listAppCategoryChangelog } from '@equinor/fusion-services/apps';
 *
 * const result = await listAppCategoryChangelog('v1', httpClient)({
 *   appCategoryIdentifier: 'productivity',
 *   filter: 'name eq 1',
 * });
 * ```
 */
const listAppCategoryChangelog = <
  TVersion extends ListAppCategoryChangelogVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: ListAppCategoryChangelogArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, ListAppCategoryChangelogResponse<MethodVersion>>,
  ): ListAppCategoryChangelogResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as ListAppCategoryChangelogResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type ListAppCategoryChangelogArg,
  type ListAppCategoryChangelogResponse,
  type ListAppCategoryChangelogResult,
  type ListAppCategoryChangelogVersion,
  listAppCategoryChangelog,
};
