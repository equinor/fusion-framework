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
import { ApiAppVersionConfigSchemaV1 } from '../v1/schemas/api-app-version-config-schema-v1';
import { CreateAppBuildConfigRequestSchemaV1 } from '../v1/schemas/create-app-build-config-request-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `upsertAppBuildConfig` accepts for `PUT
 * /apps/{appIdentifier}/builds/{versionIdentifier}/config`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link UpsertAppBuildConfigArg} and {@link UpsertAppBuildConfigResponse}.
 */
type UpsertAppBuildConfigVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `upsertAppBuildConfig`, implementing `PUT
 * /apps/{appIdentifier}/builds/{versionIdentifier}/config`.
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
        ...CreateAppBuildConfigRequestSchemaV1.shape,
      })
      .describe(
        'Arguments for PUT /apps/{appIdentifier}/builds/{versionIdentifier}/config (upsertAppBuildConfig v1.0).',
      ),
    /** Response published by version 1.0. */
    response: ApiAppVersionConfigSchemaV1,
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `upsertAppBuildConfig` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiAppVersionConfigV1`, inferred from `ApiAppVersionConfigSchemaV1` —
 * the very schema that validates the `200 OK` body at runtime.
 */
type UpsertAppBuildConfigResponse<TVersion extends UpsertAppBuildConfigVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `upsertAppBuildConfig` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifiers `appIdentifier`, `versionIdentifier`, and the request
 * body fields of `CreateAppBuildConfigRequestV1`. Path identifiers and body fields share one flat
 * object; the endpoint separates them when it builds the request.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type UpsertAppBuildConfigArg<TVersion extends UpsertAppBuildConfigVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `upsertAppBuildConfig` hands back once the request runs, for the selected API version and
 * client method.
 *
 * `'json'` gives `Promise<UpsertAppBuildConfigResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<UpsertAppBuildConfigResponse<TVersion>>`, so promise and observable callers share
 * one response type.
 */
type UpsertAppBuildConfigResult<
  TVersion extends UpsertAppBuildConfigVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<UpsertAppBuildConfigResponse<TVersion>>[TMethod];

/** Builds the request init for the resolved version, including its response-schema selector. */
const generateRequestParameters = <TResult, TVersion extends AvailableVersions>(
  version: TVersion,
  args: VersionedParsedArgs<typeof VersionContract, TVersion>,
  init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
  // Select the response schema that matches the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      // Path identifiers and query options address the resource, so only the
      // remaining fields form the request body.
      const {
        appIdentifier: _appIdentifier,
        versionIdentifier: _versionIdentifier,
        ...body
      } = args;
      const baseInit: FetchRequestInit<UpsertAppBuildConfigResponse<ApiVersion.v1>, JsonRequest> = {
        method: 'PUT',
        selector: versionedResponseSelector(VersionContract, version),
        body,
      };
      // Apply the caller-supplied `init` first, then the generated defaults, so the generated
      // `method`, `body` and version-specific response `selector` always win and cannot be
      // overridden or bypassed.
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
      return `/apps/${encodeURIComponent(args.appIdentifier)}/builds/${encodeURIComponent(args.versionIdentifier)}/config?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Upserts app config for specific app build.
 *
 * Fusion Apps API operation: `PUT /apps/{appIdentifier}/builds/{versionIdentifier}/config` —
 * "Upserts app config for specific app build."
 *
 * Curried in two stages: `upsertAppBuildConfig(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for a promise,
 * `'json$'` for an observable stream. The returned function takes {@link UpsertAppBuildConfigArg}
 * plus an optional `ClientRequestInit`, and gives back {@link UpsertAppBuildConfigResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `ApiAppVersionConfigSchemaV1`, and sends `api-version=1.0` on the request.
 *
 * The Apps service answers `200 OK`; the body is typed `ApiAppVersionConfigV1`. The contract
 * declares `403 Forbidden` for callers the Apps service does not authorise for this operation.
 *
 * Related: `getAppBuildConfig`.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link UpsertAppBuildConfigArg} and an optional
 * `ClientRequestInit`, returning {@link UpsertAppBuildConfigResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { upsertAppBuildConfig } from '@equinor/fusion-services/apps';
 *
 * const result = await upsertAppBuildConfig('v1', httpClient)({
 *   appIdentifier: 'my-app',
 *   versionIdentifier: '1.2.3',
 *   environment: { LOG_LEVEL: 'debug' },
 * });
 * ```
 */
const upsertAppBuildConfig = <
  TVersion extends UpsertAppBuildConfigVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: UpsertAppBuildConfigArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, UpsertAppBuildConfigResponse<MethodVersion>>,
  ): UpsertAppBuildConfigResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as UpsertAppBuildConfigResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type UpsertAppBuildConfigArg,
  type UpsertAppBuildConfigResponse,
  type UpsertAppBuildConfigResult,
  type UpsertAppBuildConfigVersion,
  upsertAppBuildConfig,
};
