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
 * API version identifiers `unpinPersonApp` accepts for `DELETE
 * /persons/{accountIdentifier}/pinned-apps/{appIdentifier}`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link UnpinPersonAppArg} and {@link UnpinPersonAppResponse}.
 */
type UnpinPersonAppVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `unpinPersonApp`, implementing `DELETE
 * /persons/{accountIdentifier}/pinned-apps/{appIdentifier}`.
 *
 * Each concrete {@link ApiVersion} maps to the argument and response schemas that version
 * publishes, so the version a caller passes is the single discriminator for the request shape, the
 * request path, and the response shape.
 */
const VersionContract = {
  [ApiVersion.v1]: {
    /** Arguments accepted by version 1.0 of this operation. */
    args: z
      .object({
        /** Azure unique id or email. */
        accountIdentifier: z.string().describe('Azure unique id or email.'),
        /** Unique identifier (app id or appKey). */
        appIdentifier: z.string().describe('Unique identifier (app id or appKey).'),
      })
      .describe(
        'Arguments for DELETE /persons/{accountIdentifier}/pinned-apps/{appIdentifier} (unpinPersonApp v1.0).',
      ),
    /** Response published by version 1.0. The operation answers `204 No Content` without a body. */
    response: z.void(),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `unpinPersonApp` resolves for the selected API version.
 *
 * Version 1.0 answers `204 No Content` without a body, so the type resolves to `void`.
 */
type UnpinPersonAppResponse<TVersion extends UnpinPersonAppVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `unpinPersonApp` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifiers `accountIdentifier`, `appIdentifier`.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type UnpinPersonAppArg<TVersion extends UnpinPersonAppVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `unpinPersonApp` hands back once the request runs, for the selected API version and client
 * method.
 *
 * `'json'` gives `Promise<UnpinPersonAppResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<UnpinPersonAppResponse<TVersion>>`, so promise and observable callers share one
 * response type.
 */
type UnpinPersonAppResult<
  TVersion extends UnpinPersonAppVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<UnpinPersonAppResponse<TVersion>>[TMethod];

/** Builds the request init for the resolved version, including its response-schema selector. */
const generateRequestParameters = <TResult, TVersion extends AvailableVersions>(
  version: TVersion,
  _args: VersionedParsedArgs<typeof VersionContract, TVersion>,
  init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
  // Select the response schema that matches the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const baseInit: FetchRequestInit<UnpinPersonAppResponse<ApiVersion.v1>, JsonRequest> = {
        method: 'DELETE',
        selector: versionedResponseSelector(VersionContract, version),
        // The contract declares no request body, so any caller-supplied body is dropped.
        body: undefined,
      };
      // Apply the caller-supplied `init` first, then the generated defaults, so the generated
      // `method`, forced empty `body` and version-specific response `selector` always win and
      // cannot be overridden or bypassed.
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
      return `/persons/${encodeURIComponent(args.accountIdentifier)}/pinned-apps/${encodeURIComponent(args.appIdentifier)}?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Removes an app from a person’s pinned apps.
 *
 * Fusion Apps API operation: `DELETE /persons/{accountIdentifier}/pinned-apps/{appIdentifier}` —
 * "Removes an app as pinned."
 *
 * Curried in two stages: `unpinPersonApp(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for a promise,
 * `'json$'` for an observable stream. The returned function takes {@link UnpinPersonAppArg} plus an
 * optional `ClientRequestInit`, and gives back {@link UnpinPersonAppResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, checks the response status, and sends
 * `api-version=1.0` on the request.
 *
 * The Apps service answers `204 No Content` without a body, so the result resolves to `void` once
 * the response status is accepted. The contract declares `403 Forbidden` for callers the Apps
 * service does not authorise for this operation.
 *
 * Related: `listPersonPinnedApps`, `pinPersonApp`.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link UnpinPersonAppArg} and an optional
 * `ClientRequestInit`, returning {@link UnpinPersonAppResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { unpinPersonApp } from '@equinor/fusion-services/apps';
 *
 * await unpinPersonApp('v1', httpClient)({
 *   accountIdentifier: 'user@equinor.com',
 *   appIdentifier: 'my-app',
 * });
 * ```
 */
const unpinPersonApp = <
  TVersion extends UnpinPersonAppVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: UnpinPersonAppArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, UnpinPersonAppResponse<MethodVersion>>,
  ): UnpinPersonAppResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as UnpinPersonAppResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type UnpinPersonAppArg,
  type UnpinPersonAppResponse,
  type UnpinPersonAppResult,
  type UnpinPersonAppVersion,
  unpinPersonApp,
};
