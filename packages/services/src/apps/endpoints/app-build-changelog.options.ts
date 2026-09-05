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
 * API version identifiers `checkAppBuildChangelogAccess` accepts for `OPTIONS
 * /apps/{appIdentifier}/builds/{versionIdentifier}/changelog`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link CheckAppBuildChangelogAccessArg} and {@link CheckAppBuildChangelogAccessResponse}.
 */
type CheckAppBuildChangelogAccessVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `checkAppBuildChangelogAccess`, implementing `OPTIONS
 * /apps/{appIdentifier}/builds/{versionIdentifier}/changelog`.
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
        /** Unique identifier (app id or appKey). */
        appIdentifier: z.string().describe('Unique identifier (app id or appKey).'),
        /** Unique identifier (version or tag). */
        versionIdentifier: z.string().describe('Unique identifier (version or tag).'),
      })
      .describe(
        'Arguments for OPTIONS /apps/{appIdentifier}/builds/{versionIdentifier}/changelog (checkAppBuildChangelogAccess v1.0).',
      ),
    /** Response published by version 1.0. The operation answers `204 No Content` without a body. */
    response: z.void(),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `checkAppBuildChangelogAccess` resolves for the selected API version.
 *
 * Version 1.0 answers `204 No Content` without a body, so the type resolves to `void`.
 */
type CheckAppBuildChangelogAccessResponse<TVersion extends CheckAppBuildChangelogAccessVersion> =
  VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `checkAppBuildChangelogAccess` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifiers `appIdentifier`, `versionIdentifier`.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type CheckAppBuildChangelogAccessArg<TVersion extends CheckAppBuildChangelogAccessVersion> =
  VersionedArgs<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * What `checkAppBuildChangelogAccess` hands back once the request runs, for the selected API
 * version and client method.
 *
 * `'json'` gives `Promise<CheckAppBuildChangelogAccessResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<CheckAppBuildChangelogAccessResponse<TVersion>>`, so promise and observable
 * callers share one response type.
 */
type CheckAppBuildChangelogAccessResult<
  TVersion extends CheckAppBuildChangelogAccessVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<CheckAppBuildChangelogAccessResponse<TVersion>>[TMethod];

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
        CheckAppBuildChangelogAccessResponse<ApiVersion.v1>,
        JsonRequest
      > = {
        method: 'OPTIONS',
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
      return `/apps/${encodeURIComponent(args.appIdentifier)}/builds/${encodeURIComponent(args.versionIdentifier)}/changelog?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Endpoint that returns a response header with allowed http methods for the app build changelog.
 *
 * Fusion Apps API operation: `OPTIONS /apps/{appIdentifier}/builds/{versionIdentifier}/changelog` —
 * "Endpoint that returns a response header with allowed http methods for the app build changelog."
 *
 * Curried in two stages: `checkAppBuildChangelogAccess(version, client, method)` binds the API
 * version, the `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for
 * a promise, `'json$'` for an observable stream. The returned function takes
 * {@link CheckAppBuildChangelogAccessArg} plus an optional `ClientRequestInit`, and gives back
 * {@link CheckAppBuildChangelogAccessResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, checks the response status, and sends
 * `api-version=1.0` on the request.
 *
 * The Apps service answers `204 No Content` without a body, so the result resolves to `void` once
 * the response status is accepted.
 *
 * The service publishes the methods it allows on this resource in the response headers of the
 * `OPTIONS` answer. This JSON client returns the parsed body, so it does not surface them: use the
 * call to assert that the resource is reachable and the caller is authorised for it.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link CheckAppBuildChangelogAccessArg} and an optional
 * `ClientRequestInit`, returning {@link CheckAppBuildChangelogAccessResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { checkAppBuildChangelogAccess } from '@equinor/fusion-services/apps';
 *
 * await checkAppBuildChangelogAccess('v1', httpClient)({
 *   appIdentifier: 'my-app',
 *   versionIdentifier: '1.2.3',
 * });
 * ```
 */
const checkAppBuildChangelogAccess = <
  TVersion extends CheckAppBuildChangelogAccessVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: CheckAppBuildChangelogAccessArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, CheckAppBuildChangelogAccessResponse<MethodVersion>>,
  ): CheckAppBuildChangelogAccessResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as CheckAppBuildChangelogAccessResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type CheckAppBuildChangelogAccessArg,
  type CheckAppBuildChangelogAccessResponse,
  type CheckAppBuildChangelogAccessResult,
  type CheckAppBuildChangelogAccessVersion,
  checkAppBuildChangelogAccess,
};
