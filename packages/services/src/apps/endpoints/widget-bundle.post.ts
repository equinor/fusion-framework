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

/** Concrete API versions this operation publishes. */
type AvailableVersions = ApiVersion.v1;

/**
 * API version identifiers `uploadWidgetBundle` accepts for `POST
 * /bundles/widgets/{widgetIdentifier}`.
 *
 * Fusion Apps publishes version 1.0 of this operation, nameable as `'v1'`, `'1.0'`, or
 * `ApiVersion.v1`. All three resolve to the same contract entry, so all three infer the same
 * {@link UploadWidgetBundleArg} and {@link UploadWidgetBundleResponse}.
 */
type UploadWidgetBundleVersion = FilterAllowedApiVersions<AvailableVersions>;

/**
 * Version contract for `uploadWidgetBundle`, implementing `POST
 * /bundles/widgets/{widgetIdentifier}`.
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
        /** Unique identifier (widget id or widgetKey). */
        widgetIdentifier: z.string().describe('Unique identifier (widget id or widgetKey).'),
      })
      .describe(
        'Arguments for POST /bundles/widgets/{widgetIdentifier} (uploadWidgetBundle v1.0).',
      ),
    /** Response published by version 1.0. The operation answers `201 Created` without a body. */
    response: z.void(),
  },
} as const satisfies ApiVersionContract;

/**
 * Response body `uploadWidgetBundle` resolves for the selected API version.
 *
 * Version 1.0 answers `201 Created` without a body, so the type resolves to `void`.
 */
type UploadWidgetBundleResponse<TVersion extends UploadWidgetBundleVersion> = VersionedResponse<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * Arguments `uploadWidgetBundle` accepts, resolved from the selected API version.
 *
 * Version 1.0 accepts the path identifier `widgetIdentifier`.
 *
 * The value is parsed by the version's Zod argument schema before the request is built, so defaults
 * and range checks apply up front.
 */
type UploadWidgetBundleArg<TVersion extends UploadWidgetBundleVersion> = VersionedArgs<
  typeof VersionContract,
  ExtractApiVersion<TVersion>
>;

/**
 * What `uploadWidgetBundle` hands back once the request runs, for the selected API version and
 * client method.
 *
 * `'json'` gives `Promise<UploadWidgetBundleResponse<TVersion>>` and `'json$'` gives
 * `StreamResponse<UploadWidgetBundleResponse<TVersion>>`, so promise and observable callers share
 * one response type.
 */
type UploadWidgetBundleResult<
  TVersion extends UploadWidgetBundleVersion,
  TMethod extends ClientMethodType = 'json',
> = ClientMethod<UploadWidgetBundleResponse<TVersion>>[TMethod];

/** Builds the request init for the resolved version, including its response-schema selector. */
const generateRequestParameters = <TResult, TVersion extends AvailableVersions>(
  version: TVersion,
  _args: VersionedParsedArgs<typeof VersionContract, TVersion>,
  init?: ClientRequestInit<IHttpClient, TResult>,
): ClientRequestInit<IHttpClient, TResult> => {
  // Select the response schema that matches the requested API version.
  switch (version) {
    case ApiVersion.v1: {
      const baseInit: FetchRequestInit<UploadWidgetBundleResponse<ApiVersion.v1>, JsonRequest> = {
        method: 'POST',
        selector: emptyResponseSelector,
        // The bundle payload is not part of the JSON contract, so the caller supplies it through `init`.
      };
      // Apply the caller-supplied `init` first, then the generated defaults, so the generated
      // `method` and version-specific response `selector` always win and cannot be overridden or
      // bypassed.
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
      return `/bundles/widgets/${encodeURIComponent(args.widgetIdentifier)}?${String(params)}`;
    }
  }
  throw Error(`Unknown API version: ${version}`);
};

/**
 * Registers a new widget build.
 *
 * Fusion Apps API operation: `POST /bundles/widgets/{widgetIdentifier}` — "Registers a new widget
 * build."
 *
 * Curried in two stages: `uploadWidgetBundle(version, client, method)` binds the API version, the
 * `IHttpClient` that reaches the Apps service, and the execution method — `'json'` for a promise,
 * `'json$'` for an observable stream. The returned function takes {@link UploadWidgetBundleArg}
 * plus an optional `ClientRequestInit`, and gives back {@link UploadWidgetBundleResult}.
 *
 * The version argument is the single discriminator: `'v1'` — equivalently `'1.0'` or
 * `ApiVersion.v1` — selects the version-1.0 argument schema, checks the response status, and sends
 * `api-version=1.0` on the request.
 *
 * The Apps service answers `201 Created` without a body, so the result resolves to `void` once the
 * response status is accepted. The contract declares `403 Forbidden` for callers the Apps service
 * does not authorise for this operation.
 *
 * The bundle payload itself is outside the JSON contract: pass it as the `body` of the optional
 * `ClientRequestInit`, together with the content type the service expects.
 *
 * Related: `listWidgetBuilds`, `createWidget`.
 *
 * @template TVersion - Apps API version identifier: `'v1'`, `'1.0'`, or `ApiVersion.v1`.
 * @template TMethod - Execution method: `'json'` for a promise, `'json$'` for an observable.
 * @param version - API version selecting the request path, the argument schema, and the
 * response schema.
 * @param client - HTTP client that executes the request against the Apps service.
 * @param method - Execution method, defaulting to `'json'`.
 * @returns A request function taking {@link UploadWidgetBundleArg} and an optional
 * `ClientRequestInit`, returning {@link UploadWidgetBundleResult}.
 * @throws {Error} When `version` names an API version this operation does not publish. The
 * check runs while binding, before the HTTP client is used.
 * @throws {z.ZodError} From the returned function, when the arguments fail this version's
 * argument schema or the response body fails its response schema.
 *
 * @example
 * ```ts
 * import { uploadWidgetBundle } from '@equinor/fusion-services/apps';
 *
 * await uploadWidgetBundle('v1', httpClient)({ widgetIdentifier: 'my-widget' }, {
 *   body: bundleArchive,
 *   headers: { 'content-type': 'application/zip' },
 * });
 * ```
 */
const uploadWidgetBundle = <
  TVersion extends UploadWidgetBundleVersion,
  TMethod extends ClientMethodType = 'json',
>(
  version: TVersion,
  client: IHttpClient,
  method: TMethod = 'json' as TMethod,
) => {
  type MethodVersion = ExtractApiVersion<TVersion>;
  const apiVersion = extractVersion(ApiVersion, version);
  return (
    input: UploadWidgetBundleArg<MethodVersion>,
    init?: ClientRequestInit<IHttpClient, UploadWidgetBundleResponse<MethodVersion>>,
  ): UploadWidgetBundleResult<MethodVersion, TMethod> => {
    const args = parseVersionedArgs(VersionContract, apiVersion, input);
    return client[method](
      generateApiPath(apiVersion, args),
      generateRequestParameters(apiVersion, args, init),
    ) as UploadWidgetBundleResult<MethodVersion, TMethod>;
  };
};

// Every symbol is declared under its public name so hover and code completion show this
// endpoint's own documentation. They are exported in one block rather than inline because an
// inline `export const` would require renaming the file away from the `<resource>.<verb>`
// convention that mirrors the OpenAPI operation it implements.
// fusion-lint-disable-next-line no-separate-export
export {
  type UploadWidgetBundleArg,
  type UploadWidgetBundleResponse,
  type UploadWidgetBundleResult,
  type UploadWidgetBundleVersion,
  uploadWidgetBundle,
};
