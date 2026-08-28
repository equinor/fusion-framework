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
import { ApiClaimableRoleSchemaV1 } from '../v1/schemas/api-claimable-role-schema-v1';
import { CreateClaimableRoleRequestSchemaV1 } from '../v1/schemas/create-claimable-role-request-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `createClaimableRole` accepts for `POST /claimable-roles`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link CreateClaimableRoleArg} and {@link CreateClaimableRoleResponse}.
 */
type CreateClaimableRoleVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `createClaimableRole`, implementing `POST /claimable-roles`.
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
        ...CreateClaimableRoleRequestSchemaV1.shape,
      })
      .describe('Arguments for POST /claimable-roles (createClaimableRole v1.0).'),
    /** Response published by version 1.0 of this operation. */
    response: ApiClaimableRoleSchemaV1,
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `createClaimableRole` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiClaimableRoleV1`, inferred from `ApiClaimableRoleSchemaV1` — the
 * very schema that validates the `201 Created` body at runtime.
 */
type CreateClaimableRoleResponse<TVersion extends CreateClaimableRoleVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `createClaimableRole` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the request body fields of `CreateClaimableRoleRequestV1`.
 *
 * Path identifiers and body fields share one flat object; the endpoint separates them when it
 * builds the request. The value is parsed by the version's Zod argument schema before anything
 * is sent.
 */
type CreateClaimableRoleArg<TVersion extends CreateClaimableRoleVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `createClaimableRole` hands back once the request runs, for the selected API version and
 * client method.
 *
 * `'json'` gives `Promise<CreateClaimableRoleResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<CreateClaimableRoleResponse<TVersion>>`, so promise and observable callers
 * share one response type.
 */
type CreateClaimableRoleResult<
  TVersion extends CreateClaimableRoleVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<CreateClaimableRoleResponse<TVersion>>[TMethod];

/** Builds the request init for the resolved version, including its response-schema selector. */
const generateRequestParameters = <TResult, TVersion extends AvailableVersions>(
  version: TVersion,
  args: VersionedParsedArgs<typeof VersionContract, TVersion>,
  init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
  // Select the response schema that matches the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      // The operation takes no path identifiers, so every argument belongs to the request body.
      const body = { ...args };
      const baseInit: FetchRequestInit<CreateClaimableRoleResponse<ApiVersion.v1>, JsonRequest> = {
        method: 'POST',
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
  _args: VersionedParsedArgs<typeof VersionContract, TVersion>,
): string => {
  // Build the endpoint path according to the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const params = new URLSearchParams();
      params.append('api-version', version);
      return `/claimable-roles?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Creates a claimable role: a role an account can be granted and then claim on demand for a
 * limited period.
 *
 * Roles V2 operation: `POST /claimable-roles` — "Create a new claimable role."
 *
 * Curried in two stages: `createClaimableRole(version, client, method)` binds the API version,
 * the `IHttpClient` that reaches the Roles service, and the execution method — `'json'` for a
 * promise, `'json$'` for an observable stream. The returned function takes
 * {@link CreateClaimableRoleArg} plus an optional `ClientRequestInit`, and gives back
 * {@link CreateClaimableRoleResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `ApiClaimableRoleSchemaV1`, and sends `api-version=1.0` on the request.
 *
 * Roles V2 answers `201 Created`; the body is typed `ApiClaimableRoleV1`. The contract declares
 * `403 Forbidden` for callers the Roles service does not authorise for this operation.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link CreateClaimableRoleArg} and an optional
 * `ClientRequestInit`, returning {@link CreateClaimableRoleResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { createClaimableRole } from '@equinor/fusion-services/roles';
 *
 * const claimableRole = await createClaimableRole('v1', httpClient)({
 *   name: 'on-call-approver',
 *   displayName: 'On-call approver',
 *   systemIdentifier: 'fusion-core',
 * });
 * ```
 */
const createClaimableRole = <
  TVersion extends CreateClaimableRoleVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input?: CreateClaimableRoleArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, CreateClaimableRoleResponse<MethodVersion>>,
  ): CreateClaimableRoleResult<MethodVersion, TMethod> => {
    // The operation has no required arguments, so an omitted argument object parses as empty.
    const args = parseVersionedArgs(VersionContract, apiVersion, input ?? {});
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as CreateClaimableRoleResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type CreateClaimableRoleArg,
  type CreateClaimableRoleResponse,
  type CreateClaimableRoleResult,
  type CreateClaimableRoleVersion,
  createClaimableRole,
};
