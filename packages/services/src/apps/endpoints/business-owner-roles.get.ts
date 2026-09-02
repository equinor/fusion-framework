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
import { ApiBusinessOwnerRoleSchemaV1 } from '../v1/schemas/api-business-owner-role-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `listBusinessOwnerRoles` accepts for `GET
 * /libraries/business-owner-roles`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link ListBusinessOwnerRolesArg} and {@link ListBusinessOwnerRolesResponse}.
 */
type ListBusinessOwnerRolesVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `listBusinessOwnerRoles`, implementing `GET
 * /libraries/business-owner-roles`.
 *
 * Each concrete {@link ApiVersion} maps to the argument and response schemas that version
 * publishes, so the version a caller passes is the single discriminator for the request shape, the
 * request path, and the response shape.
 */
const VersionContract = {
  [ApiVersion.v1]: {
    /** Arguments accepted by version 1.0 of this operation. */
    args: z
      .object({})
      .describe('Arguments for GET /libraries/business-owner-roles (listBusinessOwnerRoles v1.0).'),
    /** Response published by version 1.0. */
    response: z.array(ApiBusinessOwnerRoleSchemaV1),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `listBusinessOwnerRoles` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiBusinessOwnerRoleV1[]`, inferred from
 * `z.array(ApiBusinessOwnerRoleSchemaV1)` — the very schema that validates the `200 OK` body at
 * runtime.
 */
type ListBusinessOwnerRolesResponse<TVersion extends ListBusinessOwnerRolesVersion> =
  VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `listBusinessOwnerRoles` accepts, resolved from the selected API version.
 *
 * Version 1.0 takes no arguments beyond the API version itself.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type ListBusinessOwnerRolesArg<TVersion extends ListBusinessOwnerRolesVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `listBusinessOwnerRoles` hands back once the request runs, for the selected API version and
 * client method.
 *
 * `'json'` gives `Promise<ListBusinessOwnerRolesResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<ListBusinessOwnerRolesResponse<TVersion>>`, so promise and observable callers
 * share one response type.
 */
type ListBusinessOwnerRolesResult<
  TVersion extends ListBusinessOwnerRolesVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<ListBusinessOwnerRolesResponse<TVersion>>[TMethod];

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
        ListBusinessOwnerRolesResponse<ApiVersion.v1>,
        JsonRequest
      > = {
        selector: versionedResponseSelector(VersionContract, version),
      };
      // Apply the caller-supplied `init` first, then the generated defaults, so the generated
      // version-specific response `selector` always wins and cannot be overridden or bypassed.
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
      return `/libraries/business-owner-roles?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Returns all valid business owner roles.
 *
 * Fusion Apps API operation: `GET /libraries/business-owner-roles` — "Returns all valid business
 * owner roles."
 *
 * Curried in two stages: `listBusinessOwnerRoles(version, client, method)` binds the API version,
 * the `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for a
 * promise, `'json$'` for an observable stream. The returned function takes
 * {@link ListBusinessOwnerRolesArg} plus an optional `ClientRequestInit`, and gives back
 * {@link ListBusinessOwnerRolesResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `z.array(ApiBusinessOwnerRoleSchemaV1)`, and sends `api-version=1.0` on the request.
 *
 * The Apps service answers `200 OK`; the body is typed `ApiBusinessOwnerRoleV1[]`.
 *
 * Related: `updateAppGovernance`.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link ListBusinessOwnerRolesArg} and an optional
 * `ClientRequestInit`, returning {@link ListBusinessOwnerRolesResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { listBusinessOwnerRoles } from '@equinor/fusion-services/apps';
 *
 * const result = await listBusinessOwnerRoles('v1', httpClient)();
 * ```
 */
const listBusinessOwnerRoles = <
  TVersion extends ListBusinessOwnerRolesVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input?: ListBusinessOwnerRolesArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, ListBusinessOwnerRolesResponse<MethodVersion>>,
  ): ListBusinessOwnerRolesResult<MethodVersion, TMethod> => {
    // The operation has no required arguments, so an omitted argument object parses as empty.
    const args = parseVersionedArgs(VersionContract, apiVersion, input ?? {});
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as ListBusinessOwnerRolesResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type ListBusinessOwnerRolesArg,
  type ListBusinessOwnerRolesResponse,
  type ListBusinessOwnerRolesResult,
  type ListBusinessOwnerRolesVersion,
  listBusinessOwnerRoles,
};
