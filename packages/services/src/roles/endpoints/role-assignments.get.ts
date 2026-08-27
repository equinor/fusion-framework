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
import { ApiRoleAssignmentSchemaV1 } from '../v1/schemas/api-role-assignment-schema-v1';
import { FilterSchemaV1 } from '../v1/schemas/filter-schema-v1';
import { SkipSchemaV1 } from '../v1/schemas/skip-schema-v1';
import { TopSchemaV1 } from '../v1/schemas/top-schema-v1';
import { apiPagedCollectionSchemaV1 } from '../v1/schemas/api-paged-collection-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `listRoleAssignments` accepts for
 * `GET /roles/{roleIdentifier}/assignments`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link ListRoleAssignmentsArg} and {@link ListRoleAssignmentsResponse}.
 */
type ListRoleAssignmentsVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `listRoleAssignments`, implementing
 * `GET /roles/{roleIdentifier}/assignments`.
 *
 * Each concrete {@link ApiVersion} maps to the argument and response schemas that
 * version publishes, so the version a caller passes is the single discriminator
 * for the request shape, the request path, and the response shape.
 */
const VersionContract = {
  [ApiVersion.v1]: {
    /** Arguments accepted by version 1.0 of this operation. */
    args: z
      .object({
        /** Role UUID or unique role name. */
        roleIdentifier: z.string().describe('Role UUID or unique role name.'),
        /** Maximum number of records to return. Roles V2 accepts values from 0 through 100. */
        top: TopSchemaV1,
        /** Number of records to skip before returning results. */
        skip: SkipSchemaV1,
        /** OData filter expression. */
        filter: FilterSchemaV1,
      })
      .describe(
        'Arguments for GET /roles/{roleIdentifier}/assignments (listRoleAssignments v1.0).',
      ),
    /** Response published by version 1.0 of this operation. */
    response: apiPagedCollectionSchemaV1(ApiRoleAssignmentSchemaV1),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `listRoleAssignments` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiPagedCollectionV1<ApiRoleAssignmentV1>`, inferred from
 * `apiPagedCollectionSchemaV1(ApiRoleAssignmentSchemaV1)` — the very schema that validates the
 * `200 OK` body at runtime.
 */
type ListRoleAssignmentsResponse<TVersion extends ListRoleAssignmentsVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `listRoleAssignments` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifier `roleIdentifier`, and the optional query options
 * `top`, `skip`, `filter`.
 *
 * The value is parsed by the version's Zod argument schema before the request path is built, so
 * defaults and range checks apply up front.
 */
type ListRoleAssignmentsArg<TVersion extends ListRoleAssignmentsVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `listRoleAssignments` hands back once the request runs, for the selected API version and
 * client method.
 *
 * `'json'` gives `Promise<ListRoleAssignmentsResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<ListRoleAssignmentsResponse<TVersion>>`, so promise and observable callers
 * share one response type.
 */
type ListRoleAssignmentsResult<
  TVersion extends ListRoleAssignmentsVersion,
  TMethod extends ClientMethodType = 'json',
  TResult = ListRoleAssignmentsResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];

/** Builds the request init for the resolved version, including its response-schema selector. */
const generateRequestParameters = <TResult, TVersion extends AvailableVersions>(
  version: TVersion,
  _args: VersionedParsedArgs<typeof VersionContract, TVersion>,
  init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
  // Select the response schema that matches the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const baseInit: FetchRequestInit<ListRoleAssignmentsResponse<ApiVersion.v1>, JsonRequest> = {
        selector: versionedResponseSelector(VersionContract, version),
      };
      // Apply the caller-supplied `init` first, then the generated defaults, so the
      // version-specific response `selector` always wins and cannot be bypassed.
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
      args.top !== undefined && params.append('$top', String(args.top));
      args.skip !== undefined && params.append('$skip', String(args.skip));
      args.filter !== undefined && params.append('$filter', args.filter);
      return `/roles/${encodeURIComponent(args.roleIdentifier)}/assignments?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Lists the assignments of one role: which user and application accounts hold it, with the
 * scope and validity of each assignment.
 *
 * Roles V2 operation: `GET /roles/{roleIdentifier}/assignments` — "Get role assignments for a
 * role."
 *
 * Curried in two stages: `listRoleAssignments(version, client, method)` binds the API version,
 * the `IHttpClient` that reaches the Roles service, and the execution method — `'json'` for a
 * promise, `'json$'` for an observable stream. The returned function takes
 * {@link ListRoleAssignmentsArg} plus an optional `ClientRequestInit`, and gives back
 * {@link ListRoleAssignmentsResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `apiPagedCollectionSchemaV1(ApiRoleAssignmentSchemaV1)`, and sends `api-version=1.0` on the
 * request.
 *
 * Query options: `top` and `skip` page the collection as `$top` and `$skip` (`top` accepts
 * 0–100); and `filter` is sent as an OData `$filter` expression.
 *
 * Roles V2 answers `200 OK`; the body is typed `ApiPagedCollectionV1<ApiRoleAssignmentV1>`.
 *
 * Related: `assignRole` creates an assignment, `getRoleAssignment` reads a single one, and
 * `getRole` fetches the role itself.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link ListRoleAssignmentsArg} and an optional
 * `ClientRequestInit`, returning {@link ListRoleAssignmentsResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { listRoleAssignments } from '@equinor/fusion-services/roles';
 *
 * const page = await listRoleAssignments('v1', httpClient)({
 *   roleIdentifier: 'reader',
 *   top: 25,
 * });
 * ```
 */
const listRoleAssignments = <
  TVersion extends ListRoleAssignmentsVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return <
    TResponse = ListRoleAssignmentsResponse<MethodVersion>,
    TResult = ListRoleAssignmentsResult<MethodVersion, TMethod, TResponse>,
  >(
    input: ListRoleAssignmentsArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, TResponse>,
  ): TResult => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as TResult;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type ListRoleAssignmentsArg,
  type ListRoleAssignmentsResponse,
  type ListRoleAssignmentsResult,
  type ListRoleAssignmentsVersion,
  listRoleAssignments,
};
