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
import { ApiRoleBindingConfigurationStatusSchemaV1 } from '../v1/schemas/api-role-binding-configuration-status-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `getRoleBindingConfigurationStatus` accepts for
 * `GET /role-binding-configurations/{identifier}/status`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link GetRoleBindingConfigurationStatusArg} and
 * {@link GetRoleBindingConfigurationStatusResponse}.
 */
type GetRoleBindingConfigurationStatusVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `getRoleBindingConfigurationStatus`, implementing
 * `GET /role-binding-configurations/{identifier}/status`.
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
        /** Role binding configuration UUID or unique identifier. */
        identifier: z.string().describe('Role binding configuration UUID or unique identifier.'),
      })
      .describe(
        'Arguments for GET /role-binding-configurations/{identifier}/status (getRoleBindingConfigurationStatus v1.0).',
      ),
    /** Response published by version 1.0 of this operation. */
    response: ApiRoleBindingConfigurationStatusSchemaV1,
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `getRoleBindingConfigurationStatus` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiRoleBindingConfigurationStatusV1`, inferred from
 * `ApiRoleBindingConfigurationStatusSchemaV1` — the very schema that validates the `200 OK`
 * body at runtime.
 */
type GetRoleBindingConfigurationStatusResponse<
  TVersion extends GetRoleBindingConfigurationStatusVersion,
> = VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `getRoleBindingConfigurationStatus` accepts, resolved from the selected API
 * version.
 *
 * Version 1.0 accepts the path identifier `identifier`.
 *
 * The value is parsed by the version's Zod argument schema before the request path is built, so
 * defaults and range checks apply up front.
 */
type GetRoleBindingConfigurationStatusArg<
  TVersion extends GetRoleBindingConfigurationStatusVersion,
> = VersionedArgs<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * What `getRoleBindingConfigurationStatus` hands back once the request runs, for the selected
 * API version and client method.
 *
 * `'json'` gives `Promise<GetRoleBindingConfigurationStatusResponse<TVersion>>` and `'json$'`
 * gives `StreamResponse<GetRoleBindingConfigurationStatusResponse<TVersion>>`, so promise and
 * observable callers share one response type.
 */
type GetRoleBindingConfigurationStatusResult<
  TVersion extends GetRoleBindingConfigurationStatusVersion,
  TMethod extends ClientMethodType = 'json',
  TResult = GetRoleBindingConfigurationStatusResponse<TVersion>,
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
        GetRoleBindingConfigurationStatusResponse<ApiVersion.v1>,
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
      return `/role-binding-configurations/${encodeURIComponent(args.identifier)}/status?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Fetches the current synchronisation status of a role binding configuration.
 *
 * Roles V2 operation: `GET /role-binding-configurations/{identifier}/status` — "Get the status
 * of a role binding configuration."
 *
 * Curried in two stages: `getRoleBindingConfigurationStatus(version, client, method)` binds the
 * API version, the `IHttpClient` that reaches the Roles service, and the execution method —
 * `'json'` for a promise, `'json$'` for an observable stream. The returned function takes
 * {@link GetRoleBindingConfigurationStatusArg} plus an optional `ClientRequestInit`, and gives
 * back {@link GetRoleBindingConfigurationStatusResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `ApiRoleBindingConfigurationStatusSchemaV1`, and sends `api-version=1.0` on the request.
 *
 * Roles V2 answers `200 OK`; the body is typed `ApiRoleBindingConfigurationStatusV1`.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link GetRoleBindingConfigurationStatusArg} and an
 * optional `ClientRequestInit`, returning {@link GetRoleBindingConfigurationStatusResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { getRoleBindingConfigurationStatus } from '@equinor/fusion-services/roles';
 *
 * const status = await getRoleBindingConfigurationStatus('v1', httpClient)({
 *   identifier: 'org-chart-sync',
 * });
 * ```
 */
const getRoleBindingConfigurationStatus = <
  TVersion extends GetRoleBindingConfigurationStatusVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return <
    TResponse = GetRoleBindingConfigurationStatusResponse<MethodVersion>,
    TResult = GetRoleBindingConfigurationStatusResult<MethodVersion, TMethod, TResponse>,
  >(
    input: GetRoleBindingConfigurationStatusArg<MethodVersion>,
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
  type GetRoleBindingConfigurationStatusArg,
  type GetRoleBindingConfigurationStatusResponse,
  type GetRoleBindingConfigurationStatusResult,
  type GetRoleBindingConfigurationStatusVersion,
  getRoleBindingConfigurationStatus,
};
