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
import { DeleteRoleAssignmentsRequestSchemaV1 } from '../v1/schemas/delete-role-assignments-request-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `deleteRoleAssignments` accepts for
 * `POST /roles/{roleIdentifier}/assignments/delete`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link DeleteRoleAssignmentsArg} and {@link DeleteRoleAssignmentsResponse}.
 */
type DeleteRoleAssignmentsVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `deleteRoleAssignments`, implementing
 * `POST /roles/{roleIdentifier}/assignments/delete`.
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
        ...DeleteRoleAssignmentsRequestSchemaV1.shape,
      })
      .describe(
        'Arguments for POST /roles/{roleIdentifier}/assignments/delete (deleteRoleAssignments v1.0).',
      ),
    /** Response published by version 1.0. The operation answers `204 No Content`. */
    response: z.void(),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `deleteRoleAssignments` resolves for the selected API version.
 *
 * Version 1.0 answers `204 No Content` without a body, so the type resolves to `void`.
 */
type DeleteRoleAssignmentsResponse<TVersion extends DeleteRoleAssignmentsVersion> =
  VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `deleteRoleAssignments` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifier `roleIdentifier`, and the request body fields of
 * `DeleteRoleAssignmentsRequestV1`.
 *
 * Path identifiers and body fields share one flat object; the endpoint separates them when it
 * builds the request. The value is parsed by the version's Zod argument schema before anything
 * is sent.
 */
type DeleteRoleAssignmentsArg<TVersion extends DeleteRoleAssignmentsVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `deleteRoleAssignments` hands back once the request runs, for the selected API version
 * and client method.
 *
 * `'json'` gives `Promise<DeleteRoleAssignmentsResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<DeleteRoleAssignmentsResponse<TVersion>>`, so promise and observable callers
 * share one response type.
 */
type DeleteRoleAssignmentsResult<
  TVersion extends DeleteRoleAssignmentsVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<DeleteRoleAssignmentsResponse<TVersion>>[TMethod];

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
      const { roleIdentifier: _roleIdentifier, ...body } = args;
      const baseInit: FetchRequestInit<
        DeleteRoleAssignmentsResponse<ApiVersion.v1>,
        JsonRequest
      > = {
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
  args: VersionedParsedArgs<typeof VersionContract, TVersion>,
): string => {
  // Build the endpoint path according to the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const params = new URLSearchParams();
      params.append('api-version', version);
      return `/roles/${encodeURIComponent(args.roleIdentifier)}/assignments/delete?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Deletes up to 100 assignments of one role in a single batch request, addressed by their
 * assignment IDs.
 *
 * Roles V2 operation: `POST /roles/{roleIdentifier}/assignments/delete` — "Batch delete role
 * assignments by their IDs. A maximum of 100 role assignments can be deleted in a single
 * request."
 *
 * Curried in two stages: `deleteRoleAssignments(version, client, method)` binds the API
 * version, the `IHttpClient` that reaches the Roles service, and the execution method —
 * `'json'` for a promise, `'json$'` for an observable stream. The returned function takes
 * {@link DeleteRoleAssignmentsArg} plus an optional `ClientRequestInit`, and gives back
 * {@link DeleteRoleAssignmentsResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, expects the empty success body,
 * and sends `api-version=1.0` on the request.
 *
 * Destructive: it removes every role assignment named in the batch permanently, and the
 * deletion cannot be undone through this API. Roles V2 answers `204 No Content` with no body,
 * so the resolved value is `void`. The contract declares `403 Forbidden` for callers the Roles
 * service does not authorise for this operation.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link DeleteRoleAssignmentsArg} and an optional
 * `ClientRequestInit`, returning {@link DeleteRoleAssignmentsResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { deleteRoleAssignments } from '@equinor/fusion-services/roles';
 *
 * await deleteRoleAssignments('v1', httpClient)({
 *   roleIdentifier: 'reader',
 *   roleAssignmentIds: ['0f5a8d1c-2b3e-4a6f-9c10-7d8e9f0a1b2c'],
 * });
 * ```
 */
const deleteRoleAssignments = <
  TVersion extends DeleteRoleAssignmentsVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: DeleteRoleAssignmentsArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, DeleteRoleAssignmentsResponse<MethodVersion>>,
  ): DeleteRoleAssignmentsResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as DeleteRoleAssignmentsResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type DeleteRoleAssignmentsArg,
  type DeleteRoleAssignmentsResponse,
  type DeleteRoleAssignmentsResult,
  type DeleteRoleAssignmentsVersion,
  deleteRoleAssignments,
};
