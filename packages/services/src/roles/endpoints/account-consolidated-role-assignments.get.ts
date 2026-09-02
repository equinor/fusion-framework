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
import { ApiConsolidatedRoleAssignmentSchemaV1 } from '../v1/schemas/api-consolidated-role-assignment-schema-v1';
import { ExpandSchemaV1 } from '../v1/schemas/expand-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `listAccountConsolidatedRoleAssignments` accepts for
 * `GET /accounts/{accountIdentifier}/consolidated-role-assignments`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link ListAccountConsolidatedRoleAssignmentsArg} and
 * {@link ListAccountConsolidatedRoleAssignmentsResponse}.
 */
type ListAccountConsolidatedRoleAssignmentsVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `listAccountConsolidatedRoleAssignments`, implementing
 * `GET /accounts/{accountIdentifier}/consolidated-role-assignments`.
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
        /** Fusion account identifier or supported alternate account identifier. */
        accountIdentifier: z
          .string()
          .describe('Fusion account identifier or supported alternate account identifier.'),
        /** Related resources to include in the response. */
        expand: ExpandSchemaV1,
      })
      .describe(
        'Arguments for GET /accounts/{accountIdentifier}/consolidated-role-assignments (listAccountConsolidatedRoleAssignments v1.0).',
      ),
    /** Response published by version 1.0 of this operation. */
    response: z.array(ApiConsolidatedRoleAssignmentSchemaV1),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `listAccountConsolidatedRoleAssignments` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiConsolidatedRoleAssignmentV1[]`, inferred from
 * `z.array(ApiConsolidatedRoleAssignmentSchemaV1)` — the very schema that validates the `200
 * OK` body at runtime.
 */
type ListAccountConsolidatedRoleAssignmentsResponse<
  TVersion extends ListAccountConsolidatedRoleAssignmentsVersion,
> = VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `listAccountConsolidatedRoleAssignments` accepts, resolved from the selected API
 * version.
 *
 * Version 1.0 accepts the path identifier `accountIdentifier`, and the optional query options
 * `expand`.
 *
 * The value is parsed by the version's Zod argument schema before the request path is built, so
 * defaults and range checks apply up front.
 */
type ListAccountConsolidatedRoleAssignmentsArg<
  TVersion extends ListAccountConsolidatedRoleAssignmentsVersion,
> = VersionedArgs<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * What `listAccountConsolidatedRoleAssignments` hands back once the request runs, for the
 * selected API version and client method.
 *
 * `'json'` gives `Promise<ListAccountConsolidatedRoleAssignmentsResponse<TVersion>>` and
 * `'json$'` gives `StreamResponse<ListAccountConsolidatedRoleAssignmentsResponse<TVersion>>`,
 * so promise and observable callers share one response type.
 */
type ListAccountConsolidatedRoleAssignmentsResult<
  TVersion extends ListAccountConsolidatedRoleAssignmentsVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<ListAccountConsolidatedRoleAssignmentsResponse<TVersion>>[TMethod];

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
        ListAccountConsolidatedRoleAssignmentsResponse<ApiVersion.v1>,
        JsonRequest
      > = {
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
  args: VersionedParsedArgs<typeof VersionContract, TVersion>,
): string => {
  // Build the endpoint path according to the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const params = new URLSearchParams();
      params.append('api-version', version);
      args.expand !== undefined && params.append('$expand', args.expand);
      return `/accounts/${encodeURIComponent(args.accountIdentifier)}/consolidated-role-assignments?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Lists one account's role assignments consolidated, merging duplicates that share role, type,
 * and scope into a single entry.
 *
 * Roles V2 operation: `GET /accounts/{accountIdentifier}/consolidated-role-assignments` — "Get
 * consolidated role assignments for an account. Duplicate assignments for the same role, type
 * and scope are merged into a single entry."
 *
 * Curried in two stages: `listAccountConsolidatedRoleAssignments(version, client, method)`
 * binds the API version, the `IHttpClient` that reaches the Roles service, and the execution
 * method — `'json'` for a promise, `'json$'` for an observable stream. The returned function
 * takes {@link ListAccountConsolidatedRoleAssignmentsArg} plus an optional `ClientRequestInit`,
 * and gives back {@link ListAccountConsolidatedRoleAssignmentsResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `z.array(ApiConsolidatedRoleAssignmentSchemaV1)`, and sends `api-version=1.0` on the request.
 *
 * Query options: `expand` is sent as `$expand` to inline related resources.
 *
 * Roles V2 answers `200 OK`; the body is typed `ApiConsolidatedRoleAssignmentV1[]`.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link ListAccountConsolidatedRoleAssignmentsArg} and an
 * optional `ClientRequestInit`, returning {@link ListAccountConsolidatedRoleAssignmentsResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { listAccountConsolidatedRoleAssignments } from '@equinor/fusion-services/roles';
 *
 * const page = await listAccountConsolidatedRoleAssignments('v1', httpClient)({
 *   accountIdentifier: 'user@equinor.com',
 * });
 * ```
 */
const listAccountConsolidatedRoleAssignments = <
  TVersion extends ListAccountConsolidatedRoleAssignmentsVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: ListAccountConsolidatedRoleAssignmentsArg<MethodVersion>,
    init?: ClientRequestInit<
      IHttpClient,
      ListAccountConsolidatedRoleAssignmentsResponse<MethodVersion>
    >,
  ): ListAccountConsolidatedRoleAssignmentsResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as ListAccountConsolidatedRoleAssignmentsResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type ListAccountConsolidatedRoleAssignmentsArg,
  type ListAccountConsolidatedRoleAssignmentsResponse,
  type ListAccountConsolidatedRoleAssignmentsResult,
  type ListAccountConsolidatedRoleAssignmentsVersion,
  listAccountConsolidatedRoleAssignments,
};
