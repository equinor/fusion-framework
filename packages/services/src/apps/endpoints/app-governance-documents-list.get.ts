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
import { ApiGovernanceDocumentSchemaV1 } from '../v1/schemas/api-governance-document-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `listAppGovernanceDocuments` accepts for `GET
 * /apps/{appIdentifier}/governance/documents`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link ListAppGovernanceDocumentsArg} and {@link ListAppGovernanceDocumentsResponse}.
 */
type ListAppGovernanceDocumentsVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `listAppGovernanceDocuments`, implementing `GET
 * /apps/{appIdentifier}/governance/documents`.
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
        /** Unique identifier (app id or appkey). */
        appIdentifier: z.string().describe('Unique identifier (app id or appkey).'),
      })
      .describe(
        'Arguments for GET /apps/{appIdentifier}/governance/documents (listAppGovernanceDocuments v1.0).',
      ),
    /** Response published by version 1.0. */
    response: z.array(ApiGovernanceDocumentSchemaV1),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `listAppGovernanceDocuments` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiGovernanceDocumentV1[]`, inferred from
 * `z.array(ApiGovernanceDocumentSchemaV1)` — the very schema that validates the `200 OK` body at
 * runtime.
 */
type ListAppGovernanceDocumentsResponse<TVersion extends ListAppGovernanceDocumentsVersion> =
  VersionedResponse<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * Arguments `listAppGovernanceDocuments` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifier `appIdentifier`.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type ListAppGovernanceDocumentsArg<TVersion extends ListAppGovernanceDocumentsVersion> =
  VersionedArgs<typeof VersionContract, ExtractApiVersion<TVersion>>;

/**
 * What `listAppGovernanceDocuments` hands back once the request runs, for the selected API version
 * and client method.
 *
 * `'json'` gives `Promise<ListAppGovernanceDocumentsResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<ListAppGovernanceDocumentsResponse<TVersion>>`, so promise and observable callers
 * share one response type.
 */
type ListAppGovernanceDocumentsResult<
  TVersion extends ListAppGovernanceDocumentsVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<ListAppGovernanceDocumentsResponse<TVersion>>[TMethod];

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
        ListAppGovernanceDocumentsResponse<ApiVersion.v1>,
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
  args: VersionedParsedArgs<typeof VersionContract, TVersion>,
): string => {
  // Build the endpoint path according to the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const params = new URLSearchParams();
      params.append('api-version', version);
      return `/apps/${encodeURIComponent(args.appIdentifier)}/governance/documents?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Gets all governance documents for the specified app.
 *
 * Fusion Apps API operation: `GET /apps/{appIdentifier}/governance/documents` — "Gets all
 * governance documents for the specified app."
 *
 * Curried in two stages: `listAppGovernanceDocuments(version, client, method)` binds the API
 * version, the `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for
 * a promise, `'json$'` for an observable stream. The returned function takes
 * {@link ListAppGovernanceDocumentsArg} plus an optional `ClientRequestInit`, and gives back
 * {@link ListAppGovernanceDocumentsResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `z.array(ApiGovernanceDocumentSchemaV1)`, and sends `api-version=1.0` on the request.
 *
 * The Apps service answers `200 OK`; the body is typed `ApiGovernanceDocumentV1[]`.
 *
 * Related: `getAppGovernanceDocument`, `createAppGovernanceDocument`.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link ListAppGovernanceDocumentsArg} and an optional
 * `ClientRequestInit`, returning {@link ListAppGovernanceDocumentsResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { listAppGovernanceDocuments } from '@equinor/fusion-services/apps';
 *
 * const result = await listAppGovernanceDocuments('v1', httpClient)({ appIdentifier: 'my-app' });
 * ```
 */
const listAppGovernanceDocuments = <
  TVersion extends ListAppGovernanceDocumentsVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: ListAppGovernanceDocumentsArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, ListAppGovernanceDocumentsResponse<MethodVersion>>,
  ): ListAppGovernanceDocumentsResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as ListAppGovernanceDocumentsResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type ListAppGovernanceDocumentsArg,
  type ListAppGovernanceDocumentsResponse,
  type ListAppGovernanceDocumentsResult,
  type ListAppGovernanceDocumentsVersion,
  listAppGovernanceDocuments,
};
