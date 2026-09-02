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
import { ApiExtendedClaimableRoleAssignmentActivationSchemaV1 } from '../v1/schemas/api-extended-claimable-role-assignment-activation-schema-v1';
import { apiPagedCollectionSchemaV1 } from '../v1/schemas/api-paged-collection-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `listClaimableRoleAssignmentActivations` accepts for
 * `GET /claimable-role-assignment-activations`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link ListClaimableRoleAssignmentActivationsArg} and
 * {@link ListClaimableRoleAssignmentActivationsResponse}.
 */
type ListClaimableRoleAssignmentActivationsVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `listClaimableRoleAssignmentActivations`, implementing
 * `GET /claimable-role-assignment-activations`.
 *
 * Each concrete {@link ApiVersion} maps to the argument and response schemas that
 * version publishes, so the version a caller passes is the single discriminator
 * for the request shape, the request path, and the response shape.
 */
const VersionContract = {
  [ApiVersion.v1]: {
    /** Arguments accepted by version 1.0 of this operation. */
    args: z
      .object({})
      .describe(
        'Arguments for GET /claimable-role-assignment-activations (listClaimableRoleAssignmentActivations v1.0).',
      ),
    /** Response published by version 1.0 of this operation. */
    response: apiPagedCollectionSchemaV1(ApiExtendedClaimableRoleAssignmentActivationSchemaV1),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `listClaimableRoleAssignmentActivations` resolves for the selected API version.
 *
 * Version 1.0 resolves to
 * `ApiPagedCollectionV1<ApiExtendedClaimableRoleAssignmentActivationV1>`, inferred from
 * `apiPagedCollectionSchemaV1(ApiExtendedClaimableRoleAssignmentActivationSchemaV1)` — the very
 * schema that validates the `200 OK` body at runtime.
 */
type ListClaimableRoleAssignmentActivationsResponse<
  TVersion extends ListClaimableRoleAssignmentActivationsVersion,
> = VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `listClaimableRoleAssignmentActivations` accepts, resolved from the selected API
 * version.
 *
 * Version 1.0 of this operation takes no arguments, so the shape is an empty object.
 *
 * The value is parsed by the version's Zod argument schema before the request path is built, so
 * defaults and range checks apply up front.
 */
type ListClaimableRoleAssignmentActivationsArg<
  TVersion extends ListClaimableRoleAssignmentActivationsVersion,
> = VersionedArgs<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * What `listClaimableRoleAssignmentActivations` hands back once the request runs, for the
 * selected API version and client method.
 *
 * `'json'` gives `Promise<ListClaimableRoleAssignmentActivationsResponse<TVersion>>` and
 * `'json$'` gives `StreamResponse<ListClaimableRoleAssignmentActivationsResponse<TVersion>>`,
 * so promise and observable callers share one response type.
 */
type ListClaimableRoleAssignmentActivationsResult<
  TVersion extends ListClaimableRoleAssignmentActivationsVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<ListClaimableRoleAssignmentActivationsResponse<TVersion>>[TMethod];

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
        ListClaimableRoleAssignmentActivationsResponse<ApiVersion.v1>,
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
  _args: VersionedParsedArgs<typeof VersionContract, TVersion>,
): string => {
  // Build the endpoint path according to the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const params = new URLSearchParams();
      params.append('api-version', version);
      return `/claimable-role-assignment-activations?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Lists claimable role assignment activations across the whole Roles service, not scoped to one
 * role or account.
 *
 * Roles V2 operation: `GET /claimable-role-assignment-activations` — "Get all claimable role
 * assignment activations across the system."
 *
 * Curried in two stages: `listClaimableRoleAssignmentActivations(version, client, method)`
 * binds the API version, the `IHttpClient` that reaches the Roles service, and the execution
 * method — `'json'` for a promise, `'json$'` for an observable stream. The returned function
 * takes {@link ListClaimableRoleAssignmentActivationsArg} plus an optional `ClientRequestInit`,
 * and gives back {@link ListClaimableRoleAssignmentActivationsResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `apiPagedCollectionSchemaV1(ApiExtendedClaimableRoleAssignmentActivationSchemaV1)`, and sends
 * `api-version=1.0` on the request.
 *
 * Roles V2 answers `200 OK`; the body is typed
 * `ApiPagedCollectionV1<ApiExtendedClaimableRoleAssignmentActivationV1>`.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link ListClaimableRoleAssignmentActivationsArg} and an
 * optional `ClientRequestInit`, returning {@link ListClaimableRoleAssignmentActivationsResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { listClaimableRoleAssignmentActivations } from '@equinor/fusion-services/roles';
 *
 * const page = await listClaimableRoleAssignmentActivations('v1', httpClient)({});
 * ```
 */
const listClaimableRoleAssignmentActivations = <
  TVersion extends ListClaimableRoleAssignmentActivationsVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input?: ListClaimableRoleAssignmentActivationsArg<MethodVersion>,
    init?: ClientRequestInit<
      IHttpClient,
      ListClaimableRoleAssignmentActivationsResponse<MethodVersion>
    >,
  ): ListClaimableRoleAssignmentActivationsResult<MethodVersion, TMethod> => {
    // The operation has no required arguments, so an omitted argument object parses as empty.
    const args = parseVersionedArgs(VersionContract, apiVersion, input ?? {});
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as ListClaimableRoleAssignmentActivationsResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type ListClaimableRoleAssignmentActivationsArg,
  type ListClaimableRoleAssignmentActivationsResponse,
  type ListClaimableRoleAssignmentActivationsResult,
  type ListClaimableRoleAssignmentActivationsVersion,
  listClaimableRoleAssignmentActivations,
};
