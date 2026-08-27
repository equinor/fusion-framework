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
import { ApiPurgeBindingResultSchemaV1 } from '../v1/schemas/api-purge-binding-result-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `purgeExpiredRoleBindingConfigurationHistory` accepts for
 * `DELETE /role-binding-configurations/history/expired`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link PurgeExpiredRoleBindingConfigurationHistoryArg} and
 * {@link PurgeExpiredRoleBindingConfigurationHistoryResponse}.
 */
type PurgeExpiredRoleBindingConfigurationHistoryVersion =
  FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `purgeExpiredRoleBindingConfigurationHistory`, implementing
 * `DELETE /role-binding-configurations/history/expired`.
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
        'Arguments for DELETE /role-binding-configurations/history/expired (purgeExpiredRoleBindingConfigurationHistory v1.0).',
      ),
    /** Response published by version 1.0 of this operation. */
    response: ApiPurgeBindingResultSchemaV1,
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `purgeExpiredRoleBindingConfigurationHistory` resolves for the selected API
 * version.
 *
 * Version 1.0 resolves to `ApiPurgeBindingResultV1`, inferred from
 * `ApiPurgeBindingResultSchemaV1` — the very schema that validates the `200 OK` body at
 * runtime.
 */
type PurgeExpiredRoleBindingConfigurationHistoryResponse<
  TVersion extends PurgeExpiredRoleBindingConfigurationHistoryVersion,
> = VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `purgeExpiredRoleBindingConfigurationHistory` accepts, resolved from the selected
 * API version.
 *
 * Version 1.0 of this operation takes no arguments, so the shape is an empty object.
 *
 * The value is parsed by the version's Zod argument schema before the request path is built, so
 * defaults and range checks apply up front.
 */
type PurgeExpiredRoleBindingConfigurationHistoryArg<
  TVersion extends PurgeExpiredRoleBindingConfigurationHistoryVersion,
> = VersionedArgs<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * What `purgeExpiredRoleBindingConfigurationHistory` hands back once the request runs, for the
 * selected API version and client method.
 *
 * `'json'` gives `Promise<PurgeExpiredRoleBindingConfigurationHistoryResponse<TVersion>>` and
 * `'json$'` gives
 * `StreamResponse<PurgeExpiredRoleBindingConfigurationHistoryResponse<TVersion>>`, so promise
 * and observable callers share one response type.
 */
type PurgeExpiredRoleBindingConfigurationHistoryResult<
  TVersion extends PurgeExpiredRoleBindingConfigurationHistoryVersion,
  TMethod extends ClientMethodType = 'json',
  TResult = PurgeExpiredRoleBindingConfigurationHistoryResponse<TVersion>,
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
        PurgeExpiredRoleBindingConfigurationHistoryResponse<ApiVersion.v1>,
        JsonRequest
      > = {
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
  _args: VersionedParsedArgs<typeof VersionContract, TVersion>,
): string => {
  // Build the endpoint path according to the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const params = new URLSearchParams();
      params.append('api-version', version);
      return `/role-binding-configurations/history/expired?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Purges role binding execution history and notification records that have aged out of the
 * retention window.
 *
 * Roles V2 operation: `DELETE /role-binding-configurations/history/expired` — "Purge expired
 * history and notification records beyond the retention window."
 *
 * Curried in two stages: `purgeExpiredRoleBindingConfigurationHistory(version, client, method)`
 * binds the API version, the `IHttpClient` that reaches the Roles service, and the execution
 * method — `'json'` for a promise, `'json$'` for an observable stream. The returned function
 * takes {@link PurgeExpiredRoleBindingConfigurationHistoryArg} plus an optional
 * `ClientRequestInit`, and gives back
 * {@link PurgeExpiredRoleBindingConfigurationHistoryResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `ApiPurgeBindingResultSchemaV1`, and sends `api-version=1.0` on the request.
 *
 * Destructive: it removes the expired history and notification records permanently, and the
 * deletion cannot be undone through this API. Roles V2 answers `200 OK`; the body is typed
 * `ApiPurgeBindingResultV1`. The contract declares `403 Forbidden` for callers the Roles
 * service does not authorise for this operation.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link PurgeExpiredRoleBindingConfigurationHistoryArg} and
 * an optional `ClientRequestInit`, returning
 * {@link PurgeExpiredRoleBindingConfigurationHistoryResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { purgeExpiredRoleBindingConfigurationHistory } from '@equinor/fusion-services/roles';
 *
 * const result = await purgeExpiredRoleBindingConfigurationHistory('v1', httpClient)({});
 * ```
 */
const purgeExpiredRoleBindingConfigurationHistory = <
  TVersion extends PurgeExpiredRoleBindingConfigurationHistoryVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return <
    TResponse = PurgeExpiredRoleBindingConfigurationHistoryResponse<MethodVersion>,
    TResult = PurgeExpiredRoleBindingConfigurationHistoryResult<MethodVersion, TMethod, TResponse>,
  >(
    input?: PurgeExpiredRoleBindingConfigurationHistoryArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, TResponse>,
  ): TResult => {
    // The operation has no required arguments, so an omitted argument object parses as empty.
    const args = parseVersionedArgs(VersionContract, apiVersion, input ?? {});
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
  type PurgeExpiredRoleBindingConfigurationHistoryArg,
  type PurgeExpiredRoleBindingConfigurationHistoryResponse,
  type PurgeExpiredRoleBindingConfigurationHistoryResult,
  type PurgeExpiredRoleBindingConfigurationHistoryVersion,
  purgeExpiredRoleBindingConfigurationHistory,
};
