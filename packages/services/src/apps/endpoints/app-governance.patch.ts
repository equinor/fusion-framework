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
import { ApiGovernanceAppSchemaV1 } from '../v1/schemas/api-governance-app-schema-v1';
import { PatchGovernanceAppRequestSchemaV1 } from '../v1/schemas/patch-governance-app-request-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `updateAppGovernance` accepts for `PATCH
 * /apps/{appIdentifier}/governance`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link UpdateAppGovernanceArg} and {@link UpdateAppGovernanceResponse}.
 */
type UpdateAppGovernanceVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `updateAppGovernance`, implementing `PATCH
 * /apps/{appIdentifier}/governance`.
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
        /** Unique identifier (app key or id). */
        appIdentifier: z.string().describe('Unique identifier (app key or id).'),
        ...PatchGovernanceAppRequestSchemaV1.shape,
      })
      .describe('Arguments for PATCH /apps/{appIdentifier}/governance (updateAppGovernance v1.0).'),
    /** Response published by version 1.0. */
    response: ApiGovernanceAppSchemaV1,
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `updateAppGovernance` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiGovernanceAppV1`, inferred from `ApiGovernanceAppSchemaV1` — the very
 * schema that validates the `200 OK` body at runtime.
 */
type UpdateAppGovernanceResponse<TVersion extends UpdateAppGovernanceVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `updateAppGovernance` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifier `appIdentifier`, and the request body fields of
 * `PatchGovernanceAppRequestV1`. Path identifiers and body fields share one flat object; the
 * endpoint separates them when it builds the request.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type UpdateAppGovernanceArg<TVersion extends UpdateAppGovernanceVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `updateAppGovernance` hands back once the request runs, for the selected API version and
 * client method.
 *
 * `'json'` gives `Promise<UpdateAppGovernanceResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<UpdateAppGovernanceResponse<TVersion>>`, so promise and observable callers share
 * one response type.
 */
type UpdateAppGovernanceResult<
  TVersion extends UpdateAppGovernanceVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<UpdateAppGovernanceResponse<TVersion>>[TMethod];

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
      const baseInit: FetchRequestInit<UpdateAppGovernanceResponse<ApiVersion.v1>, JsonRequest> = {
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
      return `/apps/${encodeURIComponent(args.appIdentifier)}/governance?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Updates the governance information registered for an app.
 *
 * Fusion Apps API operation: `PATCH /apps/{appIdentifier}/governance` — "Updated the governance
 * information for the specified app."
 *
 * Curried in two stages: `updateAppGovernance(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for a promise,
 * `'json$'` for an observable stream. The returned function takes {@link UpdateAppGovernanceArg}
 * plus an optional `ClientRequestInit`, and gives back {@link UpdateAppGovernanceResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `ApiGovernanceAppSchemaV1`, and sends `api-version=1.0` on the request.
 *
 * The Apps service answers `200 OK`; the body is typed `ApiGovernanceAppV1`. The contract declares
 * `403 Forbidden` for callers the Apps service does not authorise for this operation.
 *
 * Related: `getAppGovernance`, `confirmAppGovernance`.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link UpdateAppGovernanceArg} and an optional
 * `ClientRequestInit`, returning {@link UpdateAppGovernanceResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { updateAppGovernance } from '@equinor/fusion-services/apps';
 *
 * const result = await updateAppGovernance('v1', httpClient)({
 *   appIdentifier: 'my-app',
 *   businessOwnerOrgUnit: {},
 * });
 * ```
 */
const updateAppGovernance = <
  TVersion extends UpdateAppGovernanceVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: UpdateAppGovernanceArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, UpdateAppGovernanceResponse<MethodVersion>>,
  ): UpdateAppGovernanceResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as UpdateAppGovernanceResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type UpdateAppGovernanceArg,
  type UpdateAppGovernanceResponse,
  type UpdateAppGovernanceResult,
  type UpdateAppGovernanceVersion,
  updateAppGovernance,
};
