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
import { ApiPersonAppSchemaV1 } from '../v1/schemas/api-person-app-schema-v1';
import { CreatePersonAppTagRequestSchemaV1 } from '../v1/schemas/create-person-app-tag-request-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `setPersonAppTag` accepts for `PUT
 * /persons/{accountIdentifier}/apps/{appIdentifier}/tag`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link SetPersonAppTagArg} and {@link SetPersonAppTagResponse}.
 */
type SetPersonAppTagVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `setPersonAppTag`, implementing `PUT
 * /persons/{accountIdentifier}/apps/{appIdentifier}/tag`.
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
        /** Azure unique id or email. */
        accountIdentifier: z.string().describe('Azure unique id or email.'),
        /** Unique identifier (app id or appKey). */
        appIdentifier: z.string().describe('Unique identifier (app id or appKey).'),
        ...CreatePersonAppTagRequestSchemaV1.shape,
      })
      .describe(
        'Arguments for PUT /persons/{accountIdentifier}/apps/{appIdentifier}/tag (setPersonAppTag v1.0).',
      ),
    /** Response published by version 1.0. */
    response: ApiPersonAppSchemaV1,
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `setPersonAppTag` resolves for the selected API version.
 *
 * Version 1.0 resolves to `ApiPersonAppV1`, inferred from `ApiPersonAppSchemaV1` — the very schema
 * that validates the `200 OK` body at runtime.
 */
type SetPersonAppTagResponse<TVersion extends SetPersonAppTagVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `setPersonAppTag` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifiers `accountIdentifier`, `appIdentifier`, and the request
 * body fields of `CreatePersonAppTagRequestV1`. Path identifiers and body fields share one flat
 * object; the endpoint separates them when it builds the request.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type SetPersonAppTagArg<TVersion extends SetPersonAppTagVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `setPersonAppTag` hands back once the request runs, for the selected API version and client
 * method.
 *
 * `'json'` gives `Promise<SetPersonAppTagResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<SetPersonAppTagResponse<TVersion>>`, so promise and observable callers share one
 * response type.
 */
type SetPersonAppTagResult<
  TVersion extends SetPersonAppTagVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<SetPersonAppTagResponse<TVersion>>[TMethod];

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
      const {
        accountIdentifier: _accountIdentifier,
        appIdentifier: _appIdentifier,
        ...body
      } = args;
      const baseInit: FetchRequestInit<SetPersonAppTagResponse<ApiVersion.v1>, JsonRequest> = {
        method: 'PUT',
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
      return `/persons/${encodeURIComponent(args.accountIdentifier)}/apps/${encodeURIComponent(args.appIdentifier)}/tag?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Overrides which app build a person receives by default.
 *
 * Fusion Apps API operation: `PUT /persons/{accountIdentifier}/apps/{appIdentifier}/tag` — "Use
 * this endpoint to override which app build person will get by default."
 *
 * Curried in two stages: `setPersonAppTag(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for a promise,
 * `'json$'` for an observable stream. The returned function takes {@link SetPersonAppTagArg} plus
 * an optional `ClientRequestInit`, and gives back {@link SetPersonAppTagResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, validates the response with
 * `ApiPersonAppSchemaV1`, and sends `api-version=1.0` on the request.
 *
 * The Apps service answers `200 OK`; the body is typed `ApiPersonAppV1`. The contract declares `403
 * Forbidden` for callers the Apps service does not authorise for this operation.
 *
 * Related: `deletePersonAppTag`, `getPersonApp`.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link SetPersonAppTagArg} and an optional
 * `ClientRequestInit`, returning {@link SetPersonAppTagResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { setPersonAppTag } from '@equinor/fusion-services/apps';
 *
 * const result = await setPersonAppTag('v1', httpClient)({
 *   accountIdentifier: 'user@equinor.com',
 *   appIdentifier: 'my-app',
 *   tag: 'preview',
 * });
 * ```
 */
const setPersonAppTag = <
  TVersion extends SetPersonAppTagVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: SetPersonAppTagArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, SetPersonAppTagResponse<MethodVersion>>,
  ): SetPersonAppTagResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as SetPersonAppTagResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type SetPersonAppTagArg,
  type SetPersonAppTagResponse,
  type SetPersonAppTagResult,
  type SetPersonAppTagVersion,
  setPersonAppTag,
};
