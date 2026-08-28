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
import { ApiAccessRoleSchemaV1 } from '../v1/schemas/api-access-role-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `listSystemAccessRoles` accepts for
 * `GET /systems/{systemIdentifier}/access-roles`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link ListSystemAccessRolesArg} and {@link ListSystemAccessRolesResponse}.
 */
type ListSystemAccessRolesVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `listSystemAccessRoles`, implementing
 * `GET /systems/{systemIdentifier}/access-roles`.
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
      })
      .describe(
        'Arguments for GET /systems/{systemIdentifier}/access-roles (listSystemAccessRoles v1.0).',
      ),
    /** Response published by version 1.0 of this operation. */
    response: z.array(ApiAccessRoleSchemaV1),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `listSystemAccessRoles` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiAccessRoleV1[]`, inferred from `z.array(ApiAccessRoleSchemaV1)` —
 * the very schema that validates the `200 OK` body at runtime.
 */
type ListSystemAccessRolesResponse<TVersion extends ListSystemAccessRolesVersion> =
  VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `listSystemAccessRoles` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifier `systemIdentifier`.
 *
 * The value is parsed by the version's Zod argument schema before the request path is built, so
 * defaults and range checks apply up front.
 */
type ListSystemAccessRolesArg<TVersion extends ListSystemAccessRolesVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `listSystemAccessRoles` hands back once the request runs, for the selected API version
 * and client method.
 *
 * `'json'` gives `Promise<ListSystemAccessRolesResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<ListSystemAccessRolesResponse<TVersion>>`, so promise and observable callers
 * share one response type.
 */
type ListSystemAccessRolesResult<
  TVersion extends ListSystemAccessRolesVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<ListSystemAccessRolesResponse<TVersion>>[TMethod];

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
        ListSystemAccessRolesResponse<ApiVersion.v1>,
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
      return `/systems/${encodeURIComponent(args.systemIdentifier)}/access-roles?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Lists the access roles owned by one registered system.
 *
 * Roles V2 operation: `GET /systems/{systemIdentifier}/access-roles` — "Get all access roles
 * for a system."
 *
 * Curried in two stages: `listSystemAccessRoles(version, client, method)` binds the API
 * version, the `IHttpClient` that reaches the Roles service, and the execution method —
 * `'json'` for a promise, `'json$'` for an observable stream. The returned function takes
 * {@link ListSystemAccessRolesArg} plus an optional `ClientRequestInit`, and gives back
 * {@link ListSystemAccessRolesResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `z.array(ApiAccessRoleSchemaV1)`, and sends `api-version=1.0` on the request.
 *
 * Roles V2 answers `200 OK`; the body is typed `ApiAccessRoleV1[]`.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link ListSystemAccessRolesArg} and an optional
 * `ClientRequestInit`, returning {@link ListSystemAccessRolesResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { listSystemAccessRoles } from '@equinor/fusion-services/roles';
 *
 * const page = await listSystemAccessRoles('v1', httpClient)({
 *   systemIdentifier: 'fusion-core',
 * });
 * ```
 */
const listSystemAccessRoles = <
  TVersion extends ListSystemAccessRolesVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: ListSystemAccessRolesArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, ListSystemAccessRolesResponse<MethodVersion>>,
  ): ListSystemAccessRolesResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as ListSystemAccessRolesResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type ListSystemAccessRolesArg,
  type ListSystemAccessRolesResponse,
  type ListSystemAccessRolesResult,
  type ListSystemAccessRolesVersion,
  listSystemAccessRoles,
};
