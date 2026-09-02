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
import { ApiSystemSchemaV1 } from '../v1/schemas/api-system-schema-v1';
import { UpdateSystemRequestSchemaV1 } from '../v1/schemas/update-system-request-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `updateSystem` accepts for `PATCH /systems/{systemIdentifier}`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link UpdateSystemArg} and {@link UpdateSystemResponse}.
 */
type UpdateSystemVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `updateSystem`, implementing `PATCH /systems/{systemIdentifier}`.
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
        ...UpdateSystemRequestSchemaV1.shape,
      })
      .describe('Arguments for PATCH /systems/{systemIdentifier} (updateSystem v1.0).'),
    /** Response published by version 1.0 of this operation. */
    response: ApiSystemSchemaV1,
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `updateSystem` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiSystemV1`, inferred from `ApiSystemSchemaV1` — the very schema
 * that validates the `200 OK` body at runtime.
 */
type UpdateSystemResponse<TVersion extends UpdateSystemVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `updateSystem` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifier `systemIdentifier`, and the request body fields of
 * `UpdateSystemRequestV1`.
 *
 * Path identifiers and body fields share one flat object; the endpoint separates them when it
 * builds the request. The value is parsed by the version's Zod argument schema before anything
 * is sent.
 */
type UpdateSystemArg<TVersion extends UpdateSystemVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `updateSystem` hands back once the request runs, for the selected API version and client
 * method.
 *
 * `'json'` gives `Promise<UpdateSystemResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<UpdateSystemResponse<TVersion>>`, so promise and observable callers share one
 * response type.
 */
type UpdateSystemResult<
  TVersion extends UpdateSystemVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<UpdateSystemResponse<TVersion>>[TMethod];

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
      const { systemIdentifier: _systemIdentifier, ...body } = args;
      const baseInit: FetchRequestInit<UpdateSystemResponse<ApiVersion.v1>, JsonRequest> = {
        method: 'PATCH',
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
      return `/systems/${encodeURIComponent(args.systemIdentifier)}?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Updates the description or owner list of a registered system.
 *
 * Roles V2 operation: `PATCH /systems/{systemIdentifier}` — "Update an existing system."
 *
 * Curried in two stages: `updateSystem(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Roles service, and the execution method — `'json'` for a
 * promise, `'json$'` for an observable stream. The returned function takes
 * {@link UpdateSystemArg} plus an optional `ClientRequestInit`, and gives back
 * {@link UpdateSystemResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `ApiSystemSchemaV1`, and sends `api-version=1.0` on the request.
 *
 * Roles V2 answers `200 OK`; the body is typed `ApiSystemV1`. Fields left out of the arguments
 * are not sent, so they keep their stored values. The contract declares `403 Forbidden` for
 * callers the Roles service does not authorise for this operation.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link UpdateSystemArg} and an optional
 * `ClientRequestInit`, returning {@link UpdateSystemResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { updateSystem } from '@equinor/fusion-services/roles';
 *
 * const system = await updateSystem('v1', httpClient)({
 *   systemIdentifier: 'fusion-core',
 *   description: 'Fusion core platform',
 * });
 * ```
 */
const updateSystem = <
  TVersion extends UpdateSystemVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: UpdateSystemArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, UpdateSystemResponse<MethodVersion>>,
  ): UpdateSystemResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as UpdateSystemResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type UpdateSystemArg,
  type UpdateSystemResponse,
  type UpdateSystemResult,
  type UpdateSystemVersion,
  updateSystem,
};
