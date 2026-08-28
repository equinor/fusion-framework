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
import { ApiClaimableRoleAssignmentSchemaV1 } from '../v1/schemas/api-claimable-role-assignment-schema-v1';
import { UpdateClaimableRoleAssignmentRequestSchemaV1 } from '../v1/schemas/update-claimable-role-assignment-request-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `updateClaimableRoleAssignment` accepts for
 * `PATCH /claimable-roles/{claimableRoleIdentifier}/assignments/{claimableRoleAssignmentId}`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link UpdateClaimableRoleAssignmentArg} and {@link UpdateClaimableRoleAssignmentResponse}.
 */
type UpdateClaimableRoleAssignmentVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `updateClaimableRoleAssignment`, implementing
 * `PATCH /claimable-roles/{claimableRoleIdentifier}/assignments/{claimableRoleAssignmentId}`.
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
        /** Claimable role UUID or unique claimable role name. */
        claimableRoleIdentifier: z
          .string()
          .describe('Claimable role UUID or unique claimable role name.'),
        /** Claimable role assignment UUID. */
        claimableRoleAssignmentId: z.string().describe('Claimable role assignment UUID.'),
        ...UpdateClaimableRoleAssignmentRequestSchemaV1.shape,
      })
      .describe(
        'Arguments for PATCH /claimable-roles/{claimableRoleIdentifier}/assignments/{claimableRoleAssignmentId} (updateClaimableRoleAssignment v1.0).',
      ),
    /** Response published by version 1.0 of this operation. */
    response: ApiClaimableRoleAssignmentSchemaV1,
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `updateClaimableRoleAssignment` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiClaimableRoleAssignmentV1`, inferred from
 * `ApiClaimableRoleAssignmentSchemaV1` — the very schema that validates the `200 OK` body at
 * runtime.
 */
type UpdateClaimableRoleAssignmentResponse<TVersion extends UpdateClaimableRoleAssignmentVersion> =
  VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `updateClaimableRoleAssignment` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifiers `claimableRoleIdentifier`,
 * `claimableRoleAssignmentId`, and the request body fields of
 * `UpdateClaimableRoleAssignmentRequestV1`.
 *
 * Path identifiers and body fields share one flat object; the endpoint separates them when it
 * builds the request. The value is parsed by the version's Zod argument schema before anything
 * is sent.
 */
type UpdateClaimableRoleAssignmentArg<TVersion extends UpdateClaimableRoleAssignmentVersion> =
  VersionedArgs<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * What `updateClaimableRoleAssignment` hands back once the request runs, for the selected API
 * version and client method.
 *
 * `'json'` gives `Promise<UpdateClaimableRoleAssignmentResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<UpdateClaimableRoleAssignmentResponse<TVersion>>`, so promise and observable
 * callers share one response type.
 */
type UpdateClaimableRoleAssignmentResult<
  TVersion extends UpdateClaimableRoleAssignmentVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<UpdateClaimableRoleAssignmentResponse<TVersion>>[TMethod];

/** Builds the request init for the resolved version, including its response-schema selector. */
const generateRequestParameters = <TResult, TVersion extends AvailableVersions>(
  version: TVersion,
  args: VersionedParsedArgs<typeof VersionContract, TVersion>,
  init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
  // Select the response schema that matches the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      // Path identifiers address the resource, so only the remaining fields form the request body.
      const {
        claimableRoleIdentifier: _claimableRoleIdentifier,
        claimableRoleAssignmentId: _claimableRoleAssignmentId,
        ...body
      } = args;
      const baseInit: FetchRequestInit<
        UpdateClaimableRoleAssignmentResponse<ApiVersion.v1>,
        JsonRequest
      > = {
        method: 'PATCH',
        selector: versionedResponseSelector(VersionContract, version),
        body,
      };
      // Apply the caller-supplied `init` first, then the generated defaults, so the
      // generated `method`, `body`, and version-specific response `selector` always win
      // and cannot be overridden or bypassed.
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
      return `/claimable-roles/${encodeURIComponent(args.claimableRoleIdentifier)}/assignments/${encodeURIComponent(args.claimableRoleAssignmentId)}?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Extends or shortens a claimable role assignment by updating its `validTo` date.
 *
 * Roles V2 operation:
 * `PATCH /claimable-roles/{claimableRoleIdentifier}/assignments/{claimableRoleAssignmentId}` —
 * "Update a claimable role assignment's valid to date."
 *
 * Curried in two stages: `updateClaimableRoleAssignment(version, client, method)` binds the API
 * version, the `IHttpClient` that reaches the Roles service, and the execution method —
 * `'json'` for a promise, `'json$'` for an observable stream. The returned function takes
 * {@link UpdateClaimableRoleAssignmentArg} plus an optional `ClientRequestInit`, and gives back
 * {@link UpdateClaimableRoleAssignmentResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `ApiClaimableRoleAssignmentSchemaV1`, and sends `api-version=1.0` on the request.
 *
 * Roles V2 answers `200 OK`; the body is typed `ApiClaimableRoleAssignmentV1`. Fields left out
 * of the arguments are not sent, so they keep their stored values. The contract declares `403
 * Forbidden` for callers the Roles service does not authorise for this operation.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link UpdateClaimableRoleAssignmentArg} and an optional
 * `ClientRequestInit`, returning {@link UpdateClaimableRoleAssignmentResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { updateClaimableRoleAssignment } from '@equinor/fusion-services/roles';
 *
 * const assignment = await updateClaimableRoleAssignment('v1', httpClient)({
 *   claimableRoleIdentifier: 'on-call-approver',
 *   claimableRoleAssignmentId: '6b1d4f2a-8c3e-4d59-9f70-1a2b3c4d5e6f',
 *   validTo: '2026-06-30T23:59:59Z',
 * });
 * ```
 */
const updateClaimableRoleAssignment = <
  TVersion extends UpdateClaimableRoleAssignmentVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: UpdateClaimableRoleAssignmentArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, UpdateClaimableRoleAssignmentResponse<MethodVersion>>,
  ): UpdateClaimableRoleAssignmentResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as UpdateClaimableRoleAssignmentResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type UpdateClaimableRoleAssignmentArg,
  type UpdateClaimableRoleAssignmentResponse,
  type UpdateClaimableRoleAssignmentResult,
  type UpdateClaimableRoleAssignmentVersion,
  updateClaimableRoleAssignment,
};
