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
import { ApiAppSchemaV1 } from '../v1/schemas/api-app-schema-v1';
import { PatchAppRequestSchemaV1 } from '../v1/schemas/patch-app-request-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `updateApp` accepts for `PATCH /apps/{appIdentifier}`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link UpdateAppArg} and {@link UpdateAppResponse}.
 */
type UpdateAppVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `updateApp`, implementing `PATCH /apps/{appIdentifier}`.
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
        ...PatchAppRequestSchemaV1.shape,
      })
      .describe('Arguments for PATCH /apps/{appIdentifier} (updateApp v1.0).'),
    /** Response published by version 1.0. */
    response: ApiAppSchemaV1,
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `updateApp` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiAppV1`, inferred from `ApiAppSchemaV1` — the very schema that
 * validates the `200 OK` body at runtime.
 */
type UpdateAppResponse<TVersion extends UpdateAppVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `updateApp` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifier `appIdentifier`, and the request body fields of
 * `PatchAppRequestV1`. Path identifiers and body fields share one flat object; the endpoint
 * separates them when it builds the request.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type UpdateAppArg<TVersion extends UpdateAppVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `updateApp` hands back once the request runs, for the selected API version and client
 * method.
 *
 * `'json'` gives `Promise<UpdateAppResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<UpdateAppResponse<TVersion>>`, so promise and observable callers share one
 * response type.
 */
type UpdateAppResult<
  TVersion extends UpdateAppVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<UpdateAppResponse<TVersion>>[TMethod];

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
      const { appIdentifier: _appIdentifier, ...body } = args;
      const baseInit: FetchRequestInit<UpdateAppResponse<ApiVersion.v1>, JsonRequest> = {
        method: 'PATCH',
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
      return `/apps/${encodeURIComponent(args.appIdentifier)}?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Updates app properties.
 *
 * Fusion Apps API operation: `PATCH /apps/{appIdentifier}` — "Updates app properties."
 *
 * Curried in two stages: `updateApp(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for a promise,
 * `'json$'` for an observable stream. The returned function takes {@link UpdateAppArg} plus an
 * optional `ClientRequestInit`, and gives back {@link UpdateAppResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `ApiAppSchemaV1`, and sends `api-version=1.0` on the request.
 *
 * The Apps service answers `200 OK`; the body is typed `ApiAppV1`. The contract declares `403
 * Forbidden` for callers the Apps service does not authorise for this operation.
 *
 * Related: `getApp`, `updateAppGovernance`.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link UpdateAppArg} and an optional
 * `ClientRequestInit`, returning {@link UpdateAppResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { updateApp } from '@equinor/fusion-services/apps';
 *
 * const result = await updateApp('v1', httpClient)({
 *   appIdentifier: 'my-app',
 *   displayName: 'My app',
 * });
 * ```
 */
const updateApp = <TVersion extends UpdateAppVersion, TMethod extends ClientMethodType = 'json'>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: UpdateAppArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, UpdateAppResponse<MethodVersion>>,
  ): UpdateAppResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as UpdateAppResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type UpdateAppArg,
  type UpdateAppResponse,
  type UpdateAppResult,
  type UpdateAppVersion,
  updateApp,
};
