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
import { ApiAccessRoleAssignmentSchemaV1 } from '../v1/schemas/api-access-role-assignment-schema-v1';
import { ExpandSchemaV1 } from '../v1/schemas/expand-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `getSystemAccessRoleAssignment` accepts for
 * `GET /systems/{systemIdentifier}/access-roles/{accessRoleIdentifier}/assignments/{accessRoleAssignmentId}`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link GetSystemAccessRoleAssignmentArg} and {@link GetSystemAccessRoleAssignmentResponse}.
 */
type GetSystemAccessRoleAssignmentVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `getSystemAccessRoleAssignment`, implementing
 * `GET /systems/{systemIdentifier}/access-roles/{accessRoleIdentifier}/assignments/{accessRoleAssignmentId}`.
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
        /** System UUID or unique system name. */
        systemIdentifier: z.string().describe('System UUID or unique system name.'),
        /** Access role UUID or unique access role name. */
        accessRoleIdentifier: z.string().describe('Access role UUID or unique access role name.'),
        /** Access role assignment UUID. */
        accessRoleAssignmentId: z.string().describe('Access role assignment UUID.'),
        /** Related resources to include in the response. */
        expand: ExpandSchemaV1,
      })
      .describe(
        'Arguments for GET /systems/{systemIdentifier}/access-roles/{accessRoleIdentifier}/assignments/{accessRoleAssignmentId} (getSystemAccessRoleAssignment v1.0).',
      ),
    /** Response published by version 1.0 of this operation. */
    response: ApiAccessRoleAssignmentSchemaV1,
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `getSystemAccessRoleAssignment` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiAccessRoleAssignmentV1`, inferred from
 * `ApiAccessRoleAssignmentSchemaV1` — the very schema that validates the `200 OK` body at
 * runtime.
 */
type GetSystemAccessRoleAssignmentResponse<TVersion extends GetSystemAccessRoleAssignmentVersion> =
  VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `getSystemAccessRoleAssignment` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifiers `systemIdentifier`, `accessRoleIdentifier`,
 * `accessRoleAssignmentId`, and the optional query options `expand`.
 *
 * The value is parsed by the version's Zod argument schema before the request path is built, so
 * defaults and range checks apply up front.
 */
type GetSystemAccessRoleAssignmentArg<TVersion extends GetSystemAccessRoleAssignmentVersion> =
  VersionedArgs<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * What `getSystemAccessRoleAssignment` hands back once the request runs, for the selected API
 * version and client method.
 *
 * `'json'` gives `Promise<GetSystemAccessRoleAssignmentResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<GetSystemAccessRoleAssignmentResponse<TVersion>>`, so promise and observable
 * callers share one response type.
 */
type GetSystemAccessRoleAssignmentResult<
  TVersion extends GetSystemAccessRoleAssignmentVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<GetSystemAccessRoleAssignmentResponse<TVersion>>[TMethod];

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
        GetSystemAccessRoleAssignmentResponse<ApiVersion.v1>,
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
      return `/systems/${encodeURIComponent(args.systemIdentifier)}/access-roles/${encodeURIComponent(args.accessRoleIdentifier)}/assignments/${encodeURIComponent(args.accessRoleAssignmentId)}?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Fetches one assignment of a system access role, addressed by its assignment ID.
 *
 * Roles V2 operation:
 * `GET /systems/{systemIdentifier}/access-roles/{accessRoleIdentifier}/assignments/{accessRoleAssignmentId}`
 * — "Get an access role assignment by ID."
 *
 * Curried in two stages: `getSystemAccessRoleAssignment(version, client, method)` binds the API
 * version, the `IHttpClient` that reaches the Roles service, and the execution method —
 * `'json'` for a promise, `'json$'` for an observable stream. The returned function takes
 * {@link GetSystemAccessRoleAssignmentArg} plus an optional `ClientRequestInit`, and gives back
 * {@link GetSystemAccessRoleAssignmentResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `ApiAccessRoleAssignmentSchemaV1`, and sends `api-version=1.0` on the request.
 *
 * Query options: `expand` is sent as `$expand` to inline related resources.
 *
 * Roles V2 answers `200 OK`; the body is typed `ApiAccessRoleAssignmentV1`.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link GetSystemAccessRoleAssignmentArg} and an optional
 * `ClientRequestInit`, returning {@link GetSystemAccessRoleAssignmentResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { getSystemAccessRoleAssignment } from '@equinor/fusion-services/roles';
 *
 * const assignment = await getSystemAccessRoleAssignment('v1', httpClient)({
 *   systemIdentifier: 'fusion-core',
 *   accessRoleIdentifier: 'writer',
 *   accessRoleAssignmentId: '4d2c9a71-5e6f-4b80-9c12-3a4b5c6d7e8f',
 * });
 * ```
 */
const getSystemAccessRoleAssignment = <
  TVersion extends GetSystemAccessRoleAssignmentVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: GetSystemAccessRoleAssignmentArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, GetSystemAccessRoleAssignmentResponse<MethodVersion>>,
  ): GetSystemAccessRoleAssignmentResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as GetSystemAccessRoleAssignmentResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type GetSystemAccessRoleAssignmentArg,
  type GetSystemAccessRoleAssignmentResponse,
  type GetSystemAccessRoleAssignmentResult,
  type GetSystemAccessRoleAssignmentVersion,
  getSystemAccessRoleAssignment,
};
