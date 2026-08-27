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

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `listScopeTypes` accepts for `GET /scope-types`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link ListScopeTypesArg} and {@link ListScopeTypesResponse}.
 */
type ListScopeTypesVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `listScopeTypes`, implementing `GET /scope-types`.
 *
 * Each concrete {@link ApiVersion} maps to the argument and response schemas that
 * version publishes, so the version a caller passes is the single discriminator
 * for the request shape, the request path, and the response shape.
 */
const VersionContract = {
  [ApiVersion.v1]: {
    /** Arguments accepted by version 1.0 of this operation. */
    args: z.object({}).describe('Arguments for GET /scope-types (listScopeTypes v1.0).'),
    /** Response published by version 1.0 of this operation. */
    response: z.array(ApiScopeTypeSchemaV1),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `listScopeTypes` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiScopeTypeV1[]`, inferred from `z.array(ApiScopeTypeSchemaV1)` —
 * the very schema that validates the `200 OK` body at runtime.
 */
type ListScopeTypesResponse<TVersion extends ListScopeTypesVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `listScopeTypes` accepts, resolved from the selected API version.
 *
 * Version 1.0 of this operation takes no arguments, so the shape is an empty object.
 *
 * The value is parsed by the version's Zod argument schema before the request path is built, so
 * defaults and range checks apply up front.
 */
type ListScopeTypesArg<TVersion extends ListScopeTypesVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `listScopeTypes` hands back once the request runs, for the selected API version and
 * client method.
 *
 * `'json'` gives `Promise<ListScopeTypesResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<ListScopeTypesResponse<TVersion>>`, so promise and observable callers share
 * one response type.
 */
type ListScopeTypesResult<
  TVersion extends ListScopeTypesVersion,
  TMethod extends ClientMethodType = 'json',
  TResult = ListScopeTypesResponse<TVersion>,
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
      const baseInit: FetchRequestInit<ListScopeTypesResponse<ApiVersion.v1>, JsonRequest> = {
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
 * Lists every scope type the Roles service publishes.
 *
 * Roles V2 operation: `GET /scope-types` — "Get all scope types."
 *
 * Curried in two stages: `listScopeTypes(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Roles service, and the execution method — `'json'` for a
 * promise, `'json$'` for an observable stream. The returned function takes
 * {@link ListScopeTypesArg} plus an optional `ClientRequestInit`, and gives back
 * {@link ListScopeTypesResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `z.array(ApiScopeTypeSchemaV1)`, and sends `api-version=1.0` on the request.
 *
 * Roles V2 answers `200 OK`; the body is typed `ApiScopeTypeV1[]`.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link ListScopeTypesArg} and an optional
 * `ClientRequestInit`, returning {@link ListScopeTypesResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { listScopeTypes } from '@equinor/fusion-services/roles';
 *
 * const page = await listScopeTypes('v1', httpClient)({});
 * ```
 */
const listScopeTypes = <
  TVersion extends ListScopeTypesVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return <
    TResponse = ListScopeTypesResponse<MethodVersion>,
    TResult = ListScopeTypesResult<MethodVersion, TMethod, TResponse>,
  >(
    input?: ListScopeTypesArg<MethodVersion>,
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
  type ListScopeTypesArg,
  type ListScopeTypesResponse,
  type ListScopeTypesResult,
  type ListScopeTypesVersion,
  listScopeTypes,
};
