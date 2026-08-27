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
import { SubscriptionRequestSchemaV1 } from '../v1/schemas/subscription-request-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `putRolesSubscription` accepts for `PUT /subscriptions/roles-v2`.
 *
 * Roles V2 publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link PutRolesSubscriptionArg} and {@link PutRolesSubscriptionResponse}.
 */
type PutRolesSubscriptionVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `putRolesSubscription`, implementing `PUT /subscriptions/roles-v2`.
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
        ...SubscriptionRequestSchemaV1.shape,
      })
      .describe('Arguments for PUT /subscriptions/roles-v2 (putRolesSubscription v1.0).'),
    /** Response published by version 1.0. The upstream spec does not publish a response schema. */
    response: z.unknown(),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `putRolesSubscription` resolves for the selected API version.
 *
 * Version 1.0 publishes no response schema in the OpenAPI contract, so the type resolves to
 * `unknown`.
 */
type PutRolesSubscriptionResponse<TVersion extends PutRolesSubscriptionVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `putRolesSubscription` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the request body fields of `SubscriptionRequestV1`.
 *
 * Path identifiers and body fields share one flat object; the endpoint separates them when it
 * builds the request. The value is parsed by the version's Zod argument schema before anything
 * is sent.
 */
type PutRolesSubscriptionArg<TVersion extends PutRolesSubscriptionVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `putRolesSubscription` hands back once the request runs, for the selected API version
 * and client method.
 *
 * `'json'` gives `Promise<PutRolesSubscriptionResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<PutRolesSubscriptionResponse<TVersion>>`, so promise and observable callers
 * share one response type.
 */
type PutRolesSubscriptionResult<
  TVersion extends PutRolesSubscriptionVersion,
  TMethod extends ClientMethodType = 'json',
  TResult = PutRolesSubscriptionResponse<TVersion>,
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
      const baseInit: FetchRequestInit<PutRolesSubscriptionResponse<ApiVersion.v1>, JsonRequest> = {
        method: 'PUT',
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
      return `/subscriptions/roles-v2?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Creates or renews a subscription to Fusion Roles V2 service events.
 *
 * Roles V2 operation: `PUT /subscriptions/roles-v2` — "Create or renew a subscription to role
 * service events."
 *
 * Curried in two stages: `putRolesSubscription(version, client, method)` binds the API version,
 * the `IHttpClient` that reaches the Roles service, and the execution method — `'json'` for a
 * promise, `'json$'` for an observable stream. The returned function takes
 * {@link PutRolesSubscriptionArg} plus an optional `ClientRequestInit`, and gives back
 * {@link PutRolesSubscriptionResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, passes the response body through
 * unvalidated (the contract publishes no response schema), and sends `api-version=1.0` on the
 * request.
 *
 * Roles V2 answers `200 OK`; the contract publishes no response schema, so the body is typed
 * `unknown`. The call is an upsert: absent subscriptions are created, existing ones renewed.
 * The contract declares `403 Forbidden` for callers the Roles service does not authorise for
 * this operation.
 *
 * @template TVersion - Roles API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Roles service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link PutRolesSubscriptionArg} and an optional
 * `ClientRequestInit`, returning {@link PutRolesSubscriptionResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { putRolesSubscription } from '@equinor/fusion-services/roles';
 *
 * const subscription = await putRolesSubscription('v1', httpClient)({
 *   identifier: 'my-app-subscription',
 *   type: 'Persistent',
 * });
 * ```
 */
const putRolesSubscription = <
  TVersion extends PutRolesSubscriptionVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return <
    TResponse = PutRolesSubscriptionResponse<MethodVersion>,
    TResult = PutRolesSubscriptionResult<MethodVersion, TMethod, TResponse>,
  >(
    input?: PutRolesSubscriptionArg<MethodVersion>,
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
  type PutRolesSubscriptionArg,
  type PutRolesSubscriptionResponse,
  type PutRolesSubscriptionResult,
  type PutRolesSubscriptionVersion,
  putRolesSubscription,
};
