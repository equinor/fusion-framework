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

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `deleteRole` accepts for `DELETE /roles/{roleIdentifier}`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link DeleteRoleArg} and {@link DeleteRoleResponse}.
 */
type DeleteRoleVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `deleteRole`, implementing `DELETE /roles/{roleIdentifier}`.
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
      })
      .describe('Arguments for DELETE /roles/{roleIdentifier} (deleteRole v1.0).'),
    /** Response published by version 1.0. The operation answers `204 No Content`. */
    response: z.void(),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `deleteRole` resolves for the selected API version.
 *
 * Version 1.0 answers `204 No Content` without a body, so the type resolves to `void`.
 */
type DeleteRoleResponse<TVersion extends DeleteRoleVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `deleteRole` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifier `roleIdentifier`.
 *
 * The value is parsed by the version's Zod argument schema before the request path is built, so
 * defaults and range checks apply up front.
 */
type DeleteRoleArg<TVersion extends DeleteRoleVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `deleteRole` hands back once the request runs, for the selected API version and client
 * method.
 *
 * `'json'` gives `Promise<DeleteRoleResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<DeleteRoleResponse<TVersion>>`, so promise and observable callers share one
 * response type.
 */
type DeleteRoleResult<
  TVersion extends DeleteRoleVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<DeleteRoleResponse<TVersion>>[TMethod];

/** Builds the request init for the resolved version, including its response-schema selector. */
const generateRequestParameters = <TResult, TVersion extends AvailableVersions>(
  version: TVersion,
  _args: VersionedParsedArgs<typeof VersionContract, TVersion>,
  init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
  // Select the response schema that matches the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const baseInit: FetchRequestInit<DeleteRoleResponse<ApiVersion.v1>, JsonRequest> = {
        method: 'DELETE',
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
      return `/roles/${encodeURIComponent(args.roleIdentifier)}?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Deletes a role, addressed by its UUID or unique role name.
 *
 * Roles V2 operation: `DELETE /roles/{roleIdentifier}` — "Delete a role by identifier."
 *
 * Curried in two stages: `deleteRole(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Roles service, and the execution method — `'json'` for a
 * promise, `'json$'` for an observable stream. The returned function takes
 * {@link DeleteRoleArg} plus an optional `ClientRequestInit`, and gives back
 * {@link DeleteRoleResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, expects the empty success body,
 * and sends `api-version=1.0` on the request.
 *
 * Destructive: it removes the role and its assignments permanently, and the deletion cannot be
 * undone through this API. Roles V2 answers `204 No Content` with no body, so the resolved
 * value is `void`. The contract declares `403 Forbidden` for callers the Roles service does not
 * authorise for this operation.
 *
 * Related: `listRoleAssignments` shows the user and application accounts that lose the role
 * with it.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link DeleteRoleArg} and an optional `ClientRequestInit`,
 * returning {@link DeleteRoleResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { deleteRole } from '@equinor/fusion-services/roles';
 *
 * await deleteRole('v1', httpClient)({ roleIdentifier: 'reader' });
 * ```
 */
const deleteRole = <TVersion extends DeleteRoleVersion, TMethod extends ClientMethodType = 'json'>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: DeleteRoleArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, DeleteRoleResponse<MethodVersion>>,
  ): DeleteRoleResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as DeleteRoleResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type DeleteRoleArg,
  type DeleteRoleResponse,
  type DeleteRoleResult,
  type DeleteRoleVersion,
  deleteRole,
};
