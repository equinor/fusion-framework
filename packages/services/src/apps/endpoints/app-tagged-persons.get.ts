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
import { apiPagedCollectionSchemaV1 } from '../v1/schemas/api-paged-collection-schema-v1';
import { ApiTaggedPersonSchemaV1 } from '../v1/schemas/api-tagged-person-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `listAppTaggedPersons` accepts for `GET
 * /apps/{appIdentifier}/tagged-persons`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link ListAppTaggedPersonsArg} and {@link ListAppTaggedPersonsResponse}.
 */
type ListAppTaggedPersonsVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `listAppTaggedPersons`, implementing `GET
 * /apps/{appIdentifier}/tagged-persons`.
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
      })
      .describe(
        'Arguments for GET /apps/{appIdentifier}/tagged-persons (listAppTaggedPersons v1.0).',
      ),
    /** Response published by version 1.0. */
    response: apiPagedCollectionSchemaV1(ApiTaggedPersonSchemaV1),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `listAppTaggedPersons` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiPagedCollectionV1<ApiTaggedPersonV1>`, inferred from
 * `apiPagedCollectionSchemaV1(ApiTaggedPersonSchemaV1)` — the very schema that validates the `200
 * OK` body at runtime.
 */
type ListAppTaggedPersonsResponse<TVersion extends ListAppTaggedPersonsVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `listAppTaggedPersons` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifier `appIdentifier`.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type ListAppTaggedPersonsArg<TVersion extends ListAppTaggedPersonsVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `listAppTaggedPersons` hands back once the request runs, for the selected API version and
 * client method.
 *
 * `'json'` gives `Promise<ListAppTaggedPersonsResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<ListAppTaggedPersonsResponse<TVersion>>`, so promise and observable callers share
 * one response type.
 */
type ListAppTaggedPersonsResult<
  TVersion extends ListAppTaggedPersonsVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<ListAppTaggedPersonsResponse<TVersion>>[TMethod];

/** Builds the request init for the resolved version, including its response-schema selector. */
const generateRequestParameters = <TResult, TVersion extends AvailableVersions>(
  version: TVersion,
  _args: VersionedParsedArgs<typeof VersionContract, TVersion>,
  init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
  // Select the response schema that matches the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const baseInit: FetchRequestInit<ListAppTaggedPersonsResponse<ApiVersion.v1>, JsonRequest> = {
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
  args: VersionedParsedArgs<typeof VersionContract, TVersion>,
): string => {
  // Build the endpoint path according to the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const params = new URLSearchParams();
      params.append('api-version', version);
      return `/apps/${encodeURIComponent(args.appIdentifier)}/tagged-persons?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Lists the persons tagged onto a specific build of an app.
 *
 * Fusion Apps API operation: `GET /apps/{appIdentifier}/tagged-persons` — "Lists out all tagged
 * users for the app."
 *
 * Curried in two stages: `listAppTaggedPersons(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for a promise,
 * `'json$'` for an observable stream. The returned function takes {@link ListAppTaggedPersonsArg}
 * plus an optional `ClientRequestInit`, and gives back {@link ListAppTaggedPersonsResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `apiPagedCollectionSchemaV1(ApiTaggedPersonSchemaV1)`, and sends `api-version=1.0` on the
 * request.
 *
 * The Apps service answers `200 OK`; the body is typed `ApiPagedCollectionV1<ApiTaggedPersonV1>`.
 *
 * Related: `listAppTags`.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link ListAppTaggedPersonsArg} and an optional
 * `ClientRequestInit`, returning {@link ListAppTaggedPersonsResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { listAppTaggedPersons } from '@equinor/fusion-services/apps';
 *
 * const result = await listAppTaggedPersons('v1', httpClient)({ appIdentifier: 'my-app' });
 * ```
 */
const listAppTaggedPersons = <
  TVersion extends ListAppTaggedPersonsVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: ListAppTaggedPersonsArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, ListAppTaggedPersonsResponse<MethodVersion>>,
  ): ListAppTaggedPersonsResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as ListAppTaggedPersonsResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type ListAppTaggedPersonsArg,
  type ListAppTaggedPersonsResponse,
  type ListAppTaggedPersonsResult,
  type ListAppTaggedPersonsVersion,
  listAppTaggedPersons,
};
