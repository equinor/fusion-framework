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
import { ApiAccountClaimableRoleAssignmentSchemaV1 } from '../v1/schemas/api-account-claimable-role-assignment-schema-v1';
import { ExpandSchemaV1 } from '../v1/schemas/expand-schema-v1';
import { apiPagedCollectionSchemaV1 } from '../v1/schemas/api-paged-collection-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `listAccountClaimableRoleAssignments` accepts for
 * `GET /accounts/{accountIdentifier}/claimable-role-assignments`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link ListAccountClaimableRoleAssignmentsArg} and
 * {@link ListAccountClaimableRoleAssignmentsResponse}.
 */
type ListAccountClaimableRoleAssignmentsVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `listAccountClaimableRoleAssignments`, implementing
 * `GET /accounts/{accountIdentifier}/claimable-role-assignments`.
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
        /** Related resources to include in the response. */
        expand: ExpandSchemaV1,
      })
      .describe(
        'Arguments for GET /accounts/{accountIdentifier}/claimable-role-assignments (listAccountClaimableRoleAssignments v1.0).',
      ),
    /** Response published by version 1.0 of this operation. */
    response: apiPagedCollectionSchemaV1(ApiAccountClaimableRoleAssignmentSchemaV1),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `listAccountClaimableRoleAssignments` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiPagedCollectionV1<ApiAccountClaimableRoleAssignmentV1>`, inferred
 * from `apiPagedCollectionSchemaV1(ApiAccountClaimableRoleAssignmentSchemaV1)` — the very
 * schema that validates the `200 OK` body at runtime.
 */
type ListAccountClaimableRoleAssignmentsResponse<
  TVersion extends ListAccountClaimableRoleAssignmentsVersion,
> = VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `listAccountClaimableRoleAssignments` accepts, resolved from the selected API
 * version.
 *
 * Version 1.0 accepts the path identifier `accountIdentifier`, and the optional query options
 * `expand`.
 *
 * The value is parsed by the version's Zod argument schema before the request path is built, so
 * defaults and range checks apply up front.
 */
type ListAccountClaimableRoleAssignmentsArg<
  TVersion extends ListAccountClaimableRoleAssignmentsVersion,
> = VersionedArgs<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * What `listAccountClaimableRoleAssignments` hands back once the request runs, for the selected
 * API version and client method.
 *
 * `'json'` gives `Promise<ListAccountClaimableRoleAssignmentsResponse<TVersion>>` and `'json$'`
 * gives `StreamResponse<ListAccountClaimableRoleAssignmentsResponse<TVersion>>`, so promise and
 * observable callers share one response type.
 */
type ListAccountClaimableRoleAssignmentsResult<
  TVersion extends ListAccountClaimableRoleAssignmentsVersion,
  TMethod extends ClientMethodType = 'json',
  TResult = ListAccountClaimableRoleAssignmentsResponse<TVersion>,
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
        ListAccountClaimableRoleAssignmentsResponse<ApiVersion.v1>,
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
      args.expand !== undefined && params.append('$expand', args.expand);
      return `/accounts/${encodeURIComponent(args.accountIdentifier)}/claimable-role-assignments?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Lists the claimable role assignments granted to one account, that is, the roles that account
 * may claim.
 *
 * Roles V2 operation: `GET /accounts/{accountIdentifier}/claimable-role-assignments` — "Get all
 * claimable role assignments for an account."
 *
 * Curried in two stages: `listAccountClaimableRoleAssignments(version, client, method)` binds
 * the API version, the `IHttpClient` that reaches the Roles service, and the execution method —
 * `'json'` for a promise, `'json$'` for an observable stream. The returned function takes
 * {@link ListAccountClaimableRoleAssignmentsArg} plus an optional `ClientRequestInit`, and
 * gives back {@link ListAccountClaimableRoleAssignmentsResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `apiPagedCollectionSchemaV1(ApiAccountClaimableRoleAssignmentSchemaV1)`, and sends
 * `api-version=1.0` on the request.
 *
 * Query options: `expand` is sent as `$expand` to inline related resources.
 *
 * Roles V2 answers `200 OK`; the body is typed
 * `ApiPagedCollectionV1<ApiAccountClaimableRoleAssignmentV1>`.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link ListAccountClaimableRoleAssignmentsArg} and an
 * optional `ClientRequestInit`, returning {@link ListAccountClaimableRoleAssignmentsResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { listAccountClaimableRoleAssignments } from '@equinor/fusion-services/roles';
 *
 * const page = await listAccountClaimableRoleAssignments('v1', httpClient)({
 *   accountIdentifier: 'user@equinor.com',
 * });
 * ```
 */
const listAccountClaimableRoleAssignments = <
  TVersion extends ListAccountClaimableRoleAssignmentsVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return <
    TResponse = ListAccountClaimableRoleAssignmentsResponse<MethodVersion>,
    TResult = ListAccountClaimableRoleAssignmentsResult<MethodVersion, TMethod, TResponse>,
  >(
    input: ListAccountClaimableRoleAssignmentsArg<MethodVersion>,
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
  type ListAccountClaimableRoleAssignmentsArg,
  type ListAccountClaimableRoleAssignmentsResponse,
  type ListAccountClaimableRoleAssignmentsResult,
  type ListAccountClaimableRoleAssignmentsVersion,
  listAccountClaimableRoleAssignments,
};
