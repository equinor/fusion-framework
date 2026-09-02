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

import { emptyResponseSelector, extractVersion, parseVersionedArgs } from '../../utils';
import { ApiVersion } from '../static';
import { CreateAppRequestSchemaV1 } from '../v1/schemas/create-app-request-schema-v1';

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `createApp` accepts for `POST /apps`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link CreateAppArg} and {@link CreateAppResponse}.
 */
type CreateAppVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `createApp`, implementing `POST /apps`.
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
        ...CreateAppRequestSchemaV1.shape,
      })
      .describe('Arguments for POST /apps (createApp v1.0).'),
    /** Response published by version 1.0. The operation answers `201 Created` without a body. */
    response: z.void(),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `createApp` resolves for the selected API version.
 *
 * Version 1.0 answers `201 Created` without a body, so the type resolves to `void`.
 */
type CreateAppResponse<TVersion extends CreateAppVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `createApp` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the request body fields of `CreateAppRequestV1`.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type CreateAppArg<TVersion extends CreateAppVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `createApp` hands back once the request runs, for the selected API version and client
 * method.
 *
 * `'json'` gives `Promise<CreateAppResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<CreateAppResponse<TVersion>>`, so promise and observable callers share one
 * response type.
 */
type CreateAppResult<
  TVersion extends CreateAppVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<CreateAppResponse<TVersion>>[TMethod];

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
      const baseInit: FetchRequestInit<CreateAppResponse<ApiVersion.v1>, JsonRequest> = {
        method: 'POST',
        selector: emptyResponseSelector,
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
  _args: VersionedParsedArgs<typeof VersionContract, TVersion>,
): string => {
  // Build the endpoint path according to the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const params = new URLSearchParams();
      params.append('api-version', version);
      return `/apps?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Registers an app.
 *
 * Fusion Apps API operation: `POST /apps` — "Registers an app."
 *
 * Curried in two stages: `createApp(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for a promise,
 * `'json$'` for an observable stream. The returned function takes {@link CreateAppArg} plus an
 * optional `ClientRequestInit`, and gives back {@link CreateAppResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, checks the response status, and sends
 * `api-version=1.0` on the request.
 *
 * The Apps service answers `201 Created` without a body, so the result resolves to `void` once the
 * response status is accepted. The contract declares `403 Forbidden` for callers the Apps service
 * does not authorise for this operation.
 *
 * Related: `listApps`, `uploadAppBundle`.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link CreateAppArg} and an optional
 * `ClientRequestInit`, returning {@link CreateAppResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { createApp } from '@equinor/fusion-services/apps';
 *
 * await createApp('v1', httpClient)({ appKey: 'my-app' });
 * ```
 */
const createApp = <TVersion extends CreateAppVersion, TMethod extends ClientMethodType = 'json'>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input?: CreateAppArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, CreateAppResponse<MethodVersion>>,
  ): CreateAppResult<MethodVersion, TMethod> => {
    // The operation has no required arguments, so an omitted argument object parses as empty.
    const args = parseVersionedArgs(VersionContract, apiVersion, input ?? {});
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as CreateAppResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type CreateAppArg,
  type CreateAppResponse,
  type CreateAppResult,
  type CreateAppVersion,
  createApp,
};
