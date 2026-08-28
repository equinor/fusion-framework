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
import { ApiClaimableRoleAssignmentActivationSchemaV1 } from '../v1/schemas/api-claimable-role-assignment-activation-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `deactivateClaimableRoleAssignment` accepts for
 * `POST /accounts/{accountIdentifier}/claimable-role-assignments/{claimableRoleAssignmentId}/deactivate`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link DeactivateClaimableRoleAssignmentArg} and
 * {@link DeactivateClaimableRoleAssignmentResponse}.
 */
type DeactivateClaimableRoleAssignmentVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `deactivateClaimableRoleAssignment`, implementing
 * `POST /accounts/{accountIdentifier}/claimable-role-assignments/{claimableRoleAssignmentId}/deactivate`.
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
        /** Claimable role assignment UUID. */
        claimableRoleAssignmentId: z.string().describe('Claimable role assignment UUID.'),
      })
      .describe(
        'Arguments for POST /accounts/{accountIdentifier}/claimable-role-assignments/{claimableRoleAssignmentId}/deactivate (deactivateClaimableRoleAssignment v1.0).',
      ),
    /** Response published by version 1.0 of this operation. */
    response: ApiClaimableRoleAssignmentActivationSchemaV1,
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `deactivateClaimableRoleAssignment` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiClaimableRoleAssignmentActivationV1`, inferred from
 * `ApiClaimableRoleAssignmentActivationSchemaV1` — the very schema that validates the `201
 * Created` body at runtime.
 */
type DeactivateClaimableRoleAssignmentResponse<
  TVersion extends DeactivateClaimableRoleAssignmentVersion,
> = VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `deactivateClaimableRoleAssignment` accepts, resolved from the selected API
 * version.
 *
 * Version 1.0 accepts the path identifiers `accountIdentifier`, `claimableRoleAssignmentId`.
 *
 * The value is parsed by the version's Zod argument schema before the request path is built, so
 * defaults and range checks apply up front.
 */
type DeactivateClaimableRoleAssignmentArg<
  TVersion extends DeactivateClaimableRoleAssignmentVersion,
> = VersionedArgs<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * What `deactivateClaimableRoleAssignment` hands back once the request runs, for the selected
 * API version and client method.
 *
 * `'json'` gives `Promise<DeactivateClaimableRoleAssignmentResponse<TVersion>>` and `'json$'`
 * gives `StreamResponse<DeactivateClaimableRoleAssignmentResponse<TVersion>>`, so promise and
 * observable callers share one response type.
 */
type DeactivateClaimableRoleAssignmentResult<
  TVersion extends DeactivateClaimableRoleAssignmentVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<DeactivateClaimableRoleAssignmentResponse<TVersion>>[TMethod];

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
        DeactivateClaimableRoleAssignmentResponse<ApiVersion.v1>,
        JsonRequest
      > = {
        method: 'POST',
        selector: versionedResponseSelector(VersionContract, version),
        // The contract declares no request body, so any caller-supplied body is dropped.
        body: undefined,
      };
      // Apply the caller-supplied `init` first, then the generated defaults, so the
      // generated `method`, forced empty `body`, and version-specific response `selector`
      // always win and cannot be overridden or bypassed.
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
      return `/accounts/${encodeURIComponent(args.accountIdentifier)}/claimable-role-assignments/${encodeURIComponent(args.claimableRoleAssignmentId)}/deactivate?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Ends an active claim early: deactivates a claimable role assignment for an account by setting
 * its expiration to now.
 *
 * Roles V2 operation:
 * `POST /accounts/{accountIdentifier}/claimable-role-assignments/{claimableRoleAssignmentId}/deactivate`
 * — "Deactivate a claimable role assignment for an account by setting the expiration date to
 * now."
 *
 * Curried in two stages: `deactivateClaimableRoleAssignment(version, client, method)` binds the
 * API version, the `IHttpClient` that reaches the Roles service, and the execution method —
 * `'json'` for a promise, `'json$'` for an observable stream. The returned function takes
 * {@link DeactivateClaimableRoleAssignmentArg} plus an optional `ClientRequestInit`, and gives
 * back {@link DeactivateClaimableRoleAssignmentResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `ApiClaimableRoleAssignmentActivationSchemaV1`, and sends `api-version=1.0` on the request.
 *
 * Roles V2 answers `201 Created`; the body is typed `ApiClaimableRoleAssignmentActivationV1`.
 * The contract declares `403 Forbidden` for callers the Roles service does not authorise for
 * this operation.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link DeactivateClaimableRoleAssignmentArg} and an
 * optional `ClientRequestInit`, returning {@link DeactivateClaimableRoleAssignmentResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { deactivateClaimableRoleAssignment } from '@equinor/fusion-services/roles';
 *
 * const activation = await deactivateClaimableRoleAssignment('v1', httpClient)({
 *   accountIdentifier: 'user@equinor.com',
 *   claimableRoleAssignmentId: '6b1d4f2a-8c3e-4d59-9f70-1a2b3c4d5e6f',
 * });
 * ```
 */
const deactivateClaimableRoleAssignment = <
  TVersion extends DeactivateClaimableRoleAssignmentVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: DeactivateClaimableRoleAssignmentArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, DeactivateClaimableRoleAssignmentResponse<MethodVersion>>,
  ): DeactivateClaimableRoleAssignmentResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as DeactivateClaimableRoleAssignmentResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type DeactivateClaimableRoleAssignmentArg,
  type DeactivateClaimableRoleAssignmentResponse,
  type DeactivateClaimableRoleAssignmentResult,
  type DeactivateClaimableRoleAssignmentVersion,
  deactivateClaimableRoleAssignment,
};
