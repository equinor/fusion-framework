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
import { ApiAccountAccessRoleAssignmentSchemaV1 } from '../v1/schemas/api-account-access-role-assignment-schema-v1';
import { ExpandSchemaV1 } from '../v1/schemas/expand-schema-v1';
import { FilterSchemaV1 } from '../v1/schemas/filter-schema-v1';
import { SkipSchemaV1 } from '../v1/schemas/skip-schema-v1';
import { TopSchemaV1 } from '../v1/schemas/top-schema-v1';
import { apiPagedCollectionSchemaV1 } from '../v1/schemas/api-paged-collection-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `listAccountAccessRoleAssignments` accepts for
 * `GET /accounts/{accountIdentifier}/access-role-assignments`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link ListAccountAccessRoleAssignmentsArg} and
 * {@link ListAccountAccessRoleAssignmentsResponse}.
 */
type ListAccountAccessRoleAssignmentsVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `listAccountAccessRoleAssignments`, implementing
 * `GET /accounts/{accountIdentifier}/access-role-assignments`.
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
        /** Fusion account identifier or supported alternate account identifier. */
        accountIdentifier: z
          .string()
          .describe('Fusion account identifier or supported alternate account identifier.'),
        /** Maximum number of records to return. Roles V2 accepts values from 0 through 100. */
        top: TopSchemaV1,
        /** Number of records to skip before returning results. */
        skip: SkipSchemaV1,
        /** OData filter expression. */
        filter: FilterSchemaV1,
        /** Related resources to include in the response. */
        expand: ExpandSchemaV1,
      })
      .describe(
        'Arguments for GET /accounts/{accountIdentifier}/access-role-assignments (listAccountAccessRoleAssignments v1.0).',
      ),
    /** Response published by version 1.0 of this operation. */
    response: apiPagedCollectionSchemaV1(ApiAccountAccessRoleAssignmentSchemaV1),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `listAccountAccessRoleAssignments` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiPagedCollectionV1<ApiAccountAccessRoleAssignmentV1>`, inferred
 * from `apiPagedCollectionSchemaV1(ApiAccountAccessRoleAssignmentSchemaV1)` — the very schema
 * that validates the `200 OK` body at runtime.
 */
type ListAccountAccessRoleAssignmentsResponse<
  TVersion extends ListAccountAccessRoleAssignmentsVersion,
> = VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `listAccountAccessRoleAssignments` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifier `accountIdentifier`, and the optional query options
 * `top`, `skip`, `filter`, `expand`.
 *
 * The value is parsed by the version's Zod argument schema before the request path is built, so
 * defaults and range checks apply up front.
 */
type ListAccountAccessRoleAssignmentsArg<TVersion extends ListAccountAccessRoleAssignmentsVersion> =
  VersionedArgs<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * What `listAccountAccessRoleAssignments` hands back once the request runs, for the selected
 * API version and client method.
 *
 * `'json'` gives `Promise<ListAccountAccessRoleAssignmentsResponse<TVersion>>` and `'json$'`
 * gives `StreamResponse<ListAccountAccessRoleAssignmentsResponse<TVersion>>`, so promise and
 * observable callers share one response type.
 */
type ListAccountAccessRoleAssignmentsResult<
  TVersion extends ListAccountAccessRoleAssignmentsVersion,
  TMethod extends ClientMethodType = 'json',
  TResult = ListAccountAccessRoleAssignmentsResponse<TVersion>,
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
      const baseInit: FetchRequestInit<
        ListAccountAccessRoleAssignmentsResponse<ApiVersion.v1>,
        JsonRequest
      > = {
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
      args.expand !== undefined && params.append('$expand', args.expand);
      return `/accounts/${encodeURIComponent(args.accountIdentifier)}/access-role-assignments?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Lists all access role assignments held by one account, whether that account is a user or an
 * application.
 *
 * Roles V2 operation: `GET /accounts/{accountIdentifier}/access-role-assignments` — "Get all
 * access role assignments for an account."
 *
 * Curried in two stages: `listAccountAccessRoleAssignments(version, client, method)` binds the
 * API version, the `IHttpClient` that reaches the Roles service, and the execution method —
 * `'json'` for a promise, `'json$'` for an observable stream. The returned function takes
 * {@link ListAccountAccessRoleAssignmentsArg} plus an optional `ClientRequestInit`, and gives
 * back {@link ListAccountAccessRoleAssignmentsResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `apiPagedCollectionSchemaV1(ApiAccountAccessRoleAssignmentSchemaV1)`, and sends
 * `api-version=1.0` on the request.
 *
 * Query options: `top` and `skip` page the collection as `$top` and `$skip` (`top` accepts
 * 0–100); `filter` is sent as an OData `$filter` expression; and `expand` is sent as `$expand`
 * to inline related resources.
 *
 * Roles V2 answers `200 OK`; the body is typed
 * `ApiPagedCollectionV1<ApiAccountAccessRoleAssignmentV1>`.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link ListAccountAccessRoleAssignmentsArg} and an
 * optional `ClientRequestInit`, returning {@link ListAccountAccessRoleAssignmentsResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { listAccountAccessRoleAssignments } from '@equinor/fusion-services/roles';
 *
 * const page = await listAccountAccessRoleAssignments('v1', httpClient)({
 *   accountIdentifier: 'user@equinor.com',
 *   top: 25,
 * });
 * ```
 */
const listAccountAccessRoleAssignments = <
  TVersion extends ListAccountAccessRoleAssignmentsVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return <
    TResponse = ListAccountAccessRoleAssignmentsResponse<MethodVersion>,
    TResult = ListAccountAccessRoleAssignmentsResult<MethodVersion, TMethod, TResponse>,
  >(
    input: ListAccountAccessRoleAssignmentsArg<MethodVersion>,
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
  type ListAccountAccessRoleAssignmentsArg,
  type ListAccountAccessRoleAssignmentsResponse,
  type ListAccountAccessRoleAssignmentsResult,
  type ListAccountAccessRoleAssignmentsVersion,
  listAccountAccessRoleAssignments,
};
