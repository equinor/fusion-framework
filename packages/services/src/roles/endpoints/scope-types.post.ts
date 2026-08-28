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
import { ApiScopeTypeSchemaV1 } from '../v1/schemas/api-scope-type-schema-v1';
import { CreateScopeTypeRequestSchemaV1 } from '../v1/schemas/create-scope-type-request-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `createScopeType` accepts for `POST /scope-types`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link CreateScopeTypeArg} and {@link CreateScopeTypeResponse}.
 */
type CreateScopeTypeVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `createScopeType`, implementing `POST /scope-types`.
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
        ...CreateScopeTypeRequestSchemaV1.shape,
      })
      .describe('Arguments for POST /scope-types (createScopeType v1.0).'),
    /** Response published by version 1.0 of this operation. */
    response: ApiScopeTypeSchemaV1,
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `createScopeType` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiScopeTypeV1`, inferred from `ApiScopeTypeSchemaV1` — the very
 * schema that validates the `201 Created` body at runtime.
 */
type CreateScopeTypeResponse<TVersion extends CreateScopeTypeVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `createScopeType` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the request body fields of `CreateScopeTypeRequestV1`.
 *
 * Path identifiers and body fields share one flat object; the endpoint separates them when it
 * builds the request. The value is parsed by the version's Zod argument schema before anything
 * is sent.
 */
type CreateScopeTypeArg<TVersion extends CreateScopeTypeVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `createScopeType` hands back once the request runs, for the selected API version and
 * client method.
 *
 * `'json'` gives `Promise<CreateScopeTypeResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<CreateScopeTypeResponse<TVersion>>`, so promise and observable callers share
 * one response type.
 */
type CreateScopeTypeResult<
  TVersion extends CreateScopeTypeVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<CreateScopeTypeResponse<TVersion>>[TMethod];

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
      const baseInit: FetchRequestInit<CreateScopeTypeResponse<ApiVersion.v1>, JsonRequest> = {
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
      return `/scope-types?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Creates a scope type, the vocabulary that role assignment scopes are expressed in.
 *
 * Roles V2 operation: `POST /scope-types` — "Create a new scope type."
 *
 * Curried in two stages: `createScopeType(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Roles service, and the execution method — `'json'` for a
 * promise, `'json$'` for an observable stream. The returned function takes
 * {@link CreateScopeTypeArg} plus an optional `ClientRequestInit`, and gives back
 * {@link CreateScopeTypeResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `ApiScopeTypeSchemaV1`, and sends `api-version=1.0` on the request.
 *
 * Roles V2 answers `201 Created`; the body is typed `ApiScopeTypeV1`. A colliding name answers
 * `409 Conflict`. The contract declares `403 Forbidden` for callers the Roles service does not
 * authorise for this operation.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link CreateScopeTypeArg} and an optional
 * `ClientRequestInit`, returning {@link CreateScopeTypeResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { createScopeType } from '@equinor/fusion-services/roles';
 *
 * const scopeType = await createScopeType('v1', httpClient)({
 *   name: 'project',
 *   description: 'Project scope',
 * });
 * ```
 */
const createScopeType = <
  TVersion extends CreateScopeTypeVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input?: CreateScopeTypeArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, CreateScopeTypeResponse<MethodVersion>>,
  ): CreateScopeTypeResult<MethodVersion, TMethod> => {
    // The operation has no required arguments, so an omitted argument object parses as empty.
    const args = parseVersionedArgs(VersionContract, apiVersion, input ?? {});
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as CreateScopeTypeResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type CreateScopeTypeArg,
  type CreateScopeTypeResponse,
  type CreateScopeTypeResult,
  type CreateScopeTypeVersion,
  createScopeType,
};
