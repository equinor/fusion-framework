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
import { RegisterSystemRequestSchemaV1 } from '../v1/schemas/register-system-request-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `createSystem` accepts for `POST /systems`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link CreateSystemArg} and {@link CreateSystemResponse}.
 */
type CreateSystemVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `createSystem`, implementing `POST /systems`.
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
        ...RegisterSystemRequestSchemaV1.shape,
      })
      .describe('Arguments for POST /systems (createSystem v1.0).'),
    /** Response published by version 1.0 of this operation. */
    response: ApiSystemSchemaV1,
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `createSystem` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiSystemV1`, inferred from `ApiSystemSchemaV1` — the very schema
 * that validates the `201 Created` body at runtime.
 */
type CreateSystemResponse<TVersion extends CreateSystemVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `createSystem` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the request body fields of `RegisterSystemRequestV1`.
 *
 * Path identifiers and body fields share one flat object; the endpoint separates them when it
 * builds the request. The value is parsed by the version's Zod argument schema before anything
 * is sent.
 */
type CreateSystemArg<TVersion extends CreateSystemVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `createSystem` hands back once the request runs, for the selected API version and client
 * method.
 *
 * `'json'` gives `Promise<CreateSystemResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<CreateSystemResponse<TVersion>>`, so promise and observable callers share one
 * response type.
 */
type CreateSystemResult<
  TVersion extends CreateSystemVersion,
  TMethod extends ClientMethodType = 'json',
  TResult = CreateSystemResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];

/** Builds the request init for the resolved version, including its response-schema selector. */
const generateRequestParameters = <TResult, TVersion extends AvailableVersions>(
  version: TVersion,
  args: VersionedParsedArgs<typeof VersionContract, TVersion>,
  init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
  // Select the response schema that matches the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      // The operation takes no path identifiers, so every argument belongs to the request body.
      const body = { ...args };
      const baseInit: FetchRequestInit<CreateSystemResponse<ApiVersion.v1>, JsonRequest> = {
        method: 'POST',
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
  _args: VersionedParsedArgs<typeof VersionContract, TVersion>,
): string => {
  // Build the endpoint path according to the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const params = new URLSearchParams();
      params.append('api-version', version);
      return `/systems?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Registers a system with the Fusion Roles V2 service.
 *
 * Roles V2 operation: `POST /systems` — "Create a new system."
 *
 * Curried in two stages: `createSystem(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Roles service, and the execution method — `'json'` for a
 * promise, `'json$'` for an observable stream. The returned function takes
 * {@link CreateSystemArg} plus an optional `ClientRequestInit`, and gives back
 * {@link CreateSystemResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `ApiSystemSchemaV1`, and sends `api-version=1.0` on the request.
 *
 * Roles V2 answers `201 Created`; the body is typed `ApiSystemV1`. A colliding name answers
 * `409 Conflict`. The contract declares `403 Forbidden` for callers the Roles service does not
 * authorise for this operation.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link CreateSystemArg} and an optional
 * `ClientRequestInit`, returning {@link CreateSystemResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { createSystem } from '@equinor/fusion-services/roles';
 *
 * const system = await createSystem('v1', httpClient)({
 *   name: 'fusion-core',
 *   description: 'Fusion core platform',
 * });
 * ```
 */
const createSystem = <
  TVersion extends CreateSystemVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return <
    TResponse = CreateSystemResponse<MethodVersion>,
    TResult = CreateSystemResult<MethodVersion, TMethod, TResponse>,
  >(
    input?: CreateSystemArg<MethodVersion>,
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
  type CreateSystemArg,
  type CreateSystemResponse,
  type CreateSystemResult,
  type CreateSystemVersion,
  createSystem,
};
